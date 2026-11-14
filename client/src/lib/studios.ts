import { API_URL } from "./apiUrl";

export { API_URL };

/**
 * Image used when a studio has not uploaded any photos yet. Keeping a local
 * visual fallback avoids a broken gallery while hosts complete their listing.
 */
export const FALLBACK_STUDIO_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80";

export type StudioCategory =
  | "photography"
  | "film"
  | "podcast"
  | "music"
  | "workshop";

export interface StudioAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface StudioBookingContext {
  minimumHours: number;
  maximumHours?: number | null;
  leadTimeDays: number;
  cancellationPolicy: string;
  instantBook: boolean;
  availability: string;
  depositPercentage: number;
}

export interface Studio {
  _id: string;
  title: string;
  description: string;
  category: StudioCategory;
  location?: StudioAddress | null;
  pricePerHour: number;
  capacity: number;
  features?: string[] | null;
  images?: string[] | null;
  booking?: StudioBookingContext | null;
  hostId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudioHost {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  joinedAt?: string | null;
}

export const CATEGORY_LABELS: Record<StudioCategory, string> = {
  photography: "Photography",
  film: "Film & Video",
  podcast: "Podcast",
  music: "Music",
  workshop: "Workshop",
};

export const STUDIO_CATEGORY_FILTERS: Array<{
  value: "all" | StudioCategory;
  label: string;
}> = [
  { value: "all", label: "All Studios" },
  { value: "photography", label: "Photography" },
  { value: "film", label: "Film & Video" },
  { value: "podcast", label: "Podcast" },
  { value: "music", label: "Music" },
  { value: "workshop", label: "Workshop" },
];

interface StudioResponse {
  success: boolean;
  studio: Studio;
  host?: {
    _id?: string;
    id?: string;
    name?: string;
    avatar?: string | null;
    role?: string;
    createdAt?: string | null;
  } | null;
  message?: string;
}

interface StudiosResponse {
  success: boolean;
  count: number;
  studios: Studio[];
  message?: string;
}

export function getCategoryLabel(category?: string | null): string {
  if (category && category in CATEGORY_LABELS) {
    return CATEGORY_LABELS[category as StudioCategory];
  }

  return category ? category.replace(/[-_]/g, " ") : "Creative Studio";
}

export function formatLocation(location?: StudioAddress | null): string {
  if (!location) return "Location available on request";

  const parts = [location.city, location.state, location.country].filter(
    (part): part is string => Boolean(part && part.trim())
  );

  return parts.length > 0 ? parts.join(", ") : "Location available on request";
}

export function formatFullAddress(location?: StudioAddress | null): string {
  if (!location) return "Location available on request";

  const parts = [
    location.street,
    location.city,
    location.state,
    location.zip,
    location.country,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return parts.length > 0
    ? parts.join(", ")
    : "Location available on request";
}

export function getStudioImages(studio: Pick<Studio, "images">): string[] {
  const images = (studio.images ?? []).filter(
    (image): image is string => typeof image === "string" && image.trim() !== ""
  );

  return images.length > 0 ? images : [FALLBACK_STUDIO_IMAGE];
}

export function getStudioCoverImage(
  studio: Pick<Studio, "images">
): string {
  return getStudioImages(studio)[0];
}

export function formatFeatureName(feature: string): string {
  const trimmed = feature.trim();
  if (!trimmed) return "";

  return trimmed
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeStudio(studio: Studio): Studio {
  return {
    ...studio,
    _id: String(studio._id),
    images: Array.isArray(studio.images) ? studio.images : [],
    features: Array.isArray(studio.features) ? studio.features : [],
    booking: studio.booking ?? null,
  };
}

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Turn a browser-level network failure into an actionable message. Without
 * this, connection and CORS failures surface as the bare "Failed to fetch".
 */
async function fetchApi(
  input: string,
  init: RequestInit
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;

    throw new Error(
      "The StudioSpace API could not be reached. Make sure the server is running, then try again."
    );
  }
}

/** Fetch every studio listed on the marketplace. */
export async function fetchStudios(signal?: AbortSignal): Promise<Studio[]> {
  const response = await fetchApi(`${API_URL}/api/studios`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to load studios right now.")
    );
  }

  const data = (await response.json()) as StudiosResponse;

  if (!data.success || !Array.isArray(data.studios)) {
    throw new Error("The studio service returned an unexpected response.");
  }

  return data.studios.map(normalizeStudio);
}

/**
 * Fetch a single studio by its MongoDB ObjectId.
 *
 * Invalid and missing IDs resolve to `null` so the route can render the
 * not-found UI, while transport/server failures are thrown so the route error
 * boundary can offer a retry.
 */
export async function fetchStudio(
  id: string
): Promise<{ studio: Studio; host: StudioHost | null } | null> {
  const response = await fetchApi(
    `${API_URL}/api/studios/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    }
  );

  if (response.status === 400 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Unable to load this studio right now.")
    );
  }

  const data = (await response.json()) as StudioResponse;

  if (!data.success || !data.studio) {
    return null;
  }

  const hostId = data.host?._id ?? data.host?.id;

  return {
    studio: normalizeStudio(data.studio),
    host: hostId
      ? {
          id: String(hostId),
          name: data.host?.name?.trim() || "StudioSpace Host",
          avatar: data.host?.avatar ?? null,
          role: data.host?.role,
          joinedAt: data.host?.createdAt ?? null,
        }
      : null,
  };
}
