import { levels } from "@/lib/levels";
import type { LevelId } from "@/lib/types";

const W = 340;
const ROW = 34;
const LABEL_W = 92;
const VALUE_W = 34;

/** Horizontal bars: current members at each level (single series, direct-labeled). */
export function LevelBars({ data }: { data: { level: LevelId; count: number }[] }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));
  const H = data.length * ROW;
  const barMax = W - LABEL_W - VALUE_W;
  const summary = data.map((d) => `${levels[d.level].name} ${d.count}`).join(", ");

  return (
    <figure className="rounded-2xl border border-line bg-surface p-4">
      <figcaption className="text-sm font-semibold text-ink">Members by level</figcaption>
      <p className="text-xs text-muted">
        {total} members still in Miami. Seed → Sprout → Rooted → Grove marks real milestones, not points.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="levels-title levels-desc" className="mt-3 h-auto w-full">
        <title id="levels-title">Members by level (simulated)</title>
        <desc id="levels-desc">{summary}.</desc>
        {data.map((d, i) => {
          const w = Math.max(4, (d.count / max) * barMax);
          const cy = i * ROW + ROW / 2;
          return (
            <g key={d.level}>
              <title>{`${levels[d.level].name}: ${d.count} members (${total ? Math.round((d.count / total) * 100) : 0}%)`}</title>
              <text x={0} y={cy + 4} className="fill-ink text-[12px]">
                {levels[d.level].emoji} {levels[d.level].name}
              </text>
              <rect x={LABEL_W} y={cy - 9} width={w} height={18} rx={4} className="fill-teal" />
              <text x={LABEL_W + w + 6} y={cy + 4} className="fill-ink text-[12px] font-semibold tabular-nums">
                {d.count}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="sr-only">
        {data.map((d) => (
          <li key={d.level}>
            {levels[d.level].name} ({levels[d.level].milestone}): {d.count} members
          </li>
        ))}
      </ul>
    </figure>
  );
}
