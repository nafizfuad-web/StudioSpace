// src/models/studio.model.ts
// MongoDB Studio model definitions and collection helper.

import { Collection, Db, ObjectId, IndexDescription } from "mongodb";
import { getDb } from "../config/database";

export type StudioCategory =
  | "photography"
  | "film"
  | "podcast"
  | "music"
  | "workshop";

export type StudioStatus = "draft" | "published" | "archived";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface StudioDocument {
  _id: ObjectId;
  title: string;
  description: string;
  category: StudioCategory;
  location: Address;
  pricePerHour: number; // must be positive
  capacity: number; // number of people, positive integer
  features?: string[]; // e.g., ["power", "soundproof", "natural-light"]
  images?: string[]; // URLs to images
  hostId: ObjectId; // reference to a User document
  status: StudioStatus;
  createdAt: Date;
  updatedAt: Date;
}

let studioCollection: Collection<StudioDocument> | null = null;

/** Get the MongoDB collection for studios, creating indexes on first call */
export function getStudioCollection(): Collection<StudioDocument> {
  if (studioCollection) return studioCollection;

  const db: Db = getDb();
  studioCollection = db.collection<StudioDocument>("studios");

  const indexes: IndexDescription[] = [
    // Common queries: by category, location.city, price range, status
    { key: { category: 1 }, name: "idx_category" },
    { key: { "location.city": 1 }, name: "idx_city" },
    { key: { pricePerHour: 1 }, name: "idx_price" },
    { key: { status: 1 }, name: "idx_status" },
    // Reference to host
    { key: { hostId: 1 }, name: "idx_hostId" },
    // Text index for search on title / description (optional)
    { key: { title: "text", description: "text" }, name: "text_search" },
  ];

  studioCollection.createIndexes(indexes).catch((e) => {
    console.error("[StudioModel] Index creation error:", e);
  });

  return studioCollection;
}

/** Helper to construct a new studio document with basic validation */
export function createStudioDoc(params: {
  title: string;
  description: string;
  category: StudioCategory;
  location: Address;
  pricePerHour: number;
  capacity: number;
  features?: string[];
  images?: string[];
  hostId: string; // will be converted to ObjectId
  status?: StudioStatus;
}): Omit<StudioDocument, "_id"> {
  // Basic validation (throw if invalid)
  if (!params.title) throw new Error("Studio title is required");
  if (!params.description) throw new Error("Studio description is required");
  if (params.pricePerHour <= 0) throw new Error("pricePerHour must be positive");
  if (!Number.isInteger(params.capacity) || params.capacity <= 0)
    throw new Error("capacity must be a positive integer");

  const now = new Date();
  return {
    title: params.title.trim(),
    description: params.description.trim(),
    category: params.category,
    location: params.location,
    pricePerHour: params.pricePerHour,
    capacity: params.capacity,
    features: params.features?.map((f) => f.trim()),
    images: params.images?.map((url) => url.trim()),
    hostId: new ObjectId(params.hostId),
    status: params.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  } as Omit<StudioDocument, "_id">;
}
