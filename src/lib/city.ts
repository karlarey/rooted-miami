/**
 * The city this Rooted instance serves. Every user-facing "Miami" / "Miamian"
 * should come from here, so launching Rooted Austin is a config change, not a copy hunt.
 * Data keys (e.g. CheckIn["miamian"]) stay as-is; only display strings use this.
 */
export interface City {
  /** "Miami" */
  name: string;
  /** What locals call themselves: "Miamian", "Austinite", "New Yorker". */
  demonym: string;
}

export const city: City = { name: "Miami", demonym: "Miamian" };

/** The Rooted promise: "From newcomer to Miamian". */
export const tagline = `From newcomer to ${city.demonym}`;
