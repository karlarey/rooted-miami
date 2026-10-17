import type { CheckIn } from "@/lib/types";
import { city } from "@/lib/city";

/** Intent-to-stay over time (0–10), drawn as an inline SVG line. */
export function IntentChart({ checkIns }: { checkIns: CheckIn[] }) {
  const w = 320;
  const h = 120;
  const pad = 20;
  const maxMonth = Math.max(6, ...checkIns.map((c) => c.month));
  const x = (m: number) => pad + (m / maxMonth) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / 10) * (h - pad * 2);
  const points = checkIns.map((c) => `${x(c.month)},${y(c.intentToStay)}`).join(" ");
  const first = checkIns[0];
  const last = checkIns.at(-1)!;
  const stats = (
    <>
      People outside work: <strong className="text-ink">{last.peopleOutsideWork}</strong> · {city.demonym}?{" "}
      <strong className="text-ink">{{ yes: "Yes", "not-yet": "Not yet", no: "No" }[last.miamian]}</strong>
    </>
  );

  // One point is not a trend: show the numbers until there's a second check-in.
  if (checkIns.length < 2) {
    return (
      <div className="text-sm text-muted">
        <p>
          Intent to stay: <strong className="text-ink">{last.intentToStay}</strong> / 10 · {stats}
        </p>
        <p className="mt-1 text-xs">Your trend shows up here after your next check-in.</p>
      </div>
    );
  }

  return (
    <figure>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label={`Intent to stay went from ${first.intentToStay} to ${last.intentToStay} out of 10`}
      >
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={pad} x2={w - pad} y1={y(v)} y2={y(v)} className="stroke-line" strokeDasharray="3 4" />
            <text x={4} y={y(v) + 4} className="fill-muted" fontSize="9">
              {v}
            </text>
          </g>
        ))}
        <polyline points={points} fill="none" className="stroke-brand" strokeWidth="3" strokeLinejoin="round" />
        {checkIns.map((c) => (
          <circle key={c.month} cx={x(c.month)} cy={y(c.intentToStay)} r="4" className="fill-brand" />
        ))}
      </svg>
      <figcaption className="mt-1 text-xs text-muted">
        Intent to stay: <strong className="text-ink">{first.intentToStay}</strong> →{" "}
        <strong className="text-brand">{last.intentToStay}</strong> / 10 · {stats}
      </figcaption>
    </figure>
  );
}
