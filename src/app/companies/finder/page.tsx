import type { Metadata } from "next";
import Link from "next/link";
import { TalentFinderPortal } from "@/components/finder/TalentFinderPortal";
import { talentCards } from "@/data/talent-visibility";

export const metadata: Metadata = {
  title: "Talent Finder · Rooted for Business",
  description: "Find engineers who live in Miami and opted in to hear from you. Every first message carries a fair, data-backed pay band.",
};

export default function FinderPage() {
  return (
    <div className="min-h-screen bg-rb-bg font-ui text-rb-ink">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <nav className="flex items-center justify-between text-sm">
          <Link href="/companies" className="font-display font-semibold text-rb-ink">
            Rooted <span className="font-normal text-rb-muted">for Business</span>
          </Link>
          <span className="rounded-full bg-rb-sage-soft px-3 py-1 text-xs font-medium">Signed in as Brisa Labs (demo)</span>
        </nav>

        <header className="mt-10 mb-8">
          <h1 className="font-display text-4xl font-bold sm:text-6xl">
            Find your talent.{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Keep it in Miami.</span>
              <span aria-hidden className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-full bg-rb-lime sm:h-4" />
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-rb-muted">
            {talentCards.length} rooted engineers chose to hear from Miami companies. You see only what they chose to share,
            and every first message needs a pay band, checked against what they could earn in Austin.
          </p>
        </header>

        <TalentFinderPortal />

        <footer className="mt-16 border-t border-rb-line pt-4 text-xs leading-relaxed text-rb-muted">
          Engineers are simulated (synthetic community members, not real people). Pay data: BLS OEWS May 2025 for the Miami,
          Austin and New York metros; Austin parity uses BEA Regional Price Parities 2024. Talent Finder runs on Gemma 4 via the
          Gemini API and never sets pay numbers or sees wellbeing or intent-to-stay data.
        </footer>
      </main>
    </div>
  );
}
