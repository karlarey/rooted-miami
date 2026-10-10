import type { CheckIn, Profile } from "@/lib/types";

/** Primary persona: solo, office-based engineer who moved from NYC. */
export const alex: Profile = {
  name: "Alex",
  movedFrom: "New York City",
  monthsInMiami: 1,
  role: "Backend engineer",
  livesIn: "Brickell",
  worksIn: "Wynwood",
  worksFrom: "office",
  household: "alone",
  hasCar: true,
  interests: ["tennis", "running", "food", "tech", "teaching"],
  missesMost: "Walking out the door and running into people",
  weekendHours: 6,
  languages: ["English", "some Spanish"],
  stack: "backend",
  seniority: "mid",
  completedQuests: ["metromover-loop", "cafecito-ventanita"],
};

/** Alex's check-ins over a 6-month demo arc (synthetic). */
export const alexCheckIns: CheckIn[] = [
  { month: 0, intentToStay: 4, lifeSatisfaction: 5, peopleOutsideWork: 0, belonging: 1, miamian: "no" },
  { month: 1, intentToStay: 5, lifeSatisfaction: 6, peopleOutsideWork: 1, belonging: 2, miamian: "no" },
  { month: 3, intentToStay: 7, lifeSatisfaction: 7, peopleOutsideWork: 3, belonging: 3, miamian: "not-yet" },
  { month: 6, intentToStay: 8, lifeSatisfaction: 8, peopleOutsideWork: 5, belonging: 4, miamian: "yes" },
];
