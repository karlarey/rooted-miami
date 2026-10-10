import { canActAsEngineer } from "@/lib/engineer-session";
import { addMessage, getOpportunity, OpportunityError, type ThreadMessage } from "@/lib/opportunities";

/**
 * POST /api/opportunities/:id/messages { from, body } : the direct thread.
 * The engineer's first reply opens it; the company can write once it's open.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { from, body } = (await req.json()) as { from: ThreadMessage["from"]; body: string };
    if (from !== "engineer" && from !== "company") throw new OpportunityError("from must be engineer or company.");
    const o = await getOpportunity(id);
    if (from === "engineer" && !(await canActAsEngineer(o.engineerId))) return Response.json({ error: "Not allowed" }, { status: 403 });
    return Response.json(await addMessage(id, from, body), { status: 201 });
  } catch (e) {
    if (e instanceof OpportunityError) return Response.json({ error: e.message }, { status: e.status });
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
