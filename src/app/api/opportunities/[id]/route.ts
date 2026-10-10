import { canActAsEngineer } from "@/lib/engineer-session";
import { getOpportunity, OpportunityError, setStatus, type OpportunityStatus } from "@/lib/opportunities";

/** PATCH /api/opportunities/:id { status } : the engineer passes or blocks. Replies go to /messages. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const o = await getOpportunity(id);
    if (!(await canActAsEngineer(o.engineerId))) return Response.json({ error: "Not allowed" }, { status: 403 });
    const { status } = (await req.json()) as { status: OpportunityStatus };
    return Response.json(await setStatus(id, status));
  } catch (e) {
    if (e instanceof OpportunityError) return Response.json({ error: e.message }, { status: e.status });
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
