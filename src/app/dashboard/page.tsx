import type { Metadata } from "next";
import { ContextStrip } from "@/components/dashboard/ContextStrip";
import { fmt1, fmtInt, fmtPct, fmtUsd } from "@/components/dashboard/format";
import { IntentChart } from "@/components/dashboard/IntentChart";
import { LevelBars } from "@/components/dashboard/LevelBars";
import { MetricSection } from "@/components/dashboard/MetricSection";
import { SimulatedBanner } from "@/components/dashboard/SimulatedBanner";
import { StatTile } from "@/components/dashboard/StatTile";
import { TalentSignal } from "@/components/dashboard/TalentSignal";
import { PROGRAM_MONTHS, syntheticMembers } from "@/data/synthetic-members";
import { talentPool } from "@/data/talent-pool";
import { dashboardMetrics, VOLUNTEER_HOUR_VALUE } from "@/lib/metrics";
import { city } from "@/lib/city";

export const metadata: Metadata = {
  title: "City dashboard · Rooted Miami",
  description: "What Rooted would measure across members: retention, life satisfaction, Miami growth, communities.",
};

export default function DashboardPage() {
  // Today: synthetic members. Later: GET /api/metrics/dashboard (same shape, computed server-side).
  const d = dashboardMetrics(syntheticMembers);
  const { retention: r, satisfaction: s, growth: g, communities: c } = d;
  const intent0 = r.intent[0];
  const intentLast = r.intent[r.intent.length - 1];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header>
        <p className="font-mono text-xs tracking-widest text-coral">ROOTED MIAMI · CITY VIEW</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Is Miami keeping its talent?</h1>
        <p className="mt-2 max-w-2xl text-muted">
          The four impact metrics across all members, for Venture Miami, the Beacon Council, Knight Foundation and
          employers. Community is the input, satisfaction the feeling, retention the outcome, Miami growth the payoff.
        </p>
      </header>

      <div className="mt-6">
        <SimulatedBanner members={d.totalMembers} months={PROGRAM_MONTHS} />
      </div>

      <div className="mt-6">
        <ContextStrip />
      </div>

      <MetricSection id="retention" index={1} title="Retention" role="North star · the outcome">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <IntentChart points={r.intent} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <StatTile
              label="Intent to stay"
              value={`${fmt1(intentLast.avg)}/10`}
              change={`from ${fmt1(intent0.avg)} at join`}
              detail={`Month ${intentLast.month} average, ${intentLast.n} members`}
            />
            <StatTile
              label="12-month retention"
              value={fmtPct(r.retention12)}
              detail={`${r.retained12} of ${r.cohort12} members who joined 12+ months ago are still in Miami`}
            />
            <StatTile
              label="Weathered a shock and stayed"
              value={fmtPct(r.weatheredShockRate)}
              detail={`${r.weatheredShock} of ${r.shocked} hit by a layoff, rent jump or friends leaving`}
              accent="coral"
            />
            <StatTile
              label="Mentees still in Miami"
              value={fmtPct(r.menteeRetention)}
              detail={`${r.menteesStayed} of ${r.graduatedMentees} graduated student mentees`}
              accent="gold"
            />
          </div>
        </div>
      </MetricSection>

      <MetricSection id="satisfaction" index={2} title="Life satisfaction" role="The feeling">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            label="Life satisfaction (Cantril, 0–10)"
            value={fmt1(s.cantril)}
            change={`from ${fmt1(s.cantrilAtJoin)} at join`}
          />
          <StatTile
            label="Belonging (SCI-2 style, 1–5)"
            value={fmt1(s.belonging)}
            change={`from ${fmt1(s.belongingAtJoin)} at join`}
          />
          <StatTile
            label="People outside work to call"
            value={fmt1(s.peopleOutsideWork)}
            change={`from ${fmt1(s.peopleOutsideWorkAtJoin)} at join`}
          />
          <StatTile
            label={`Say “I’m a ${city.demonym}”`}
            value={fmtPct(s.miamianYes)}
            change={`from ${fmtPct(s.miamianYesAtJoin)} at join`}
            accent="coral"
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Latest check-in vs. first check-in for the {s.members} members still in Miami.
        </p>
      </MetricSection>

      <MetricSection id="growth" index={3} title="Miami growth" role="The payoff">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            label="Talent kept"
            value={fmtInt(g.talentKept)}
            detail={`${g.engineersKept} engineers + ${g.studentsKept} graduated students still in Miami`}
          />
          <StatTile
            label="Mentee internships and jobs"
            value={fmtInt(g.menteeInternships + g.menteeJobs)}
            detail={`${g.menteeInternships} internships, ${g.menteeJobs} jobs in Miami`}
            accent="gold"
          />
          <StatTile
            label="Volunteer hours"
            value={fmtInt(g.volunteerHours)}
            detail={`≈ ${fmtUsd(g.volunteerValue)} at ${fmtUsd(VOLUNTEER_HOUR_VALUE)}/hr*`}
            accent="coral"
          />
          <StatTile
            label="Startups founded"
            value={fmtInt(g.startupsFounded)}
            detail={`${g.localHires} local hires by members`}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          * Dollar value uses Independent Sector&rsquo;s published value of a volunteer hour. The rate shown is a
          placeholder until the current figure is verified.
        </p>
      </MetricSection>

      <MetricSection id="communities" index={4} title="Communities embraced and created" role="The input">
        <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
          <LevelBars data={d.levels} />
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label="Communities joined"
              value={fmtInt(c.communitiesJoined)}
              detail={`${fmt1(c.avgCommunitiesPerMember)} recurring rituals per member`}
            />
            <StatTile
              label="Ritual consistency"
              value={`${fmt1(c.avgRitualMonths)} mo`}
              detail="Average months of recurring attendance"
            />
            <StatTile
              label="Communities created"
              value={fmtInt(c.communitiesCreated)}
              detail={`${c.hosts} members went from guest to host`}
              accent="gold"
            />
            <StatTile
              label="Newcomers welcomed"
              value={fmtInt(c.newcomersWelcomed)}
              detail="By members who came before them"
              accent="coral"
            />
          </div>
        </div>
      </MetricSection>

      {/* Simulated talent pool; later GET /api/talent/aggregates. */}
      <TalentSignal pool={talentPool} index={5} />

      <footer className="mt-12 border-t border-line pt-4 text-xs text-muted">
        All member metrics above are simulated ({d.totalMembers} synthetic members, {d.activeMembers} still in Miami)
        and computed with the same functions the backend will run on real check-ins. The talent signal uses a separate
        simulated pool of {talentPool.length} engineers. Definitions: docs/metrics.md.
      </footer>
    </main>
  );
}
