import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Local dev: a SQLite file (file:local.db). Deployed: Turso, by setting
 * DATABASE_URL=libsql://… and DATABASE_AUTH_TOKEN in the environment.
 */
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
