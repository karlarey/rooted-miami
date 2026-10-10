import Link from "next/link";
import { HomeAccountNav, JourneyButton } from "@/components/home/HomeAccount";
import { levelOrder, levels, packageItems } from "@/lib/levels";
import type { PackageItem } from "@/lib/types";

const levelTint: Record<string, string> = {
  seed: "bg-surface-2",
  sprout: "bg-accent-soft",
  rooted: "bg-leaf-soft",
  grove: "bg-miami-soft",
};

export default function Home() {
  return (
    <main>
      {/* Hero: forest canvas, white display type, lime highlight */}
      <section className="relative overflow-hidden bg-forest text-white">
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -right-24 -top-16 h-[28rem] w-[28rem] opacity-[0.12] sm:right-0"
        >
          {[60, 100, 140, 180].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#D9F36A" strokeWidth="1.5" />
          ))}
          <path d="M200 340 C200 260 200 220 200 150" stroke="#D9F36A" strokeWidth="2" fill="none" />
          <path d="M200 230 C170 215 150 190 145 160 C175 165 195 190 200 230Z" fill="#D9F36A" />
          <path d="M200 200 C230 185 250 160 255 130 C225 135 205 160 200 200Z" fill="#D9F36A" />
        </svg>

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-6 sm:pb-28">
          <nav className="flex items-center justify-between">
            <span className="font-display text-lg font-bold tracking-tight">
              🌱 Rooted <span className="text-lime">Miami</span>
            </span>
            <HomeAccountNav />
          </nav>

          <p className="mt-16 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-lime sm:mt-24">
            Rooted for People · Now in Miami
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">
            New city.
            <br />
            <span className="text-lime">New roots.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            From nomad to local, one side quest at a time. Find your people, your purpose and your next opportunity in
            Miami, with Pana, your AI local companion, by your side.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-forest shadow-lift hover:brightness-95"
            >
              Find your roots
            </Link>
            <JourneyButton className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:border-white" />
          </div>

          <p className="mt-8 text-sm text-white/60">
            &ldquo;No tienes raíces todavía, pero tienes un Pana.&rdquo;
          </p>
        </div>
      </section>

      {/* Welcome package */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your welcome package</p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Everything a life here needs</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(packageItems) as PackageItem[]).map((key) => (
            <div key={key} className="rounded-2xl border border-line bg-surface shadow-card p-6 shadow-card">
              <p className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-xl" aria-hidden>
                {packageItems[key].emoji}
              </p>
              <p className="mt-4 font-display text-lg font-semibold">{packageItems[key].name}</p>
              <p className="mt-1 text-sm text-muted">{packageItems[key].blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stages */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">The journey</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Seed to Grove</h2>
          <p className="mt-3 max-w-xl text-muted">
            Real milestones, not points: exploring a neighborhood, finding your regulars, helping the next newcomer.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-4">
            {levelOrder.map((id, i) => (
              <li key={id} className={`rounded-2xl p-6 ${levelTint[id]}`}>
                <p className="text-3xl" aria-hidden>
                  {levels[id].emoji}
                </p>
                <p className="mt-4 text-xs font-medium text-muted">Stage {i + 1}</p>
                <p className="font-display text-lg font-semibold">{levels[id].name}</p>
                <p className="text-sm text-muted">{levels[id].milestone}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Two sides */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <h2 className="text-3xl font-semibold sm:text-4xl">Where people and opportunity take root</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-forest p-8 text-white shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime">Rooted for People</p>
            <p className="mt-3 font-display text-2xl font-semibold">Find your roots.</p>
            <p className="mt-2 text-white/75">
              Side quests, community, purpose and career, guided by Pana. You choose what companies see.
            </p>
            <Link href="/login" className="mt-6 inline-flex rounded-full bg-lime px-5 py-3 text-sm font-semibold text-forest">
              Start your journey
            </Link>
          </div>
          <div className="rounded-2xl border border-line bg-surface shadow-card p-8 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Rooted for Business</p>
            <p className="mt-3 font-display text-2xl font-semibold">Find your talent.</p>
            <p className="mt-2 text-muted">
              Talent Finder connects you with opted-in Miami engineers who are here to stay.
            </p>
            <Link
              href="/companies"
              className="mt-6 inline-flex rounded-full border border-brand px-5 py-3 text-sm font-semibold text-brand hover:bg-accent-soft"
            >
              For companies
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted">
          <span className="font-display font-semibold text-ink">🌱 Rooted</span>
          <span>New city. New roots. Same Pana.</span>
          <Link href="/dashboard" className="hover:text-brand">
            City dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}
