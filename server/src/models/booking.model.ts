// src/models/booking.model.ts
// MongoDB Booking model definitions and collection helper.

import { Collection, Db, ObjectId, IndexDescription } from "mongodb";
import { getDb } from "../config/database.js";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export interface BookingDocument {
  _id: ObjectId;
  studioId: ObjectId; // reference to Studio
  renterId: ObjectId; // reference to User (who books)
  hostId: ObjectId;   // denormalized copy of studio host for fast lookup
  startAt: Date;
  endAt: Date;
  totalPrice: number; // positive
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

let bookingCollection: Collection<BookingDocument> | null = null;

/** Get the MongoDB collection for bookings, creating indexes on first call */
export function getBookingCollection(): Collection<BookingDocument> {
  if (bookingCollection) return bookingCollection;

  const db: Db = getDb();
  bookingCollection = db.collection<BookingDocument>("bookings");

  const indexes: IndexDescription[] = [
    // Queries by studio, renter, host, and date range
    { key: { studioId: 1 }, name: "idx_studioId" },
    { key: { renterId: 1 }, name: "idx_renterId" },
    { key: { hostId: 1 }, name: "idx_hostId" },
    { key: { startAt: 1, endAt: 1 }, name: "idx_dateRange" },
    { key: { status: 1 }, name: "idx_status" },
  ];

  bookingCollection.createIndexes(indexes).catch((e) => {
    console.error("[BookingModel] Index creation error:", e);
  });

  return bookingCollection;
}

/** Helper to construct a new booking document with basic validation */
export function createBookingDoc(params: {
  studioId: string;
  renterId: string;
  hostId: string;
  startAt: Date | string;
  endAt: Date | string;
  totalPrice: number;
  status?: BookingStatus;
}): Omit<BookingDocument, "_id"> {
  const start = new Date(params.startAt);
  const end = new Date(params.endAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid startAt or endAt date");
  }
  if (end <= start) {
    throw new Error("endAt must be after startAt");
  }
  if (params.totalPrice <= 0) {
    throw new Error("totalPrice must be positive");
  }

  const now = new Date();
  return {
    studioId: new ObjectId(params.studioId),
    renterId: new ObjectId(params.renterId),
    hostId: new ObjectId(params.hostId),
    startAt: start,
    endAt: end,
    totalPrice: params.totalPrice,
    status: params.status ?? "pending",
    createdAt: now,
    updatedAt: now,
  } as Omit<BookingDocument, "_id">;
}
