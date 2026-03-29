import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { match, message, notification } from "@/server/db/schema";

export const messageRouter = createTRPCRouter({
	// ── Get all conversations ──
	getConversations: protectedProcedure.query(async ({ ctx }) => {
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
				messages: {
					limit: 1,
					orderBy: [desc(message.createdAt)],
				},
				receiver: { columns: { id: true, name: true, photos: true } },
				sender: { columns: { id: true, name: true, photos: true } },
			},
		});
		return matches.map((m) => ({
			...m,
			lastMessage: m.messages[0] ?? null,
			otherUser: m.senderId === ctx.session.user.id ? m.receiver : m.sender,
		}));
	}),

	// ── Get messages for a match ──
	getMessages: protectedProcedure
		.input(z.object({ matchId: z.string() }))
		.query(async ({ ctx, input }) => {
			const m = await ctx.db.query.match.findFirst({
				where: eq(match.id, input.matchId),
			});
			if (!m) throw new TRPCError({ code: "NOT_FOUND" });
			const isParty =
				m.senderId === ctx.session.user.id ||
				m.receiverId === ctx.session.user.id;
			if (!isParty) throw new TRPCError({ code: "FORBIDDEN" });

			const msgs = await ctx.db.query.message.findMany({
				orderBy: [asc(message.createdAt)],
				where: eq(message.matchId, input.matchId),
				with: { sender: { columns: { id: true, name: true } } },
			});

			const myId = ctx.session.user.id;
			return msgs.filter((msg) => {
				if (msg.senderId === myId && msg.deletedBySender) return false;
				if (msg.senderId !== myId && msg.deletedByReceiver) return false;
				return true;
			});
		}),

	// ── Send a message ──
	send: protectedProcedure
		.input(
			z.object({
				content: z.string().optional(),
				matchId: z.string(),
				mediaType: z.enum(["image", "audio", "emoji"]).optional(),
				mediaUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!input.content && !input.mediaUrl) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Message must have content or media",
				});
			}
			const m = await ctx.db.query.match.findFirst({
				where: eq(match.id, input.matchId),
			});
			if (!m) throw new TRPCError({ code: "NOT_FOUND" });
			if (m.status !== "accepted") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Can only chat with accepted matches",
				});
			}
			const isParty =
				m.senderId === ctx.session.user.id ||
				m.receiverId === ctx.session.user.id;
			if (!isParty) throw new TRPCError({ code: "FORBIDDEN" });

			const receiverId =
				m.senderId === ctx.session.user.id ? m.receiverId : m.senderId;
			const msgId = nanoid();

			await ctx.db.insert(message).values({
				content: input.content ?? null,
				id: msgId,
				matchId: input.matchId,
				mediaType: input.mediaType ?? null,
				mediaUrl: input.mediaUrl ?? null,
				senderId: ctx.session.user.id,
			});

			await ctx.db.insert(notification).values({
				entityId: input.matchId,
				id: nanoid(),
				message: input.content
					? `${input.content.slice(0, 60)}${input.content.length > 60 ? "…" : ""}`
					: "Sent you a media message",
				title: "New Message 💬",
				type: "message",
				userId: receiverId,
			});

			return { messageId: msgId };
		}),

	// ── Mark messages as read ──
	markRead: protectedProcedure
		.input(z.object({ matchId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(message)
				.set({ isRead: true })
				.where(eq(message.matchId, input.matchId));
		}),

	// ── Delete message for self ──
	deleteForSelf: protectedProcedure
		.input(z.object({ messageId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const msg = await ctx.db.query.message.findFirst({
				where: eq(message.id, input.messageId),
			});
			if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
			if (msg.senderId === ctx.session.user.id) {
				await ctx.db
					.update(message)
					.set({ deletedBySender: true })
					.where(eq(message.id, input.messageId));
			} else {
				await ctx.db
					.update(message)
					.set({ deletedByReceiver: true })
					.where(eq(message.id, input.messageId));
			}
		}),

	// ── Delete entire chat for both ──
	deleteChatForBoth: protectedProcedure
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
				.update(message)
				.set({ deletedByReceiver: true, deletedBySender: true })
				.where(eq(message.matchId, input.matchId));
		}),

	// ── Get unread message count ──
	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		const myId = ctx.session.user.id;
		const matches = await ctx.db.query.match.findMany({
			where: and(
				eq(match.status, "accepted"),
				or(eq(match.senderId, myId), eq(match.receiverId, myId)),
			),
		});

		let count = 0;
		for (const m of matches) {
			const unread = await ctx.db.query.message.findMany({
				where: and(eq(message.isRead, false), eq(message.matchId, m.id)),
			});
			count += unread.filter((msg) => msg.senderId !== myId).length;
		}
		return { count };
	}),
});
