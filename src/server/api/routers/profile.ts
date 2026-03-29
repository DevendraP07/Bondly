import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { notification, user } from "@/server/db/schema";

export const profileRouter = createTRPCRouter({
	// ── Get own profile ──
	getMe: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.user.findFirst({
			columns: {
				bio: true,
				boostExpiresAt: true,
				createdAt: true,
				dob: true,
				email: true,
				gender: true,
				id: true,
				interests: true,
				isBlocked: true,
				isBoostActive: true,
				isPremium: true,
				latitude: true,
				lifestyle: true,
				longitude: true,
				name: true,
				photos: true,
				preferences: true,
				role: true,
			},
			where: eq(user.id, ctx.session.user.id),
		});
	}),

	// ── Get another user's public profile ──
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const u = await ctx.db.query.user.findFirst({
				columns: {
					bio: true,
					dob: true,
					gender: true,
					id: true,
					interests: true,
					isBoostActive: true,
					isPremium: true,
					lifestyle: true,
					name: true,
					photos: true,
				},
				where: and(eq(user.id, input.id), isNull(user.deletedAt)),
			});
			if (!u) throw new TRPCError({ code: "NOT_FOUND" });
			return u;
		}),

	// ── Update profile ──
	update: protectedProcedure
		.input(
			z.object({
				bio: z.string().max(500).optional(),
				dob: z.string().optional(),
				gender: z
					.enum(["male", "female", "non_binary", "other", "prefer_not_to_say"])
					.optional(),
				interests: z.string().optional(),
				latitude: z.string().optional(),
				lifestyle: z.string().optional(),
				longitude: z.string().optional(),
				name: z.string().min(1).optional(),
				photos: z.string().optional(),
				preferences: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(user)
				.set({
					bio: input.bio ?? undefined,
					dob: input.dob ?? undefined,
					gender: input.gender ?? undefined,
					interests: input.interests ?? undefined,
					latitude: input.latitude ?? undefined,
					lifestyle: input.lifestyle ?? undefined,
					longitude: input.longitude ?? undefined,
					name: input.name ?? undefined,
					photos: input.photos ?? undefined,
					preferences: input.preferences ?? undefined,
					updatedAt: new Date(),
				})
				.where(eq(user.id, ctx.session.user.id));
		}),

	// ── Soft delete account ──
	deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(user)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(eq(user.id, ctx.session.user.id));
	}),

	// ── Activate profile boost (Premium only) ──
	activateBoost: protectedProcedure.mutation(async ({ ctx }) => {
		// ts-expect-error — additionalFields
		const isPremium = (ctx.session.user.isPremium as boolean) ?? false;
		if (!isPremium) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Profile boost requires Premium",
			});
		}
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);
		await ctx.db
			.update(user)
			.set({
				boostExpiresAt: expiresAt,
				isBoostActive: true,
				updatedAt: new Date(),
			})
			.where(eq(user.id, ctx.session.user.id));
	}),

	// ── Upgrade to Premium ──
	upgradePremium: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(user)
			.set({ isPremium: true, role: "premium", updatedAt: new Date() })
			.where(eq(user.id, ctx.session.user.id));

		await ctx.db.insert(notification).values({
			entityId: ctx.session.user.id,
			id: nanoid(),
			message:
				"Welcome to Bondly Premium! Enjoy unlimited likes, advanced filters, and more.",
			title: "Welcome to Premium! ✨",
			type: "boost",
			userId: ctx.session.user.id,
		});
	}),

	// ── Admin: get all users ──
	getAllUsers: protectedProcedure.query(async ({ ctx }) => {
		// ts-expect-error — additionalFields
		if ((ctx.session.user.role as string) !== "admin")
			throw new TRPCError({ code: "FORBIDDEN" });
		return ctx.db.query.user.findMany({
			columns: {
				createdAt: true,
				email: true,
				gender: true,
				id: true,
				isBlocked: true,
				isPremium: true,
				name: true,
				role: true,
			},
			orderBy: [desc(user.createdAt)],
		});
	}),

	// ── Admin: block / unblock user ──
	setBlocked: protectedProcedure
		.input(z.object({ block: z.boolean(), userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "admin")
				throw new TRPCError({ code: "FORBIDDEN" });
			await ctx.db
				.update(user)
				.set({ isBlocked: input.block, updatedAt: new Date() })
				.where(eq(user.id, input.userId));
		}),
});
