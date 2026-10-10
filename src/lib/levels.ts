import type { LevelId, PackageItem } from "./types";
import { city } from "./city";

export const levels: Record<LevelId, { emoji: string; name: string; milestone: string; earnedBy: string }> = {
  seed: {
    emoji: "🌱",
    name: "Seed",
    milestone: "Discovering",
    earnedBy: "Pick a neighborhood, explore 3+ areas, get around once without a car",
  },
  sprout: {
    emoji: "🌿",
    name: "Sprout",
    milestone: "Routines and connections",
    earnedBy: "A ritual 4+ weeks running, 2+ people outside work you can call",
  },
  rooted: {
    emoji: "🌳",
    name: "Rooted",
    milestone: "Belonging",
    earnedBy: `Belonging up, "I'm a ${city.demonym}: yes," mentoring or volunteering`,
  },
  grove: {
    emoji: "🌲",
    name: "Grove",
    milestone: "Contributing",
    earnedBy: "Welcome newcomers, start a community, see a mentee placed",
  },
};

export const levelOrder: LevelId[] = ["seed", "sprout", "rooted", "grove"];

export const packageItems: Record<PackageItem, { emoji: string; name: string; blurb: string }> = {
  community: { emoji: "🤝", name: "Community", blurb: "Rituals that outlast the people who come and go" },
  purpose: { emoji: "🎓", name: "Purpose", blurb: "Students and causes that need you here" },
  identity: { emoji: "🌴", name: "Identity", blurb: `Becoming a ${city.demonym}` },
  career: { emoji: "💼", name: "Career & skills", blurb: "A next job here: AI skills, hackathons, the tech map, warm intros" },
  practical: { emoji: "🧭", name: "Practical start", blurb: "Neighborhood, transit, cost heads-up" },
};
