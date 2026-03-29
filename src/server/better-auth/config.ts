import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	user: {
		additionalFields: {
			role: { type: "string", required: true },
			dob: { type: "string", required: false },
			gender: { type: "string", required: false },
			bio: { type: "string", required: false },
			interests: { type: "string", required: false },
			lifestyle: { type: "string", required: false },
			preferences: { type: "string", required: false },
			photos: { type: "string", required: false },
			isPremium: { type: "boolean", required: false },
			isBoostActive: { type: "boolean", required: false },
			isBlocked: { type: "boolean", required: false },
			latitude: { type: "string", required: false },
			longitude: { type: "string", required: false },
		},
	},
	emailAndPassword: {
		enabled: true,
	},
});

export type Session = typeof auth.$Infer.Session;
