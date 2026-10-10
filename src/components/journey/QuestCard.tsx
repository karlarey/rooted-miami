import { levels, packageItems } from "@/lib/levels";
import type { Quest } from "@/lib/types";

interface Props {
  quest: Quest;
  reasons?: string[];
  status: "suggested" | "accepted" | "done";
  onAccept?: () => void;
  onComplete?: () => void;
}

export function QuestCard({ quest, reasons = [], status, onAccept, onComplete }: Props) {
  const item = packageItems[quest.item];
  const hours = quest.timeMinutes >= 60 ? `${Math.round(quest.timeMinutes / 60)}h` : `${quest.timeMinutes}m`;

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        status === "done" ? "border-line bg-surface-2 opacity-75" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>
          {item.emoji} {item.name}
        </span>
        <span className="flex gap-2">
          {quest.recurring && <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-leaf">weekly</span>}
          <span>
            {levels[quest.level].emoji} · {hours}
          </span>
        </span>
      </div>

      <h3 className="mt-2 font-semibold leading-snug">{quest.title}</h3>
      <p className="mt-1 text-sm text-muted">{quest.description}</p>
      {quest.place && <p className="mt-1 text-xs text-muted">📍 {quest.place}</p>}

      {reasons.length > 0 && status !== "done" && (
        <p className="mt-2 text-xs text-brand">Why you: {reasons.slice(0, 2).join(" · ")}</p>
      )}

      <div className="mt-3">
        {status === "suggested" && (
          <button
            onClick={onAccept}
            className="rounded-full border border-brand px-4 py-1.5 text-sm font-medium text-brand hover:bg-accent-soft"
          >
            Accept quest
          </button>
        )}
        {status === "accepted" && (
          <button
            onClick={onComplete}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-on-primary hover:opacity-90"
          >
            I did it ✓
          </button>
        )}
        {status === "done" && <span className="text-sm font-medium text-leaf">Completed ✓</span>}
      </div>
    </article>
  );
}
