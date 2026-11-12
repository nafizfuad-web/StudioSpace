// src/models/user.model.ts
// MongoDB User model definitions and collection helper.

import { Collection, Db, ObjectId, IndexDescription } from "mongodb";
import { getDb } from "../config/database";

export type UserRole = "renter" | "host" | "admin";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string; // unique, normalized lower‑case
  passwordHash?: string; // optional for future OAuth
  role: UserRole;
  avatar?: string; // URL to avatar image
  createdAt: Date;
  updatedAt: Date;
}

let userCollection: Collection<UserDocument> | null = null;

/** Get the MongoDB collection for users, creating needed indexes on first call */
export function getUserCollection(): Collection<UserDocument> {
  if (userCollection) return userCollection;

  const db: Db = getDb();
  userCollection = db.collection<UserDocument>("users");

  // Create indexes – unique email, plus role for queries.
  const indexes: IndexDescription[] = [
    { key: { email: 1 }, unique: true, name: "unique_email" },
    { key: { role: 1 }, name: "idx_role" },
  ];
  userCollection.createIndexes(indexes).catch((e: any) => {
    console.error("[UserModel] Index creation error:", e);
  });

  return userCollection;
}

// Helper to construct a new user document (validation can be added later)
export function createUserDoc(params: {
  name: string;
  email: string;
  passwordHash?: string;
  role?: UserRole;
  avatar?: string;
}): Omit<UserDocument, "_id"> {
  const now = new Date();
  return {
    name: params.name,
    email: params.email.toLowerCase().trim(),
    passwordHash: params.passwordHash,
    role: params.role ?? "renter",
    avatar: params.avatar,
    createdAt: now,
    updatedAt: now,
  } as Omit<UserDocument, "_id">;
}

// MongoDB User model definitions and collection helper.

import { Collection, Db, ObjectId, IndexSpecification } from "mongodb";
import { getDb } from "../config/database";

export type UserRole = "renter" | "host" | "admin";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string; // unique, normalized lower‑case
  passwordHash?: string; // optional for future OAuth
  role: UserRole;
  avatar?: string; // URL to avatar image
  createdAt: Date;
  updatedAt: Date;
}

let userCollection: Collection<UserDocument> | null = null;

/** Get the MongoDB collection for users, creating needed indexes on first call */
export function getUserCollection(): Collection<UserDocument> {
  if (userCollection) return userCollection;

  const db: Db = getDb();
  userCollection = db.collection<UserDocument>("users");

  // Create indexes – unique email, plus role for queries.
  const indexes: IndexSpecification[] = [
    { key: { email: 1 }, unique: true, name: "unique_email" },
    { key: { role: 1 }, name: "idx_role" },
  ];
  userCollection.createIndexes(indexes).catch((e: any) => {
    console.error("[UserModel] Index creation error:", e);
  });

  return userCollection;
}

// Helper to construct a new user document (validation can be added later)
export function createUserDoc(params: {
  name: string;
  email: string;
  passwordHash?: string;
  role?: UserRole;
  avatar?: string;
}): Omit<UserDocument, "_id"> {
  const now = new Date();
  return {
    name: params.name,
    email: params.email.toLowerCase().trim(),
    passwordHash: params.passwordHash,
    role: params.role ?? "renter",
    avatar: params.avatar,
    createdAt: now,
    updatedAt: now,
  } as Omit<UserDocument, "_id">;
}
