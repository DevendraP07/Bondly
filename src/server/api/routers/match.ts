import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, ne, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { match, notification, profileView, user } from "@/server/db/schema";

export const matchRouter = createTRPCRouter({
	// ── Get my accepted matches ──
	getMyMatches: protectedProcedure.query(async ({ ctx }) => {
		const matches = await ctx.db.query.match.findMany({
			orderBy: [desc(match.updatedAt)],
			where: and(
				eq(match.status, "accepted"),
				or(
					eq(match.senderId, ctx.session.user.id),
					eq(match.receiverId, ctx.session.user.id),
				),
			),
			with: {
				receiver: {
					columns: {
						bio: true,
						deletedAt: true,
						gender: true,
						id: true,
						name: true,
						photos: true,
					},
				},
				sender: {
					columns: {
						bio: true,
						deletedAt: true,
						gender: true,
						id: true,
						name: true,
						photos: true,
					},
				},
			},
		});
		return matches.map((m) => ({
			...m,
			otherUser: m.senderId === ctx.session.user.id ? m.receiver : m.sender,
		}));
	}),

	// ── Get pending requests received ──
	getPendingReceived: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.match.findMany({
			orderBy: [desc(match.createdAt)],
			where: and(
				eq(match.receiverId, ctx.session.user.id),
				eq(match.status, "pending"),
			),
			with: {
				sender: {
					columns: {
						bio: true,
						dob: true,
						gender: true,
						id: true,
						name: true,
						photos: true,
					},
				},
			},
		});
	}),

	// ── Get full match history ──
	getHistory: protectedProcedure.query(async ({ ctx }) => {
		const matches = await ctx.db.query.match.findMany({
			orderBy: [desc(match.updatedAt)],
			where: or(
				eq(match.senderId, ctx.session.user.id),
				eq(match.receiverId, ctx.session.user.id),
			),
			with: {
				receiver: { columns: { id: true, name: true, photos: true } },
				sender: { columns: { id: true, name: true, photos: true } },
			},
		});
		return matches.map((m) => ({
			...m,
			otherUser: m.senderId === ctx.session.user.id ? m.receiver : m.sender,
		}));
	}),

	// ── Discover profiles ──
	discover: protectedProcedure
		.input(
			z
				.object({
					gender: z.string().optional(),
					maxAge: z.number().optional(),
					minAge: z.number().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			// Build set of already-interacted IDs to exclude
			const interacted = await ctx.db.query.match.findMany({
				columns: { receiverId: true, senderId: true },
				where: or(
					eq(match.senderId, ctx.session.user.id),
					eq(match.receiverId, ctx.session.user.id),
				),
			});

			const interactedIds = new Set<string>();
			interactedIds.add(ctx.session.user.id);
			for (const m of interacted) {
				interactedIds.add(m.senderId);
				interactedIds.add(m.receiverId);
			}

			// FIX 1: fetch ALL non-admin, non-deleted users
			// This includes both role="seeker" AND role="premium"
			const allUsers = await ctx.db.query.user.findMany({
				columns: {
					bio: true,
					boostExpiresAt: true,
					dob: true,
					gender: true,
					id: true,
					interests: true,
					isBlocked: true,
					isBoostActive: true,
					isPremium: true,
					lifestyle: true,
					name: true,
					photos: true,
				},
				where: and(ne(user.role, "admin"), isNull(user.deletedAt)),
			});

			// Exclude self, interacted users, and blocked users
			let result = allUsers.filter(
				(u) => !interactedIds.has(u.id) && !u.isBlocked,
			);

			// FIX 2: gender filter is FREE for all users — not premium-only
			if (input?.gender) {
				result = result.filter((u) => u.gender === input.gender);
			}

			// Age filter — premium-only restriction is enforced on the frontend
			if (input?.minAge !== undefined || input?.maxAge !== undefined) {
				const now = new Date();
				result = result.filter((u) => {
					if (!u.dob) return true;
					const age = Math.floor(
						(now.getTime() - new Date(u.dob).getTime()) /
							(365.25 * 24 * 60 * 60 * 1000),
					);
					if (input.minAge !== undefined && age < input.minAge) return false;
					if (input.maxAge !== undefined && age > input.maxAge) return false;
					return true;
				});
			}

			// Boosted profiles appear first
			result.sort((a, b) => {
				if (a.isBoostActive && !b.isBoostActive) return -1;
				if (!a.isBoostActive && b.isBoostActive) return 1;
				return 0;
			});

			return result.slice(0, 50);
		}),

	// ── Like / Superlike / Dislike ──
	sendAction: protectedProcedure
		.input(
			z.object({
				action: z.enum(["like", "superlike", "dislike"]),
				targetId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.targetId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot interact with your own profile",
				});
			}

			const existing = await ctx.db.query.match.findFirst({
				where: and(
					eq(match.senderId, ctx.session.user.id),
					eq(match.receiverId, input.targetId),
				),
			});
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "You have already interacted with this profile",
				});
			}

			// ts-expect-error — additionalFields
			const isPremium = (ctx.session.user.isPremium as boolean) ?? false;
			if (!isPremium && input.action !== "dislike") {
				const todayStart = new Date();
				todayStart.setHours(0, 0, 0, 0);
				const todayLikes = await ctx.db.query.match.findMany({
					where: and(
						eq(match.senderId, ctx.session.user.id),
						eq(match.senderAction, "like"),
					),
				});
				const todayCount = todayLikes.filter(
					(m) => m.createdAt >= todayStart,
				).length;
				if (todayCount >= 20) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"Daily like limit reached. Upgrade to Premium for unlimited likes.",
					});
				}
			}

			const matchId = nanoid();
			await ctx.db.insert(match).values({
				id: matchId,
				receiverId: input.targetId,
				senderAction: input.action,
				senderId: ctx.session.user.id,
				status: input.action === "dislike" ? "rejected" : "pending",
			});

			if (input.action !== "dislike") {
				const reverse = await ctx.db.query.match.findFirst({
					where: and(
						eq(match.receiverId, ctx.session.user.id),
						eq(match.senderId, input.targetId),
						eq(match.status, "pending"),
					),
				});

				if (reverse) {
					await ctx.db
						.update(match)
						.set({ status: "accepted", updatedAt: new Date() })
						.where(eq(match.id, matchId));
					await ctx.db
						.update(match)
						.set({ status: "accepted", updatedAt: new Date() })
						.where(eq(match.id, reverse.id));

					await ctx.db.insert(notification).values([
						{
							entityId: matchId,
							id: nanoid(),
							message: "You have a new match! Start chatting now.",
							title: "It's a Match! 💕",
							type: "match",
							userId: ctx.session.user.id,
						},
						{
							entityId: reverse.id,
							id: nanoid(),
							message: "You have a new match! Start chatting now.",
							title: "It's a Match! 💕",
							type: "match",
							userId: input.targetId,
						},
					]);
					return { matched: true };
				}

				await ctx.db.insert(notification).values({
					entityId: matchId,
					id: nanoid(),
					message:
						input.action === "superlike"
							? "Someone super-liked your profile! 🌟"
							: "Someone liked your profile!",
					title:
						input.action === "superlike"
							? "Super Like Received! 🌟"
							: "New Like ❤️",
					type: input.action === "superlike" ? "superlike" : "like",
					userId: input.targetId,
				});
			}

			return { matched: false };
		}),

	// ── Accept / Decline match request ──
	respond: protectedProcedure
		.input(z.object({ accept: z.boolean(), matchId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const m = await ctx.db.query.match.findFirst({
				where: eq(match.id, input.matchId),
			});
			if (!m) throw new TRPCError({ code: "NOT_FOUND" });
			if (m.receiverId !== ctx.session.user.id)
				throw new TRPCError({ code: "FORBIDDEN" });
			if (m.status !== "pending")
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Request already processed",
				});

			const newStatus = input.accept ? "accepted" : "rejected";
			await ctx.db
				.update(match)
				.set({ status: newStatus, updatedAt: new Date() })
				.where(eq(match.id, input.matchId));

			if (input.accept) {
				await ctx.db.insert(notification).values({
					entityId: input.matchId,
					id: nanoid(),
					message: "Your match request was accepted! Start chatting now.",
					title: "Match Accepted! 💕",
					type: "match",
					userId: m.senderId,
				});
			}
		}),

	// ── Unmatch ──
	unmatch: protectedProcedure
		.input(z.object({ matchId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const m = await ctx.db.query.match.findFirst({
				where: eq(match.id, input.matchId),
			});
			if (!m) throw new TRPCError({ code: "NOT_FOUND" });
			const isParty =
				m.senderId === ctx.session.user.id ||
				m.receiverId === ctx.session.user.id;
			if (!isParty) throw new TRPCError({ code: "FORBIDDEN" });
			await ctx.db
				.update(match)
				.set({ status: "unmatched", updatedAt: new Date() })
				.where(eq(match.id, input.matchId));
		}),

	// ── Record profile view ──
	recordView: protectedProcedure
		.input(z.object({ targetId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.targetId === ctx.session.user.id) return;
			await ctx.db.insert(profileView).values({
				id: nanoid(),
				viewedId: input.targetId,
				viewerId: ctx.session.user.id,
			});
		}),

	// ── Get who viewed me (Premium) ──
	getMyViewers: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.profileView.findMany({
			orderBy: [desc(profileView.createdAt)],
			where: eq(profileView.viewedId, ctx.session.user.id),
			with: {
				viewer: {
					columns: { gender: true, id: true, name: true, photos: true },
				},
			},
		});
	}),
});
