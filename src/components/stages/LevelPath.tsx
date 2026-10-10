import Link from "next/link";
import { quests } from "@/data/quests";
import { levelOrder, levels } from "@/lib/levels";
import { nextSteps } from "@/lib/progress";
import type { LevelId } from "@/lib/types";
import { stageCopy } from "./copy";
import { city } from "@/lib/city";

export interface LevelPathProps {
  /** Current level, usually `useJourney().level`. */
  level: LevelId;
  /** Completed quest ids, usually `journey.profile.completedQuests`. */
  completed: string[];
  /** Slim horizontal strip for the top of /journey. Default: full vertical path. */
  compact?: boolean;
}

type StageState = "done" | "current" | "upcoming";

/** Emoji grows with the stage: seed → sprout → tree → grove. */
const growth: Record<LevelId, string> = {
  seed: "text-lg",
  sprout: "text-xl",
  rooted: "text-2xl",
  grove: "text-3xl",
};

function stateOf(stage: LevelId, current: LevelId): StageState {
  const diff = levelOrder.indexOf(stage) - levelOrder.indexOf(current);
  return diff < 0 ? "done" : diff === 0 ? "current" : "upcoming";
}

function questTally(stage: LevelId, completed: string[]) {
  const inStage = quests.filter((q) => q.level === stage);
  return { done: inStage.filter((q) => completed.includes(q.id)).length, total: inStage.length };
}

export function LevelPath({ level, completed, compact = false }: LevelPathProps) {
  const steps = nextSteps(completed);
  const nextLevel = levelOrder[levelOrder.indexOf(level) + 1] as LevelId | undefined;
  return compact ? (
    <CompactPath level={level} steps={steps} nextLevel={nextLevel} />
  ) : (
    <FullPath level={level} completed={completed} steps={steps} nextLevel={nextLevel} />
  );
}

function NextSteps({ steps, nextLevel }: { steps: string[]; nextLevel?: LevelId }) {
  if (!nextLevel || steps.length === 0) {
    return <p className="text-sm text-muted">You&apos;ve reached the top. Keep welcoming the next ones.</p>;
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        To grow into {levels[nextLevel].emoji} {levels[nextLevel].name}
      </p>
      <ul className="mt-1.5 space-y-1">
        {steps.map((s) => (
          <li key={s} className="flex gap-2 text-sm text-ink">
            <span aria-hidden className="text-brand">
              →
            </span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompactPath({ level, steps, nextLevel }: { level: LevelId; steps: string[]; nextLevel?: LevelId }) {
  const current = levelOrder.indexOf(level);
  return (
    <section aria-label="Your stage" className="rounded-2xl border border-line bg-surface shadow-card p-3 sm:p-4">
      <ol className="flex items-center">
        {levelOrder.map((id, i) => {
          const state = stateOf(id, level);
          return (
            <li key={id} className={`flex items-center ${i > 0 ? "flex-1" : ""}`}>
              {i > 0 && (
                <span
                  aria-hidden
                  className={`mx-1 h-1 flex-1 rounded-full ${i <= current ? "bg-leaf" : "bg-line"}`}
                />
              )}
              <span
                aria-current={state === "current" ? "step" : undefined}
                title={`${levels[id].name}: ${levels[id].milestone}`}
                className={`grid shrink-0 place-items-center rounded-full ${
                  state === "current"
                    ? "size-10 bg-accent-soft ring-2 ring-brand"
                    : state === "done"
                      ? "size-8 bg-leaf-soft"
                      : "size-8 bg-surface-2 opacity-50 grayscale"
                }`}
              >
                <span aria-hidden className={state === "current" ? "text-xl" : "text-base"}>
                  {levels[id].emoji}
                </span>
                <span className="sr-only">
                  {levels[id].name}
                  {state === "current" ? " (you are here)" : state === "done" ? " (reached)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm text-ink">
          <span className="font-semibold">
            {levels[level].emoji} {levels[level].name}
          </span>
          <span className="text-muted"> · {levels[level].milestone}</span>
        </p>
        <Link href="/stages" className="text-xs font-medium text-leaf underline-offset-2 hover:underline">
          How stages work
        </Link>
      </div>
      {nextLevel && steps.length > 0 ? (
        <p className="mt-1 text-xs text-muted">
          Next for {levels[nextLevel].emoji}: {steps.join(" · ")}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">Top of the path. Keep welcoming the next ones.</p>
      )}
    </section>
  );
}

function FullPath({
  level,
  completed,
  steps,
  nextLevel,
}: {
  level: LevelId;
  completed: string[];
  steps: string[];
  nextLevel?: LevelId;
}) {
  return (
    <ol aria-label={`Your path to becoming a ${city.demonym}`} className="relative">
      {levelOrder.map((id, i) => {
        const state = stateOf(id, level);
        const info = levels[id];
        const tally = questTally(id, completed);
        const last = i === levelOrder.length - 1;
        return (
          <li
            key={id}
            aria-current={state === "current" ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0 sm:gap-4"
          >
            {/* Node + connector */}
            <div className="flex w-12 shrink-0 flex-col items-center">
              <span
                className={`grid size-12 place-items-center rounded-full border-2 ${
                  state === "current"
                    ? "border-brand bg-accent-soft"
                    : state === "done"
                      ? "border-leaf bg-leaf-soft"
                      : "border-line bg-surface-2"
                }`}
              >
                <span aria-hidden className={`${growth[id]} ${state === "upcoming" ? "opacity-50 grayscale" : ""}`}>
                  {info.emoji}
                </span>
              </span>
              {!last && (
                <span
                  aria-hidden
                  className={`mt-1 w-1 flex-1 rounded-full ${state === "done" ? "bg-leaf" : "bg-line"}`}
                />
              )}
            </div>

            {/* Card */}
            <div
              className={`min-w-0 flex-1 rounded-2xl border p-4 ${
                state === "current" ? "border-brand bg-surface shadow-sm" : "border-line bg-surface"
              } ${state === "upcoming" ? "opacity-80" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-lg font-semibold text-ink">{info.name}</h3>
                <span className="text-sm text-muted">· {info.milestone}</span>
                <StateBadge state={state} />
              </div>
              <p className="mt-1 text-sm text-ink">{stageCopy[id].feeling}</p>
              <p className="mt-2 text-sm text-muted">
                <span className="font-medium text-ink">Earned by: </span>
                {info.earnedBy}
              </p>
              <p className="mt-2 text-xs text-muted">
                {tally.done} of {tally.total} {info.name} quests done
              </p>
              {state === "current" && (
                <div className="mt-3 border-t border-line pt-3">
                  <NextSteps steps={steps} nextLevel={nextLevel} />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StateBadge({ state }: { state: StageState }) {
  if (state === "current") {
    return (
      <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-bg">You are here</span>
    );
  }
  if (state === "done") {
    return (
      <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-xs font-semibold text-leaf">✓ Reached</span>
    );
  }
  return <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">Ahead</span>;
}
