import { runTalentFinder } from "@/lib/talent-finder";

/** POST /api/talent-finder { request, company } : plain-language hiring request → filters, fair pay band, draft note. */
export async function POST(req: Request) {
  const { request, company } = (await req.json()) as { request?: string; company?: string };
  if (!request?.trim()) return Response.json({ error: "Describe who you're hiring." }, { status: 400 });
  try {
    return Response.json(await runTalentFinder(request.slice(0, 1000), company?.trim() || "our team"));
  } catch (e) {
    console.error("Talent Finder error:", e);
    return Response.json({ error: `Talent Finder is offline right now (${(e as Error).message}). Use the filters below.` }, { status: 502 });
  }
}
