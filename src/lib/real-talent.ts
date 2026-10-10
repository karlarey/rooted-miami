import { db } from "@/db";
import { userData } from "@/db/schema";
import type { TalentCard } from "@/data/talent-visibility";
import { levelFor } from "@/lib/progress";
import type { SharingPreferences } from "@/lib/sharing";
import type { Journey } from "@/lib/use-journey";

/**
 * Real Rooted accounts that opted in to company messages, as Talent Finder
 * cards. Only fields the engineer chose to share; never check-ins, wellbeing
 * or intent to stay. Engineers who are paused, or who haven't shared a stack
 * and seniority, are left out.
 */
export async function realTalentCards(company?: string): Promise<TalentCard[]> {
  const rows = await db.select().from(userData);
  const cards: TalentCard[] = [];
  for (const row of rows) {
    const sharing = row.sharing as SharingPreferences | null;
    const journey = row.journey as Journey | null;
    if (!sharing?.openToMessages || sharing.paused) continue;
    const { stack, seniority } = sharing.shared;
    if (!stack || !seniority) continue;
    if (company && (sharing.hiddenFrom ?? []).some((c) => c.toLowerCase() === company.toLowerCase())) continue;

    cards.push({
      engineerId: `user:${row.userId}`,
      headline:
        sharing.shared.headline ||
        `${seniority[0].toUpperCase()}${seniority.slice(1)} ${stack} engineer${sharing.shareName && journey ? ` · ${journey.profile.name}` : ""}`,
      stack,
      seniority,
      skills: sharing.shared.skills,
      neighborhood: sharing.shared.neighborhood ?? journey?.profile.livesIn ?? "Miami",
      workModes: sharing.shared.workModes,
      level: levelFor(journey?.profile.completedQuests ?? []),
      yearsInMiami: Math.round(((journey?.profile.monthsInMiami ?? 0) / 12) * 10) / 10,
      mentorsStudents: (journey?.profile.completedQuests ?? []).includes("first-mentee-coffee"),
      aiTrained: (journey?.profile.completedQuests ?? []).includes("ai-training"),
      shippedProjects: (journey?.profile.completedQuests ?? []).includes("ship-hackathon-project") ? 1 : 0,
      languages: journey?.profile.languages ?? [],
    });
  }
  return cards;
}
