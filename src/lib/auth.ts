import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

const linkedin =
  process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
    ? { linkedin: { clientId: process.env.LINKEDIN_CLIENT_ID, clientSecret: process.env.LINKEDIN_CLIENT_SECRET } }
    : {};

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  // LinkedIn sign-in turns on once LINKEDIN_CLIENT_ID / _SECRET are set.
  socialProviders: linkedin,
});

export const linkedinEnabled = "linkedin" in linkedin;
