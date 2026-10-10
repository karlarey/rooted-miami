/**
 * Real, sourced stats from docs/research/why-engineers-leave.md.
 * Kept visually distinct from the simulated metrics.
 */
const stats = [
  {
    value: "51.8%",
    text: "of childless 18–34 year-olds in Miami say they are likely to leave, #3 of 27 US metros.",
    source: "Gensler City Pulse, 2024 survey (via WLRN, 2026)",
    url: "https://www.wlrn.org/business/2026-01-29/i-cant-stay-in-miami-why-young-people-are-leaving-the-magic-city",
  },
  {
    value: "~73,000",
    text: "net domestic residents left Miami-Dade in 2025, the most of any Florida county.",
    source: "UF Shimberg Center, 2026",
    url: "https://news.ufl.edu/2026/07/florida-migration/",
  },
  {
    value: "Bottom 3",
    text: "Miami's rank among major US cities for volunteering, helping neighbors and civic ties.",
    source: "AmeriCorps / Census, 2023 (via WLRN)",
    url: "https://www.wlrn.org/the-south-florida-roundup/2023-04-11/miami-not-friendly-city",
  },
];

export function ContextStrip() {
  return (
    <section aria-labelledby="context-heading" className="rounded-2xl border border-line bg-surface-2 p-4">
      <h2 id="context-heading" className="text-sm font-semibold text-ink">
        Why this matters <span className="font-normal text-muted">· real research, not simulated</span>
      </h2>
      <ul className="mt-3 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.value}>
            <p className="text-2xl font-bold text-coral">{s.value}</p>
            <p className="mt-1 text-sm text-ink">{s.text}</p>
            <p className="mt-1 text-xs text-muted">
              Source:{" "}
              <a href={s.url} className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noreferrer">
                {s.source}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
