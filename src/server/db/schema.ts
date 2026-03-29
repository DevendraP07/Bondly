import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["seeker", "premium", "admin"]);
export const genderEnum = pgEnum("gender", [
	"male",
	"female",
	"non_binary",
	"other",
	"prefer_not_to_say",
]);
export const matchStatusEnum = pgEnum("match_status", [
	"pending",
	"accepted",
	"rejected",
	"unmatched",
]);
export const matchActionEnum = pgEnum("match_action", [
	"like",
	"superlike",
	"dislike",
]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "audio", "emoji"]);
export const notificationTypeEnum = pgEnum("notification_type", [
	"match",
	"message",
	"like",
	"superlike",
	"system",
	"boost",
]);
export const reportStatusEnum = pgEnum("report_status", [
	"pending",
	"reviewed",
	"resolved",
]);

// ─────────────────────────────────────────────
// BETTER AUTH TABLES — DO NOT RENAME
// ─────────────────────────────────────────────
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	// Bondly fields
	role: userRoleEnum("role").default("seeker").notNull(),
	dob: text("dob"),
	gender: genderEnum("gender"),
	bio: text("bio"),
	interests: text("interests"),
	lifestyle: text("lifestyle"),
	preferences: text("preferences"),
	photos: text("photos"),
	isPremium: boolean("is_premium")
		.$defaultFn(() => false)
		.notNull(),
	isBoostActive: boolean("is_boost_active")
		.$defaultFn(() => false)
		.notNull(),
	boostExpiresAt: timestamp("boost_expires_at"),
	isBlocked: boolean("is_blocked")
		.$defaultFn(() => false)
		.notNull(),
	deletedAt: timestamp("deleted_at"),
	latitude: text("latitude"),
	longitude: text("longitude"),
	lastActive: timestamp("last_active"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────
// MATCHES
// ─────────────────────────────────────────────
export const match = pgTable(
	"match",
	{
		id: text("id").primaryKey(),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		receiverId: text("receiver_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: matchStatusEnum("status").notNull().default("pending"),
		senderAction: matchActionEnum("sender_action").notNull().default("like"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("match_sender_idx").on(t.senderId),
		index("match_receiver_idx").on(t.receiverId),
		index("match_status_idx").on(t.status),
	],
);

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────
export const message = pgTable(
	"message",
	{
		id: text("id").primaryKey(),
		matchId: text("match_id")
			.notNull()
			.references(() => match.id, { onDelete: "cascade" }),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text("content"),
		mediaUrl: text("media_url"),
		mediaType: mediaTypeEnum("media_type"),
		isRead: boolean("is_read")
			.$defaultFn(() => false)
			.notNull(),
		deletedBySender: boolean("deleted_by_sender")
			.$defaultFn(() => false)
			.notNull(),
		deletedByReceiver: boolean("deleted_by_receiver")
			.$defaultFn(() => false)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("message_match_idx").on(t.matchId),
		index("message_sender_idx").on(t.senderId),
		index("message_created_idx").on(t.createdAt),
	],
);

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const notification = pgTable(
	"notification",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: notificationTypeEnum("type").notNull().default("system"),
		title: text("title").notNull(),
		message: text("message").notNull(),
		entityId: text("entity_id"),
		isRead: boolean("is_read")
			.$defaultFn(() => false)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		readAt: timestamp("read_at"),
	},
	(t) => [
		index("notification_user_idx").on(t.userId),
		index("notification_read_idx").on(t.userId, t.isRead),
	],
);

// ─────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────
export const report = pgTable(
	"report",
	{
		id: text("id").primaryKey(),
		reporterId: text("reporter_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reportedId: text("reported_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reason: text("reason").notNull(),
		description: text("description"),
		status: reportStatusEnum("status").notNull().default("pending"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("report_reporter_idx").on(t.reporterId),
		index("report_reported_idx").on(t.reportedId),
	],
);

// ─────────────────────────────────────────────
// PROFILE VIEWS
// ─────────────────────────────────────────────
export const profileView = pgTable(
	"profile_view",
	{
		id: text("id").primaryKey(),
		viewerId: text("viewer_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		viewedId: text("viewed_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("profile_view_viewer_idx").on(t.viewerId),
		index("profile_view_viewed_idx").on(t.viewedId),
	],
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
	account: many(account),
	session: many(session),
	sentMatches: many(match, { relationName: "sentMatches" }),
	receivedMatches: many(match, { relationName: "receivedMatches" }),
	sentMessages: many(message, { relationName: "sentMessages" }),
	notifications: many(notification),
	madeReports: many(report, { relationName: "madeReports" }),
	receivedReports: many(report, { relationName: "receivedReports" }),
	viewsMade: many(profileView, { relationName: "viewsMade" }),
	viewsReceived: many(profileView, { relationName: "viewsReceived" }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const matchRelations = relations(match, ({ one, many }) => ({
	sender: one(user, {
		fields: [match.senderId],
		references: [user.id],
		relationName: "sentMatches",
	}),
	receiver: one(user, {
		fields: [match.receiverId],
		references: [user.id],
		relationName: "receivedMatches",
	}),
	messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
	match: one(match, { fields: [message.matchId], references: [match.id] }),
	sender: one(user, {
		fields: [message.senderId],
		references: [user.id],
		relationName: "sentMessages",
	}),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
	user: one(user, { fields: [notification.userId], references: [user.id] }),
}));

export const reportRelations = relations(report, ({ one }) => ({
	reporter: one(user, {
		fields: [report.reporterId],
		references: [user.id],
		relationName: "madeReports",
	}),
	reported: one(user, {
		fields: [report.reportedId],
		references: [user.id],
		relationName: "receivedReports",
	}),
}));

export const profileViewRelations = relations(profileView, ({ one }) => ({
	viewer: one(user, {
		fields: [profileView.viewerId],
		references: [user.id],
		relationName: "viewsMade",
	}),
	viewed: one(user, {
		fields: [profileView.viewedId],
		references: [user.id],
		relationName: "viewsReceived",
	}),
}));
