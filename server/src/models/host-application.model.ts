// src/models/host-application.model.ts
// MongoDB Host Application model definitions and collection helper.

import { Collection, Db, ObjectId, IndexDescription } from "mongodb";
import { getDb } from "../config/database.js";

export type HostApplicationStatus = "pending" | "approved" | "rejected";

export interface HostApplicationDocument {
  _id: ObjectId;
  userId: ObjectId;
  userName: string;
  userEmail: string;
  status: HostApplicationStatus;
  notes?: string;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

let hostApplicationCollection: Collection<HostApplicationDocument> | null = null;

/** Get the MongoDB collection for host applications, creating needed indexes on first call */
export function getHostApplicationCollection(): Collection<HostApplicationDocument> {
  if (hostApplicationCollection) return hostApplicationCollection;

  const db: Db = getDb();
  hostApplicationCollection = db.collection<HostApplicationDocument>("host_applications");

  const indexes: IndexDescription[] = [
    { key: { userId: 1, status: 1 }, name: "idx_user_status" },
    { key: { status: 1 }, name: "idx_status" },
    { key: { createdAt: -1 }, name: "idx_createdAt" },
  ];

  hostApplicationCollection.createIndexes(indexes).catch((e: any) => {
    console.error("[HostApplicationModel] Index creation error:", e);
  });

  return hostApplicationCollection;
}

export function createHostApplicationDoc(params: {
  userId: string;
  userName: string;
  userEmail: string;
  notes?: string;
}): Omit<HostApplicationDocument, "_id"> {
  const now = new Date();
  return {
    userId: new ObjectId(params.userId),
    userName: params.userName.trim(),
    userEmail: params.userEmail.toLowerCase().trim(),
    status: "pending",
    notes: params.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}
