import type { Metadata } from "next";
import Link from "next/link";
import { NegotiateTool } from "@/components/negotiate/NegotiateTool";

export const metadata: Metadata = {
  title: "Know your number · Rooted Miami",
  description: "Salary negotiation for Miami newcomers: where your pay stands, a data-backed range, a script, and practice with El Pana.",
};

export default function NegotiatePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-widest text-coral">ROOTED MIAMI · CAREER</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
          <span aria-hidden>💪 </span>Know your number
        </h1>
        <p className="mt-3 text-muted">
          Miami pays about the same as Austin but costs 16% more, and 29% more for housing. Go into your next pay
          conversation with real numbers, a script, and some practice.
        </p>
      </header>
      <NegotiateTool />
      <footer className="mt-10 border-t border-line pt-4 text-xs text-muted">
        Data: BLS OEWS May 2025, BEA Regional Price Parities 2024, Census ACS PUMS 2023–24.{" "}
        <Link href="/journey" className="underline hover:text-coral">
          Back to your journey
        </Link>
      </footer>
    </main>
  );
}
