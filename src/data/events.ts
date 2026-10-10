import { quests } from "./quests";

/**
 * Dated occurrences of quests, so engineers can sign up and see a calendar.
 * SAMPLE SCHEDULE for the demo: times are illustrative, not confirmed with
 * the organizations named in quests. The UI must label it.
 */
export interface RootedEvent {
  id: string;
  questId: string;
  title: string;
  start: string; // ISO local time, Miami
  durationMinutes: number;
  place: string;
}

/** Weekday (0 = Sunday) and time for recurring quests. */
const recurring: Record<string, { day: number; time: string; place?: string }> = {
  "crandon-tennis": { day: 6, time: "09:00" },
  "brickell-run-club": { day: 2, time: "18:30", place: "Brickell" },
  "pickleball-drop-in": { day: 4, time: "19:00" },
  "lummus-volleyball": { day: 0, time: "10:00" },
  "salsa-class": { day: 3, time: "19:30", place: "Little Havana" },
  "hack-night": { day: 3, time: "18:30" },
  "open-source-night": { day: 4, time: "18:30", place: "Wynwood" },
  "ai-training": { day: 2, time: "18:00" },
  "senior-peer-circle": { day: 1, time: "19:00", place: "Brickell" },
  "domino-park": { day: 6, time: "16:00" },
  "rickenbacker-ride": { day: 0, time: "07:00" },
  "research-project": { day: 5, time: "17:00" },
};

/** One-off events on specific days from the start date. */
const oneOff: { questId: string; inDays: number; time: string; title?: string; place?: string }[] = [
  { questId: "host-newcomer-dinner", inDays: 6, time: "19:30", title: "Newcomer dinner (Rooted)", place: "Wynwood" },
  { questId: "ai-hackathon", inDays: 13, time: "09:00", title: "Miami AI hackathon weekend" },
  { questId: "waterkeeper-cleanup", inDays: 8, time: "08:30" },
  { questId: "first-mentee-coffee", inDays: 4, time: "08:00", title: "Mentee coffee: FIU / MDC student" },
  { questId: "code-art-workshop", inDays: 15, time: "10:00" },
  { questId: "lightning-talk", inDays: 18, time: "19:00", title: "Lightning talks night" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function buildEvents(from: Date = new Date(), weeks = 3): RootedEvent[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const events: RootedEvent[] = [];

  for (const [questId, r] of Object.entries(recurring)) {
    const q = quests.find((x) => x.id === questId);
    if (!q) continue;
    const first = new Date(start);
    first.setDate(start.getDate() + ((r.day - start.getDay() + 7) % 7));
    for (let w = 0; w < weeks; w++) {
      const d = new Date(first);
      d.setDate(first.getDate() + w * 7);
      events.push({
        id: `${questId}-${isoDay(d)}`,
        questId,
        title: q.title,
        start: `${isoDay(d)}T${r.time}`,
        durationMinutes: q.timeMinutes,
        place: r.place ?? q.place ?? q.neighborhood,
      });
    }
  }

  for (const o of oneOff) {
    const q = quests.find((x) => x.id === o.questId);
    if (!q) continue;
    const d = new Date(start);
    d.setDate(start.getDate() + o.inDays);
    events.push({
      id: `${o.questId}-${isoDay(d)}`,
      questId: o.questId,
      title: o.title ?? q.title,
      start: `${isoDay(d)}T${o.time}`,
      durationMinutes: Math.min(q.timeMinutes, 600),
      place: o.place ?? q.place ?? q.neighborhood,
    });
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}
