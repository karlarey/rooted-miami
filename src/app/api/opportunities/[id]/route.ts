import { OpportunityError, setStatus, type OpportunityStatus } from "@/lib/opportunities";

/** PATCH /api/opportunities/:id { status } : the engineer replies, passes or blocks. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { status } = (await req.json()) as { status: OpportunityStatus };
    return Response.json(setStatus(id, status));
  } catch (e) {
    if (e instanceof OpportunityError) return Response.json({ error: e.message }, { status: e.status });
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
