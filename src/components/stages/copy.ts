import type { LevelId } from "@/lib/types";
import { city } from "@/lib/city";

/** Words for each stage, shared by LevelPath, LevelUpCelebration and /stages. */
export const stageCopy: Record<
  LevelId,
  { feeling: string; demoRule: string; celebrateTitle: string; celebrateBody: string; celebrateNext: string }
> = {
  seed: {
    feeling: "Everything is new. You're finding your corner of the city.",
    demoRule: "Where everyone starts.",
    celebrateTitle: "¡Bienvenido! You're a Seed.",
    celebrateBody: `Every ${city.demonym} started here. Let's find your corner of the city.`,
    celebrateNext: "Pick your first side quest.",
  },
  sprout: {
    feeling: `${city.name} has a rhythm now, and some of it is yours.`,
    demoRule: "3+ quests, including a weekly community ritual.",
    celebrateTitle: "You're a Sprout.",
    celebrateBody: "You've got routines and people outside work.",
    celebrateNext: "Next: someone here who needs you. Mentor a student or volunteer.",
  },
  rooted: {
    feeling: "You belong here, and people here count on you.",
    demoRule: "6+ quests, a weekly ritual, and a purpose quest (mentoring or volunteering).",
    celebrateTitle: "You're officially Rooted.",
    celebrateBody: `Welcome home, ${city.demonym}.`,
    celebrateNext: "Next: welcome someone who just landed, the way you were welcomed.",
  },
  grove: {
    feeling: `You make ${city.name} home for the people who come next.`,
    demoRule: "7+ quests, including a purpose quest and a Grove quest (hosting, welcoming, hiring a mentee).",
    celebrateTitle: "You're a Host now.",
    celebrateBody: "The next newcomers are lucky to have you.",
    celebrateNext: "A grove is many trees. Keep welcoming.",
  },
};
