import { fmtInt, fmtPct } from "@/components/dashboard/format";
import { StatTile } from "@/components/dashboard/StatTile";
import type { TalentSummary } from "@/lib/talent";

/** Static sections of the company page: simulated banner, skills, packages, Austin note, trust box. */

export function SimulatedTalentBanner({ engineers }: { engineers: number }) {
  return (
    <div role="note" aria-label="Simulated data notice" className="rounded-2xl border-2 border-coral bg-coral-soft p-4">
      <p className="font-semibold text-ink">
        <span aria-hidden="true">⚠️ </span>
        Simulated data: illustrates the talent signal Rooted would provide; not real results.
      </p>
      <p className="mt-1 text-sm text-muted">
        {engineers} synthetic engineers generated from a fixed seed. Pay rows marked &ldquo;Illustrative&rdquo; are
        placeholders until real benchmarks replace them.
      </p>
    </div>
  );
}

const packages = [
  {
    emoji: "🤝",
    name: "Talent access",
    accent: "border-t-teal",
    points: [
      "Introductions to rooted engineers who are open to opportunities and opted in to being visible",
      "Aggregate talent map by stack and seniority to plan a Miami office",
      "Warm referrals through rituals and mentor cohorts, not cold outreach",
    ],
  },
  {
    emoji: "🌴",
    name: "Retention package",
    accent: "border-t-coral",
    points: [
      "Every engineer you relocate gets the Rooted welcome package: community, purpose, identity, career",
      "El Pana, a local buddy who checks in and helps them build a life here",
      "Aggregate, anonymized retention reporting; never an individual's wellbeing or plans",
    ],
  },
  {
    emoji: "🎤",
    name: "Community presence",
    accent: "border-t-gold",
    points: [
      "Host a tech talk or a ritual at your office",
      "Sponsor a recurring ritual: a run club, a padel night, dominoes",
      "Your engineers mentor FIU, MDC and UM students",
    ],
  },
  {
    emoji: "🛠️",
    name: "Co-host a hackathon or AI training",
    accent: "border-t-teal",
    points: [
      "Train your future hires on the stack you actually use",
      "Meet engineers while they build, not in an interview loop",
      "Give back: open seats for FIU, MDC and UM students",
    ],
  },
] as const;

export function CompanyPackages() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {packages.map((p) => (
        <article key={p.name} className={`rounded-2xl border border-t-4 border-line bg-surface p-5 ${p.accent}`}>
          <p className="text-2xl" aria-hidden="true">
            {p.emoji}
          </p>
          <h3 className="mt-2 font-semibold text-ink">{p.name}</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {p.points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <span aria-hidden="true" className="text-teal">
                  ✓
                </span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-medium text-muted">Pricing TBD</p>
        </article>
      ))}
    </div>
  );
}

export function AustinPlaybook() {
  return (
    <aside aria-labelledby="austin-title" className="rounded-2xl border border-line bg-surface-2 p-5">
      <h3 id="austin-title" className="font-semibold text-ink">
        The Austin playbook
      </h3>
      <p className="mt-2 text-sm text-muted">
        Austin got expensive, but companies came and pay adjusted to match. That is our model. Our thesis: Miami can
        follow the same path if companies trust that the talent is here and will stay. Rooted gives them that trust: a
        rooted, committed talent pool, plus a way to keep the people they bring.
      </p>
      <p className="mt-2 text-xs text-muted">Framed as the team&rsquo;s thesis; Austin pay figures below are placeholders.</p>
    </aside>
  );
}

export function TrustBox() {
  return (
    <aside aria-labelledby="trust-title" className="rounded-2xl border-2 border-teal bg-teal-soft p-5">
      <h3 id="trust-title" className="font-semibold text-ink">
        <span aria-hidden="true">🔒 </span>Trust and privacy
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-ink">
        <li>
          <strong>Opt-in only.</strong> Engineers choose to be visible to companies. The default is off, and they can
          switch it off at any time.
        </li>
        <li>
          <strong>Aggregates only.</strong> Companies see counts by stack and seniority, with small groups suppressed.
          Individual profiles appear only for engineers who opted in.
        </li>
        <li>
          <strong>Never wellbeing or intent data.</strong> Check-ins, life satisfaction and anyone&rsquo;s plans to stay
          or leave are never shared with companies, including the ones that pay for retention.
        </li>
        <li>
          <strong>Belonging first.</strong> Rooted is free for engineers and never feels like a recruiting funnel; jobs
          come through community, not the other way around.
        </li>
      </ul>
    </aside>
  );
}

export function SkilledHere({ s }: { s: TalentSummary }) {
  return (
    <div>
      <p className="max-w-2xl text-muted">
        Companies hire where the skills are. Rooted engineers keep upskilling together: hands-on AI build trainings
        and Miami hackathons (like the one this prototype was built at), where projects actually ship.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile
          label="AI-trained"
          value={fmtPct(s.aiTrainedShare)}
          detail="Completed a hands-on AI build training"
          accent="coral"
        />
        <StatTile
          label="Hackathon projects"
          value={fmtInt(s.hackathonProjects)}
          detail="Built at Miami hackathons by pool members"
          accent="gold"
        />
        <StatTile
          label="Shipped a project"
          value={fmtInt(s.withShippedProjects)}
          detail={`${fmtPct(s.withShippedProjectsShare)} of engineers have something live`}
        />
      </div>
      <p className="mt-2 text-xs text-muted">Simulated. Use the &ldquo;AI-trained only&rdquo; filter on the talent map to slice by skills.</p>
    </div>
  );
}
