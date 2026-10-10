/** Honesty banner: every synthetic number on the dashboard sits under this. */
export function SimulatedBanner({ members, months }: { members: number; months: number }) {
  return (
    <div role="note" aria-label="Simulated data notice" className="rounded-2xl border-2 border-coral bg-coral-soft p-4">
      <p className="font-semibold text-ink">
        <span aria-hidden="true">⚠️ </span>
        Simulated data: illustrates what Rooted would measure; not real results.
      </p>
      <p className="mt-1 text-sm text-muted">
        {members} synthetic members over {months} simulated months, generated from a fixed seed. Only the
        &ldquo;Why this matters&rdquo; stats are real, and each one cites its source.
      </p>
    </div>
  );
}
