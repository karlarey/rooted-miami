import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type Role = "engineer" | "company";

/* Better Auth core tables. Passwords live hashed in account.password. */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

/* Rooted app data, one row per user. JSON columns mirror the client shapes
   (Journey in src/lib/use-journey.ts, SharingPreferences in src/lib/sharing.ts). */

export const userData = sqliteTable("user_data", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  journey: text("journey", { mode: "json" }),
  sharing: text("sharing", { mode: "json" }),
  /** "engineer" (Rooted for People) and/or "company" (Rooted for Business). */
  roles: text("roles", { mode: "json" }).$type<Role[]>(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/* Company → engineer messaging (docs/messaging-contract.md). engineerId is
   "user:<id>" for real accounts, or a simulated member's id. */

export const opportunity = sqliteTable("opportunity", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull(),
  companyName: text("company_name").notNull(),
  engineerId: text("engineer_id").notNull(),
  engineerHeadline: text("engineer_headline").notNull(),
  role: text("role").notNull(),
  stack: text("stack").notNull(),
  seniority: text("seniority").notNull(),
  payMin: integer("pay_min").notNull(),
  payMax: integer("pay_max").notNull(),
  workMode: text("work_mode").notNull(),
  neighborhood: text("neighborhood"),
  message: text("message").notNull(),
  status: text("status").notNull(),
  payRisk: text("pay_risk"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/** The direct thread that opens once the engineer replies. */
export const threadMessage = sqliteTable("thread_message", {
  id: text("id").primaryKey(),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunity.id, { onDelete: "cascade" }),
  from: text("from_side").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
