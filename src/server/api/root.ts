import { matchRouter } from "@/server/api/routers/match";
import { messageRouter } from "@/server/api/routers/message";
import { notificationRouter } from "@/server/api/routers/notification";
import { profileRouter } from "@/server/api/routers/profile";
import { reportRouter } from "@/server/api/routers/report";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
	match: matchRouter,
	message: messageRouter,
	notification: notificationRouter,
	profile: profileRouter,
	report: reportRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
