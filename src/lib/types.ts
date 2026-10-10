export type PackageItem = "community" | "purpose" | "identity" | "practical";

export type LevelId = "seed" | "sprout" | "rooted" | "grove";

export type Interest =
  | "tennis"
  | "racket"
  | "running"
  | "cycling"
  | "water"
  | "beach"
  | "team-sports"
  | "food"
  | "culture"
  | "music"
  | "tech"
  | "teaching"
  | "climate"
  | "community-service"
  | "explore";

export type Neighborhood =
  | "Brickell"
  | "Downtown"
  | "Wynwood"
  | "Edgewater"
  | "Little Havana"
  | "Little Haiti"
  | "Coconut Grove"
  | "Coral Gables"
  | "Key Biscayne"
  | "Miami Beach"
  | "Doral"
  | "Citywide";

export interface Quest {
  id: string;
  title: string;
  description: string;
  item: PackageItem;
  level: LevelId;
  interests: Interest[];
  neighborhood: Neighborhood;
  recurring: boolean;
  carFree: boolean;
  timeMinutes: number;
  /** Real-world place or organization, if any. */
  place?: string;
  url?: string;
}

export interface Profile {
  name: string;
  movedFrom: string;
  monthsInMiami: number;
  role: string;
  livesIn: Neighborhood;
  worksIn: Neighborhood;
  worksFrom: "office" | "remote" | "hybrid";
  household: "alone" | "partner" | "family";
  hasCar: boolean;
  interests: Interest[];
  missesMost: string;
  weekendHours: number;
  languages: string[];
  completedQuests: string[];
}

export interface CheckIn {
  month: number;
  intentToStay: number; // 0–10
  lifeSatisfaction: number; // Cantril 0–10
  peopleOutsideWork: number;
  belonging: number; // 1–5
  miamian: "yes" | "not-yet" | "no";
}
