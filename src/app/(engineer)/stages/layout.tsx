import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your stages · Rooted Miami",
  description: "Seed, Sprout, Rooted, Grove: the real milestones of becoming a Miamian.",
};

export default function StagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
