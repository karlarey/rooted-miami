import type { Metadata } from "next";
import Link from "next/link";
import { MarketRates } from "@/components/finder/MarketRates";
import { TalentFinderPortal } from "@/components/finder/TalentFinderPortal";
import { talentCards } from "@/data/talent-visibility";

export const metadata: Metadata = {
  title: "Company dashboard · Rooted for Business",
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

        <nav aria-label="Dashboard sections" className="sticky top-[env(safe-area-inset-top,0px)] z-10 -mx-4 mb-8 flex gap-2 bg-rb-bg/90 px-4 py-3 backdrop-blur">
          <a href="#talent-finder" className="rounded-full bg-rb-primary px-4 py-2 text-sm font-medium text-rb-on-primary">
            1 · Talent Finder
          </a>
          <a href="#market-rates" className="rounded-full border border-rb-line px-4 py-2 text-sm font-medium hover:bg-rb-sage-soft">
            2 · Market rates
          </a>
        </nav>

        <div id="talent-finder" className="scroll-mt-20">
          <TalentFinderPortal />
        </div>

        <section id="market-rates" aria-labelledby="rates-title" className="mt-20 scroll-mt-20">
          <p className="text-xs font-medium tracking-widest text-rb-muted uppercase">Market rates</p>
          <h2 id="rates-title" className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            What engineers expect, by seniority and skill
          </h2>
          <p className="mt-2 mb-6 max-w-2xl text-rb-muted">
            Miami against the two cities that recruit Miami engineers away. Price your roles here before you reach out.
          </p>
          <MarketRates />
        </section>

        <footer className="mt-16 border-t border-rb-line pt-4 text-xs leading-relaxed text-rb-muted">
          Engineers are simulated (synthetic community members, not real people). Pay data: BLS OEWS May 2025 for the Miami,
          Austin and New York metros; Austin parity uses BEA Regional Price Parities 2024. Talent Finder runs on Gemma 4 via the
          Gemini API and never sets pay numbers or sees wellbeing or intent-to-stay data.
        </footer>
      </main>
    </div>
  );
}
