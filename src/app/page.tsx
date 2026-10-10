import Link from "next/link";
import { levelOrder, levels, packageItems } from "@/lib/levels";
import type { PackageItem } from "@/lib/types";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
      <p className="font-mono text-xs tracking-widest text-coral">ROOTED MIAMI</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
        From nomad
        <br />
        to <span className="text-coral">Miamian.</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Your journey to becoming a Miamian, one side quest at a time. A community that stays when people come and go,
        a purpose that outlasts life&rsquo;s changes, and El Pana, a buddy who shows up before you think about leaving.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className="rounded-full bg-coral px-6 py-3 font-medium text-white hover:opacity-90">
          Start your journey
        </Link>
        <Link href="/journey" className="rounded-full border border-line px-6 py-3 font-medium hover:border-coral">
          See Alex&rsquo;s journey
        </Link>
        <Link href="/dashboard" className="rounded-full px-6 py-3 font-medium text-muted hover:text-coral">
          City dashboard →
        </Link>
      </div>

      <section className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Your welcome package</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(packageItems) as PackageItem[]).map((key) => (
            <div key={key} className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-2xl" aria-hidden>
                {packageItems[key].emoji}
              </p>
              <p className="mt-2 font-semibold">{packageItems[key].name}</p>
              <p className="text-sm text-muted">{packageItems[key].blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Grow through four stages</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {levelOrder.map((id) => (
            <li key={id} className="rounded-2xl bg-surface-2 p-4">
              <p className="text-2xl" aria-hidden>
                {levels[id].emoji}
              </p>
              <p className="mt-2 font-semibold">{levels[id].name}</p>
              <p className="text-sm text-muted">{levels[id].milestone}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
