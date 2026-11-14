// src/models/wishlist.model.ts
// MongoDB Wishlist / Saved Studio model definitions and collection helper.

import { Collection, Db, ObjectId, IndexDescription } from "mongodb";
import { getDb } from "../config/database.js";

export interface SavedStudioDocument {
  _id: ObjectId;
  userId: ObjectId;
  studioId: ObjectId;
  createdAt: Date;
}

let wishlistCollection: Collection<SavedStudioDocument> | null = null;

/** Get the MongoDB collection for saved studios / wishlists, creating indexes on first call */
export function getWishlistCollection(): Collection<SavedStudioDocument> {
  if (wishlistCollection) return wishlistCollection;

  const db: Db = getDb();
  wishlistCollection = db.collection<SavedStudioDocument>("saved_studios");

  const indexes: IndexDescription[] = [
    { key: { userId: 1, studioId: 1 }, unique: true, name: "unique_user_studio" },
    { key: { userId: 1 }, name: "idx_userId" },
    { key: { createdAt: -1 }, name: "idx_createdAt" },
  ];

  wishlistCollection.createIndexes(indexes).catch((e: any) => {
    console.error("[WishlistModel] Index creation error:", e);
  });

  return wishlistCollection;
}

export function createWishlistDoc(params: {
  userId: string;
  studioId: string;
}): Omit<SavedStudioDocument, "_id"> {
  return {
    userId: new ObjectId(params.userId),
    studioId: new ObjectId(params.studioId),
    createdAt: new Date(),
  };
}
