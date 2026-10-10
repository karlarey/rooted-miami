import type { Metadata } from "next";
import { city } from "@/lib/city";

export const metadata: Metadata = {
  title: `Your stages · Rooted ${city.name}`,
  description: `Seed, Sprout, Rooted, Grove: the real milestones of becoming a ${city.demonym}.`,
};

export default function StagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
