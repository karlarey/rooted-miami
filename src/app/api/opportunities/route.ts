import { createOpportunity, listOpportunities, OpportunityError, type NewOpportunity } from "@/lib/opportunities";

/** POST /api/opportunities : a company's first message. Validates pay band, work mode and rate limit. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NewOpportunity;
    return Response.json(createOpportunity(body), { status: 201 });
  } catch (e) {
    if (e instanceof OpportunityError) return Response.json({ error: e.message }, { status: e.status });
    return Response.json({ error: "Couldn't send. Check the form and try again." }, { status: 400 });
  }
}

/** GET /api/opportunities?companyId=&engineerId=&status= : sent list (company) or inbox (engineer). */
export function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  return Response.json(
    listOpportunities({
      companyId: p.get("companyId") ?? undefined,
      engineerId: p.get("engineerId") ?? undefined,
      status: p.get("status") ?? undefined,
    }),
  );
}
