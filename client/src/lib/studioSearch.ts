import {
  STUDIO_CATEGORY_FILTERS,
  formatLocation,
  type Studio,
  type StudioCategory,
} from "./studios";

export type StudioCategoryFilter = "all" | StudioCategory;
export type StudioSort =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "capacity-desc"
  | "newest";

export interface StudioFilters {
  category: StudioCategoryFilter;
  location: string;
  /** ISO date (`YYYY-MM-DD`) or an empty string when no date is selected. */
  date: string;
  minPrice: number | null;
  maxPrice: number | null;
  /** Minimum guest capacity. `0` means no capacity filter. */
  capacity: number;
  facilities: string[];
  instantBook: boolean;
  sameDay: boolean;
  sort: StudioSort;
}

export interface StudioPriceBounds {
  min: number;
  max: number;
}

export const DEFAULT_STUDIO_FILTERS: StudioFilters = {
  category: "all",
  location: "",
  date: "",
  minPrice: null,
  maxPrice: null,
  capacity: 0,
  facilities: [],
  instantBook: false,
  sameDay: false,
  sort: "recommended",
};

export const STUDIO_SORT_OPTIONS: Array<{
  value: StudioSort;
  label: string;
}> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "capacity-desc", label: "Capacity: high to low" },
  { value: "newest", label: "Newest listings" },
];

export const CAPACITY_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: "Any capacity" },
  { value: 8, label: "8+ guests" },
  { value: 12, label: "12+ guests" },
  { value: 16, label: "16+ guests" },
  { value: 20, label: "20+ guests" },
  { value: 25, label: "25+ guests" },
  { value: 30, label: "30+ guests" },
];

interface FacilityGroup {
  id: string;
  label: string;
  keywords: readonly string[];
}

/**
 * Facility filters are keyword groups over the catalogue's free-text features.
 * They are intentionally explicit so a filter never claims an amenity that the
 * underlying listing does not mention.
 */
export const FACILITY_GROUPS: FacilityGroup[] = [
  {
    id: "cyclorama",
    label: "Cyclorama & backdrop",
    keywords: [
      "cyclorama",
      "cyc wall",
      "white cyc",
      "seamless",
      "shooting wall",
      "green screen",
      "backdrop",
    ],
  },
  {
    id: "lighting",
    label: "Lighting & strobes",
    keywords: [
      "strobe",
      "lighting",
      "profoto",
      "arri",
      "softbox",
      "continuous light",
    ],
  },
  {
    id: "natural-light",
    label: "Natural light",
    keywords: [
      "natural light",
      "north light",
      "daylight",
      "windows",
      "glasshouse",
      "sun-drenched",
      "west-facing",
    ],
  },
  {
    id: "blackout",
    label: "Blackout capable",
    keywords: ["blackout"],
  },
  {
    id: "sound",
    label: "Soundproof & treated",
    keywords: [
      "soundproof",
      "acoustic",
      "sound treatment",
      "insulation",
      "quiet hvac",
      "double-wall",
      "floating floor",
    ],
  },
  {
    id: "makeup",
    label: "Makeup & styling",
    keywords: ["makeup", "styling", "changing room"],
  },
  {
    id: "freight",
    label: "Freight, loading & parking",
    keywords: [
      "freight",
      "loading",
      "drive-in",
      "load-in",
      "elevator access",
      "step-free",
      "parking",
    ],
  },
  {
    id: "post",
    label: "Post, prep & screening",
    keywords: [
      "edit",
      "grading",
      "control room",
      "camera prep",
      "production office",
      "screening",
      "projection",
    ],
  },
  {
    id: "recording",
    label: "Recording & mics",
    keywords: [
      "mic",
      "console",
      "preamps",
      "rodecaster",
      "ssl",
      "neve",
      "midi",
    ],
  },
  {
    id: "stage",
    label: "Stage, PA & backline",
    keywords: ["stage", "house pa", "backline", "drum riser", "live room"],
  },
  {
    id: "instruments",
    label: "Instruments & backline",
    keywords: ["piano", "drum", "backline", "amp collection", "amp room", "synth"],
  },
  {
    id: "outdoor",
    label: "Outdoor space",
    keywords: ["rooftop", "terrace", "courtyard", "outdoor"],
  },
  {
    id: "lounge",
    label: "Lounge, kitchen & green room",
    keywords: ["lounge", "green room", "kitchen", "coffee bar", "bar area"],
  },
];

const CATEGORY_VALUES = new Set<StudioCategory>(
  STUDIO_CATEGORY_FILTERS.map((option) => option.value).filter(
    (value): value is StudioCategory => value !== "all"
  )
);

const SORT_VALUES = new Set<StudioSort>(
  STUDIO_SORT_OPTIONS.map((option) => option.value)
);

const FACILITY_IDS = new Set(FACILITY_GROUPS.map((group) => group.id));

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DAY_NAME_PATTERN = DAY_NAMES.join("|");
const DAY_RANGE_PATTERN = new RegExp(
  `(${DAY_NAME_PATTERN})\\s*(?:-|–|—|through|to)\\s*(${DAY_NAME_PATTERN})`,
  "i"
);

export function isStudioSort(value: string | null): value is StudioSort {
  return value !== null && SORT_VALUES.has(value as StudioSort);
}

function parseOptionalNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseNonNegativeInteger(value: string | null): number {
  if (!value) return 0;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Validate a `YYYY-MM-DD` string and return a local-noon Date. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidIsoDate(value: string | null | undefined): boolean {
  return parseIsoDate(value) !== null;
}

export function getTodayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/** Whole-day difference between two ISO dates, independent of DST. */
export function getDaysBetweenIso(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);

  if (!from || !to) return Number.NaN;

  const fromUtc = Date.UTC(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  );
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function formatSearchDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Read operating weekdays from the listing's published availability text.
 * Returns `null` when the text cannot be interpreted, so callers can avoid
 * pretending the listing is either open or closed.
 */
export function getOperatingWeekdays(
  availability?: string | null
): Set<number> | null {
  if (!availability) return null;

  const text = availability.toLowerCase();

  if (/\bdaily\b/.test(text)) {
    return new Set([0, 1, 2, 3, 4, 5, 6]);
  }

  const range = text.match(DAY_RANGE_PATTERN);
  if (range) {
    const start = DAY_NAMES.indexOf(
      range[1].toLowerCase() as (typeof DAY_NAMES)[number]
    );
    const end = DAY_NAMES.indexOf(
      range[2].toLowerCase() as (typeof DAY_NAMES)[number]
    );

    if (start >= 0 && end >= 0) {
      const days = new Set<number>();
      let day = start;

      for (let guard = 0; guard < 7; guard += 1) {
        days.add(day);
        if (day === end) break;
        day = (day + 1) % 7;
      }

      return days;
    }
  }

  const namedDays = new Set<number>();
  DAY_NAMES.forEach((name, index) => {
    if (text.includes(name)) namedDays.add(index);
  });

  return namedDays.size > 0 ? namedDays : null;
}

export type StudioDateStatus = "open" | "closed" | "unknown";

/**
 * Whether a listing's published operating days and lead time permit a date.
 * This is not live calendar availability; it only interprets listing data.
 */
export function getStudioDateStatus(
  studio: Studio,
  dateIso: string
): StudioDateStatus {
  const date = parseIsoDate(dateIso);
  if (!date) return "unknown";

  const daysUntil = getDaysBetweenIso(getTodayIso(), dateIso);
  if (!Number.isFinite(daysUntil) || daysUntil < 0) return "closed";

  const leadTimeDays = studio.booking?.leadTimeDays ?? 0;
  if (daysUntil < leadTimeDays) return "closed";

  const operatingDays = getOperatingWeekdays(studio.booking?.availability);
  if (!operatingDays) return "unknown";

  return operatingDays.has(date.getDay()) ? "open" : "closed";
}

export function getFacilityGroup(id: string): FacilityGroup | undefined {
  return FACILITY_GROUPS.find((group) => group.id === id);
}

export function getStudioFacilityGroupIds(studio: Studio): string[] {
  const features = (studio.features ?? []).map((feature) =>
    feature.toLowerCase()
  );

  return FACILITY_GROUPS.filter((group) =>
    group.keywords.some((keyword) =>
      features.some((feature) => feature.includes(keyword))
    )
  ).map((group) => group.id);
}

export function getFacilityCounts(
  studios: Studio[]
): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(
    FACILITY_GROUPS.map((group) => [group.id, 0])
  );

  studios.forEach((studio) => {
    getStudioFacilityGroupIds(studio).forEach((id) => {
      counts[id] = (counts[id] ?? 0) + 1;
    });
  });

  return counts;
}

export function getCategoryCounts(
  studios: Studio[]
): Record<StudioCategoryFilter, number> {
  const counts: Record<StudioCategoryFilter, number> = {
    all: studios.length,
    photography: 0,
    film: 0,
    podcast: 0,
    music: 0,
    workshop: 0,
  };

  studios.forEach((studio) => {
    counts[studio.category] += 1;
  });

  return counts;
}

export function getStudioPriceBounds(studios: Studio[]): StudioPriceBounds {
  const prices = studios
    .map((studio) => studio.pricePerHour)
    .filter((price) => Number.isFinite(price) && price >= 0);

  if (prices.length === 0) {
    return { min: 0, max: 500 };
  }

  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));

  return { min, max: max > min ? max : min + 1 };
}

const LOCATION_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  usa: "united states",
  us: "united states",
  nyc: "new york",
  la: "los angeles",
};

function normalizeLocationTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => LOCATION_ALIASES[term] ?? term);
}

function matchesLocation(studio: Studio, query: string): boolean {
  const terms = normalizeLocationTerms(query);
  if (terms.length === 0) return true;

  const location = studio.location;
  const haystack = [
    location?.street,
    location?.city,
    location?.state,
    location?.country,
    location?.zip,
    formatLocation(location),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}

function getListingTimestamp(studio: Studio): number {
  const value = studio.createdAt ?? studio.updatedAt;
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function filterStudios(
  studios: Studio[],
  filters: StudioFilters
): Studio[] {
  const filtered = studios.filter((studio) => {
    if (
      filters.category !== "all" &&
      studio.category !== filters.category
    ) {
      return false;
    }

    if (filters.location && !matchesLocation(studio, filters.location)) {
      return false;
    }

    if (filters.date && getStudioDateStatus(studio, filters.date) === "closed") {
      return false;
    }

    if (
      filters.minPrice !== null &&
      studio.pricePerHour < filters.minPrice
    ) {
      return false;
    }

    if (
      filters.maxPrice !== null &&
      studio.pricePerHour > filters.maxPrice
    ) {
      return false;
    }

    if (filters.capacity > 0 && studio.capacity < filters.capacity) {
      return false;
    }

    if (filters.instantBook && studio.booking?.instantBook !== true) {
      return false;
    }

    if (filters.sameDay && studio.booking?.leadTimeDays !== 0) {
      return false;
    }

    if (filters.facilities.length > 0) {
      const studioFacilities = getStudioFacilityGroupIds(studio);
      if (
        !filters.facilities.every((id) => studioFacilities.includes(id))
      ) {
        return false;
      }
    }

    return true;
  });

  const sorted = filtered.slice();

  switch (filters.sort) {
    case "price-asc":
      sorted.sort(
        (a, b) => a.pricePerHour - b.pricePerHour || a.title.localeCompare(b.title)
      );
      break;
    case "price-desc":
      sorted.sort(
        (a, b) => b.pricePerHour - a.pricePerHour || a.title.localeCompare(b.title)
      );
      break;
    case "capacity-desc":
      sorted.sort(
        (a, b) => b.capacity - a.capacity || a.title.localeCompare(b.title)
      );
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          getListingTimestamp(b) - getListingTimestamp(a) ||
          a.title.localeCompare(b.title)
      );
      break;
    default:
      break;
  }

  return sorted;
}

export interface SearchParamReader {
  get(name: string): string | null;
}

export function parseStudioFilters(
  params: SearchParamReader
): StudioFilters {
  const categoryValue = params.get("category");
  const category =
    categoryValue && CATEGORY_VALUES.has(categoryValue as StudioCategory)
      ? (categoryValue as StudioCategory)
      : "all";

  const dateValue = params.get("date") ?? "";
  const facilityValue = params.get("facilities") ?? "";
  const facilities = Array.from(
    new Set(
      facilityValue
        .split(",")
        .map((id) => id.trim())
        .filter((id) => FACILITY_IDS.has(id))
    )
  );

  const sortValue = params.get("sort");
  const sort = isStudioSort(sortValue) ? sortValue : "recommended";

  let minPrice = parseOptionalNumber(params.get("minPrice"));
  let maxPrice = parseOptionalNumber(params.get("maxPrice"));

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    category,
    location: (params.get("location") ?? "").trim(),
    date: isValidIsoDate(dateValue) ? dateValue : "",
    minPrice,
    maxPrice,
    capacity: parseNonNegativeInteger(params.get("capacity")),
    facilities,
    instantBook: params.get("instantBook") === "1",
    sameDay: params.get("sameDay") === "1",
    sort,
  };
}

export function buildStudioSearchParams(
  filters: StudioFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.location) params.set("location", filters.location);
  if (filters.date) params.set("date", filters.date);
  if (filters.minPrice !== null) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== null) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.capacity > 0) params.set("capacity", String(filters.capacity));
  if (filters.facilities.length > 0) {
    params.set("facilities", filters.facilities.join(","));
  }
  if (filters.instantBook) params.set("instantBook", "1");
  if (filters.sameDay) params.set("sameDay", "1");
  if (filters.sort !== "recommended") params.set("sort", filters.sort);

  return params;
}

export function getStudioSearchHref(
  filters: StudioFilters,
  basePath = "/studios"
): string {
  const query = buildStudioSearchParams(filters).toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function countActiveFilters(filters: StudioFilters): number {
  let count = 0;

  if (filters.category !== "all") count += 1;
  if (filters.location) count += 1;
  if (filters.date) count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  if (filters.capacity > 0) count += 1;
  count += filters.facilities.length;
  if (filters.instantBook) count += 1;
  if (filters.sameDay) count += 1;

  return count;
}

export function getLocationOptionLabel(studio: Studio): string | null {
  const city = studio.location?.city?.trim();
  if (!city) return null;

  const state = studio.location?.state?.trim();
  const country = studio.location?.country?.trim();

  return state ? `${city}, ${state}` : country ? `${city}, ${country}` : city;
}
