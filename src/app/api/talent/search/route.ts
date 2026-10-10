import type { Seniority, Stack } from "@/data/pay";
import type { WorkMode } from "@/lib/sharing";
import { talentCards } from "@/data/talent-visibility";
import { realTalentCards } from "@/lib/real-talent";
import { searchTalent } from "@/lib/talent-search";

/** GET /api/talent/search?stack=&seniority=&skills=a,b&workMode=&neighborhood= : opted-in engineers, shared fields only. */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const results = searchTalent({
    stack: (p.get("stack") as Stack) || undefined,
    seniority: (p.get("seniority") as Seniority) || undefined,
    workMode: (p.get("workMode") as WorkMode) || undefined,
    neighborhood: p.get("neighborhood") || undefined,
    skills: p.get("skills")?.split(",").map((s) => s.trim()).filter(Boolean),
  }, [...(await realTalentCards(p.get("company") ?? undefined)), ...talentCards]);
  return Response.json({ total: results.length, results });
}
