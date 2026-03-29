import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { report } from "@/server/db/schema";

export const reportRouter = createTRPCRouter({
	// ── User: submit report ──
	create: protectedProcedure
		.input(
			z.object({
				description: z.string().optional(),
				reason: z.string().min(1),
				reportedId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.reportedId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot report yourself",
				});
			}
			await ctx.db.insert(report).values({
				description: input.description ?? null,
				id: nanoid(),
				reason: input.reason,
				reportedId: input.reportedId,
				reporterId: ctx.session.user.id,
			});
		}),

	// ── Admin: get all reports ──
	getAll: protectedProcedure.query(async ({ ctx }) => {
		// ts-expect-error — additionalFields
		if ((ctx.session.user.role as string) !== "admin")
			throw new TRPCError({ code: "FORBIDDEN" });
		return ctx.db.query.report.findMany({
			orderBy: [desc(report.createdAt)],
			with: {
				reported: { columns: { email: true, id: true, name: true } },
				reporter: { columns: { email: true, id: true, name: true } },
			},
		});
	}),

	// ── Admin: update report status ──
	resolve: protectedProcedure
		.input(
			z.object({ id: z.string(), status: z.enum(["reviewed", "resolved"]) }),
		)
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "admin")
				throw new TRPCError({ code: "FORBIDDEN" });
			await ctx.db
				.update(report)
				.set({ status: input.status, updatedAt: new Date() })
				.where(eq(report.id, input.id));
		}),
});
