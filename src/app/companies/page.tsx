import type { Metadata } from "next";
import Link from "next/link";
import { AustinPlaybook, CompanyPackages, SimulatedTalentBanner, SkilledHere, TrustBox } from "@/components/companies/CompanySections";
import { RequestTalentForm } from "@/components/companies/RequestTalentForm";
import { TalentExplorer } from "@/components/companies/TalentExplorer";
import { fmt1, fmtInt, fmtPct } from "@/components/dashboard/format";
import { StatTile } from "@/components/dashboard/StatTile";
import { talentPool } from "@/data/talent-pool";
import { talentSummary } from "@/lib/talent";

export const metadata: Metadata = {
  title: "For companies · Rooted Miami",
  description: "Build your team in Miami with rooted, committed engineers who opted in to hear from you.",
};

function Section({ id, title, kicker, children }: { id: string; title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      {kicker && <p className="font-mono text-xs tracking-widest text-coral">{kicker}</p>}
      <h2 id={id} className="mt-1 text-2xl font-bold text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CompaniesPage() {
  // Today: simulated pool. Later: GET /api/talent/aggregates (aggregates only, same shape).
  const s = talentSummary(talentPool);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header>
        <p className="font-mono text-xs tracking-widest text-coral">ROOTED MIAMI · FOR COMPANIES</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-5xl">
          Build your team in Miami. <span className="text-teal">Hire engineers who are here to stay.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Rooted engineers aren&rsquo;t passing through. They play in the Sunday run club, mentor FIU students, host
          the padel night, and call Miami home. Our hypothesis, and what Rooted measures: engineers embedded in
          community stay longer, so the team you build here is the team you keep.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/companies/finder" className="rounded-full bg-coral px-6 py-3 font-semibold text-bg hover:opacity-90">
            Open Talent Finder
          </Link>
          <a href="#request" className="rounded-full border border-line px-6 py-3 font-medium text-ink hover:border-coral">
            Request talent
          </a>
          <a href="#talent-map" className="rounded-full border border-line px-6 py-3 font-medium text-ink hover:border-coral">
            Explore the talent map
          </a>
        </div>
      </header>

      <div className="mt-8">
        <SimulatedTalentBanner engineers={s.total} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Rooted engineers in the pool" value={fmtInt(s.total)} detail="Simulated community members" />
        <StatTile
          label="Open and opted in"
          value={fmtInt(s.openVisible)}
          detail={`${fmtPct(s.openVisibleShare)} chose to hear from companies`}
          accent="coral"
        />
        <StatTile
          label="Rooted or Grove level"
          value={fmtPct(s.rootedOrGroveShare)}
          detail={`Median ${fmt1(s.medianYearsInMiami)} years in Miami`}
          accent="gold"
        />
        <StatTile
          label="Bilingual"
          value={fmtPct(s.bilingualShare)}
          detail={`${fmtPct(s.mentoringShare)} mentor students`}
        />
      </div>

      <Section id="talent-map" kicker="TALENT MAP" title="Who's rooted here, by stack and seniority">
        <TalentExplorer />
      </Section>

      <Section id="skilled-here" kicker="SKILLED HERE" title="Engineers who keep leveling up in Miami">
        <SkilledHere s={s} />
      </Section>

      <div className="mt-8">
        <AustinPlaybook />
      </div>

      <Section id="packages" kicker="WHAT COMPANIES GET" title="Four ways to work with Rooted">
        <p className="mb-4 max-w-2xl text-muted">
          Engineers use Rooted for free. Companies pay for hiring access and retention, which funds the experience
          that keeps engineers here: more rooted engineers, more companies, more reasons to stay.
        </p>
        <CompanyPackages />
      </Section>

      <div className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="request">
          <p className="font-mono text-xs tracking-widest text-coral">REQUEST TALENT</p>
          <h2 id="request" className="mt-1 scroll-mt-6 text-2xl font-bold text-ink">
            Tell us who you&rsquo;re hiring
          </h2>
          <p className="mt-2 mb-4 text-sm text-muted">
            We introduce only engineers who are open to opportunities and chose to be visible.
          </p>
          <RequestTalentForm />
        </section>
        <div className="lg:pt-16">
          <TrustBox />
        </div>
      </div>

      <footer className="mt-12 border-t border-line pt-4 text-xs text-muted">
        Talent numbers are simulated ({s.total} synthetic engineers) and computed with the same aggregate functions the
        backend will run on real, opted-in data. See also the{" "}
        <Link href="/dashboard#talent-signal" className="underline hover:text-coral">
          City dashboard
        </Link>
        .
      </footer>
    </main>
  );
}
