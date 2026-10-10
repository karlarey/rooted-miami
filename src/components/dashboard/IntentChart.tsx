import type { IntentPoint } from "@/lib/metrics";
import { fmt1 } from "./format";

const W = 340;
const H = 180;
const PAD = { left: 26, right: 14, top: 14, bottom: 30 };

/** Single-series line: average intent to stay (0–10) by months since joining. */
export function IntentChart({ points }: { points: IntentPoint[] }) {
  if (points.length === 0) return null;
  const maxMonth = points[points.length - 1].month || 1;
  const x = (m: number) => PAD.left + (m / maxMonth) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / 10) * (H - PAD.top - PAD.bottom);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.month).toFixed(1)},${y(p.avg).toFixed(1)}`).join(" ");
  const start = points[0];
  const end = points[points.length - 1];
  const summary = `Average intent to stay rises from ${fmt1(start.avg)} at month ${start.month} to ${fmt1(end.avg)} at month ${end.month}.`;

  return (
    <figure className="rounded-2xl border border-line bg-surface p-4">
      <figcaption className="text-sm font-semibold text-ink">Intent to stay in Miami, by months since joining</figcaption>
      <p className="text-xs text-muted">Average 0–10 answer to El Pana&rsquo;s monthly check-in. {summary}</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby="intent-title intent-desc"
        className="mt-3 h-auto w-full"
      >
        <title id="intent-title">Intent to stay over time (simulated)</title>
        <desc id="intent-desc">{summary}</desc>

        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(v) + 3.5} textAnchor="end" className="fill-muted text-[10px]">
              {v}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 12].filter((m) => m <= maxMonth).map((m) => (
          <text key={m} x={x(m)} y={H - PAD.bottom + 16} textAnchor="middle" className="fill-muted text-[10px]">
            {m === 0 ? "Join" : `M${m}`}
          </text>
        ))}

        <path d={path} fill="none" className="stroke-teal" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p) => (
          <g key={p.month} className="group">
            {/* Larger invisible hit target carries the native tooltip. */}
            <circle cx={x(p.month)} cy={y(p.avg)} r={10} fill="transparent">
              <title>{`Month ${p.month}: ${fmt1(p.avg)} / 10 (n = ${p.n})`}</title>
            </circle>
            <circle
              cx={x(p.month)}
              cy={y(p.avg)}
              r={3.5}
              className="pointer-events-none fill-teal stroke-surface group-hover:fill-coral"
              strokeWidth={2}
            />
          </g>
        ))}

        {[start, end].map((p) => (
          <text
            key={`label-${p.month}`}
            x={x(p.month)}
            y={y(p.avg) - 9}
            textAnchor={p === start ? "start" : "end"}
            className="fill-ink text-[11px] font-semibold"
          >
            {fmt1(p.avg)}
          </text>
        ))}
      </svg>

      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer">Show data table</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead>
            <tr className="text-ink">
              <th scope="col" className="py-1 font-medium">Month</th>
              <th scope="col" className="py-1 font-medium">Avg intent (0–10)</th>
              <th scope="col" className="py-1 font-medium">Members checked in</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.month} className="border-t border-line">
                <td className="py-1">{p.month}</td>
                <td className="py-1">{fmt1(p.avg)}</td>
                <td className="py-1">{p.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">
          Each point averages members who checked in that month. Fewer members have reached later months, so later
          points rest on smaller groups.
        </p>
      </details>
    </figure>
  );
}
