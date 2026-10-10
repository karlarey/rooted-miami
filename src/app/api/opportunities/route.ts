import { canActAsEngineer, sessionEngineerId } from "@/lib/engineer-session";
import { createOpportunity, listOpportunities, OpportunityError, type NewOpportunity } from "@/lib/opportunities";

/** POST /api/opportunities : a company's first message. Validates pay band, work mode and rate limit. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NewOpportunity;
    return Response.json(await createOpportunity(body), { status: 201 });
  } catch (e) {
    if (e instanceof OpportunityError) return Response.json({ error: e.message }, { status: e.status });
    return Response.json({ error: "Couldn't send. Check the form and try again." }, { status: 400 });
  }
}

/**
 * GET /api/opportunities?mine=1 : the signed-in engineer's inbox.
 * GET /api/opportunities?companyId=&engineerId=&status= : sent list (company).
 */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  if (p.get("mine")) {
    const engineerId = await sessionEngineerId();
    if (!engineerId) return Response.json({ error: "Sign in to see your messages." }, { status: 401 });
    return Response.json(await listOpportunities({ engineerId }));
  }
  const engineerId = p.get("engineerId") ?? undefined;
  if (engineerId && !(await canActAsEngineer(engineerId))) return Response.json({ error: "Not allowed" }, { status: 403 });
  return Response.json(
    await listOpportunities({
      companyId: p.get("companyId") ?? undefined,
      engineerId,
      status: p.get("status") ?? undefined,
    }),
  );
}
