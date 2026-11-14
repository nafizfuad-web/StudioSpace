/**
 * Approximate city-centre coordinates used by the dependency-free studio map.
 *
 * Listings only publish a street address, not latitude/longitude, so pins are
 * deliberately city-level. Never treat these values as exact studio addresses.
 */
export interface CityCoordinate {
  lat: number;
  lng: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinate> = {
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  atlanta: { lat: 33.749, lng: -84.388 },
  austin: { lat: 30.2672, lng: -97.7431 },
  berlin: { lat: 52.52, lng: 13.405 },
  brooklyn: { lat: 40.6782, lng: -73.9442 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  copenhagen: { lat: 55.6761, lng: 12.5683 },
  detroit: { lat: 42.3314, lng: -83.0458 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  london: { lat: 51.5074, lng: -0.1278 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  miami: { lat: 25.7617, lng: -80.1918 },
  nashville: { lat: 36.1627, lng: -86.7816 },
  "new orleans": { lat: 29.9511, lng: -90.0715 },
  "new york": { lat: 40.7128, lng: -74.006 },
  paris: { lat: 48.8566, lng: 2.3522 },
  portland: { lat: 45.5152, lng: -122.6784 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  seoul: { lat: 37.5665, lng: 126.978 },
  sheffield: { lat: 53.3811, lng: -1.4701 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
};

export interface StudioCityOption {
  value: string;
  label: string;
}

/**
 * Current catalogue cities, used by the home-page search form. The search page
 * derives its own list from the live API response so this never goes stale
 * there.
 */
export const STUDIO_CITY_OPTIONS: StudioCityOption[] = [
  { value: "Amsterdam", label: "Amsterdam, Netherlands" },
  { value: "Atlanta", label: "Atlanta, GA" },
  { value: "Austin", label: "Austin, TX" },
  { value: "Berlin", label: "Berlin, Germany" },
  { value: "Brooklyn", label: "Brooklyn, NY" },
  { value: "Chicago", label: "Chicago, IL" },
  { value: "Copenhagen", label: "Copenhagen, Denmark" },
  { value: "Detroit", label: "Detroit, MI" },
  { value: "Lisbon", label: "Lisbon, Portugal" },
  { value: "London", label: "London, United Kingdom" },
  { value: "Los Angeles", label: "Los Angeles, CA" },
  { value: "Manchester", label: "Manchester, United Kingdom" },
  { value: "Melbourne", label: "Melbourne, VIC" },
  { value: "Miami", label: "Miami, FL" },
  { value: "Nashville", label: "Nashville, TN" },
  { value: "New Orleans", label: "New Orleans, LA" },
  { value: "New York", label: "New York, NY" },
  { value: "Paris", label: "Paris, France" },
  { value: "Portland", label: "Portland, OR" },
  { value: "Seattle", label: "Seattle, WA" },
  { value: "Seoul", label: "Seoul, South Korea" },
  { value: "Sheffield", label: "Sheffield, United Kingdom" },
  { value: "Toronto", label: "Toronto, ON" },
  { value: "Vancouver", label: "Vancouver, BC" },
];

function normalizeCity(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Resolve an approximate city-centre coordinate from a studio address. */
export function getCityCoordinate(
  city?: string | null
): CityCoordinate | null {
  if (!city) return null;

  return CITY_COORDINATES[normalizeCity(city)] ?? null;
}
