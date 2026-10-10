import { likeMinded } from "@/lib/like-minded";
import type { Profile } from "@/lib/types";
import { QuestCard } from "./QuestCard";

interface Props {
  profile: Profile;
  status: (id: string) => "suggested" | "accepted" | "done";
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
}

/** "People like you are doing": quests similar members who stayed completed. */
export function LikeMinded({ profile, status, onAccept, onComplete }: Props) {
  const picks = likeMinded(profile);
  if (picks.length === 0) return null;
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">People like you are doing</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">Simulated member data</span>
      </div>
      <p className="text-sm text-muted">What engineers with your background who stayed in Miami did. Pana picks these for you.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {picks.map(({ quest, reason }) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            reasons={[reason]}
            status={status(quest.id)}
            onAccept={() => onAccept(quest.id)}
            onComplete={() => onComplete(quest.id)}
          />
        ))}
      </div>
    </section>
  );
}
