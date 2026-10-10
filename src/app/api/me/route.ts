import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { userData } from "@/db/schema";
import { auth } from "@/lib/auth";

/** The signed-in user's saved journey and sharing preferences. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });
  const row = await db.query.userData.findFirst({ where: eq(userData.userId, session.user.id) });
  return Response.json({
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
    journey: row?.journey ?? null,
    sharing: row?.sharing ?? null,
  });
}

/** Save journey and/or sharing preferences (partial updates). */
export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  let body: { journey?: unknown; sharing?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (JSON.stringify(body).length > 200_000) return Response.json({ error: "Too large" }, { status: 413 });

  const patch: Partial<typeof userData.$inferInsert> = { updatedAt: new Date() };
  if (body.journey !== undefined) patch.journey = body.journey;
  if (body.sharing !== undefined) patch.sharing = body.sharing;

  await db
    .insert(userData)
    .values({ userId: session.user.id, ...patch, updatedAt: new Date() })
    .onConflictDoUpdate({ target: userData.userId, set: patch });
  return Response.json({ ok: true });
}
