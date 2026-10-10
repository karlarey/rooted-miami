import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** The signed-in user's engineer id ("user:<id>", the same id Talent Finder uses), or null. */
export async function sessionEngineerId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? `user:${session.user.id}` : null;
}

/**
 * Real accounts' opportunities can only be read or changed by that account.
 * Simulated members have no owner, so the demo company can still use them.
 */
export async function canActAsEngineer(engineerId: string): Promise<boolean> {
  if (!engineerId.startsWith("user:")) return true;
  return (await sessionEngineerId()) === engineerId;
}
