import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { ObjectId, type Collection } from "mongodb";
import { createRequireAuth } from "../src/middleware/require-auth.middleware.js";
import { createBookingRouter } from "../src/routes/booking.route.js";
import type { BookingDocument } from "../src/models/booking.model.js";
import type { StudioDocument } from "../src/models/studio.model.js";
import type { UserDocument } from "../src/models/user.model.js";
import { withServer } from "./helpers.js";

const RENTER_ID = "64f1a2b3c4d5e6f7890a1b2c";
const OTHER_USER_ID = "64f1a2b3c4d5e6f7890a1b2d";
const HOST_ID = "64f1a2b3c4d5e6f7890a1b2e";
const STUDIO_ID = "64f1a2b3c4d5e6f7890a1b2f";
const MISSING_ID = "64f1a2b3c4d5e6f7890a1b30";

function makeStudio(): StudioDocument {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    _id: new ObjectId(STUDIO_ID),
    title: "Skyline Stage",
    description: "Spacious studio with great light",
    category: "photography",
    location: { city: "Dhaka" },
    pricePerHour: 100,
    capacity: 6,
    hostId: new ObjectId(HOST_ID),
    status: "published",
    booking: {
      minimumHours: 2,
      leadTimeDays: 1,
      cancellationPolicy: "Flexible",
      instantBook: false,
      availability: "9:00 AM - 9:00 PM",
      depositPercentage: 20,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function createFakeCollections(
  initialBookings: BookingDocument[] = [],
  initialStudios: StudioDocument[] = [makeStudio()]
) {
  const bookings = [...initialBookings];
  const studios = [...initialStudios];

  const bookingCollection = {
    find: (filter: { renterId?: ObjectId; hostId?: ObjectId }) => ({
      sort: () => ({
        toArray: async () => {
          let res = bookings;
          if (filter?.renterId) {
            res = res.filter((b) => String(b.renterId) === String(filter.renterId));
          }
          if (filter?.hostId) {
            res = res.filter((b) => String(b.hostId) === String(filter.hostId));
          }
          return res.map((b) => ({ ...b }));
        },
      }),
    }),
    findOne: async (filter: {
      _id?: ObjectId;
      studioId?: ObjectId;
      status?: { $in: string[] };
      startAt?: { $lt: Date };
      endAt?: { $gt: Date };
    }) => {
      if (filter._id) {
        return bookings.find((b) => String(b._id) === String(filter._id)) ?? null;
      }
      if (filter.studioId && filter.startAt && filter.endAt && filter.status) {
        return (
          bookings.find((b) => {
            if (String(b.studioId) !== String(filter.studioId)) return false;
            if (!filter.status?.$in.includes(b.status)) return false;
            return b.startAt < filter.startAt!.$lt && b.endAt > filter.endAt!.$gt;
          }) ?? null
        );
      }
      return null;
    },
    insertOne: async (doc: Omit<BookingDocument, "_id">) => {
      const insertedId = new ObjectId();
      const newDoc = { ...(doc as BookingDocument), _id: insertedId };
      bookings.push(newDoc);
      return { insertedId, acknowledged: true };
    },
    updateOne: async (
      filter: { _id?: ObjectId },
      update: { $set?: Partial<BookingDocument> }
    ) => {
      const doc = bookings.find((b) => filter._id && String(b._id) === String(filter._id));
      if (doc && update.$set) {
        Object.assign(doc, update.$set);
        return { modifiedCount: 1, matchedCount: 1, acknowledged: true };
      }
      return { modifiedCount: 0, matchedCount: 0, acknowledged: true };
    },
  } as unknown as Collection<BookingDocument>;

  const studioCollection = {
    findOne: async (filter: { _id?: ObjectId }) => {
      if (!filter._id) return null;
      return studios.find((s) => String(s._id) === String(filter._id)) ?? null;
    },
  } as unknown as Collection<StudioDocument>;

  return { bookingCollection, studioCollection, bookings, studios };
}

function authHeaders(userId: string, role?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-test-user-id": userId,
  };
  if (role) {
    headers["x-test-user-role"] = role;
  }
  return headers;
}

function createTestApp(
  bookingCol: Collection<BookingDocument>,
  studioCol: Collection<StudioDocument>
) {
  const app = express();
  app.use(express.json());

  const requireAuth = createRequireAuth(async (req) => {
    const raw = req.headers["x-test-user-id"];
    const id = Array.isArray(raw) ? raw[0] : raw;

    if (!id) return null;

    const rawRole = req.headers["x-test-user-role"];
    const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;

    return {
      id,
      email: `${id}@example.com`,
      role: role ?? "renter",
    };
  });

  app.use(
    "/api",
    createBookingRouter({
      requireAuth,
      getBookingCollection: () => bookingCol,
      getStudioCollection: () => studioCol,
    })
  );

  return app;
}

test("POST /api/bookings returns 401 when not authenticated", async () => {
  const { bookingCollection, studioCollection } = createFakeCollections();

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ studioId: STUDIO_ID }),
    });
    assert.equal(response.status, 401);
  });
});

test("POST /api/bookings calculates price on backend and creates booking", async () => {
  const { bookingCollection, studioCollection, bookings } = createFakeCollections();

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    const startAt = "2026-12-01T10:00:00.000Z";
    const endAt = "2026-12-01T13:00:00.000Z"; // 3 hours

    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({
        studioId: STUDIO_ID,
        startAt,
        endAt,
        guestCount: 4,
        notes: "Music video shoot",
      }),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as {
      success: boolean;
      booking: { totalPrice: number; status: string; guestCount: number };
    };
    assert.equal(body.success, true);
    // 3 hours * $100/hr = $300
    assert.equal(body.booking.totalPrice, 300);
    assert.equal(body.booking.status, "pending");
    assert.equal(body.booking.guestCount, 4);
    assert.equal(bookings.length, 1);
  });
});

test("POST /api/bookings rejects guest count exceeding capacity with 400", async () => {
  const { bookingCollection, studioCollection } = createFakeCollections();

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({
        studioId: STUDIO_ID,
        startAt: "2026-12-01T10:00:00.000Z",
        endAt: "2026-12-01T13:00:00.000Z",
        guestCount: 15, // Studio capacity is 6
      }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /exceeds studio capacity/);
  });
});

test("POST /api/bookings prevents double-booking conflict with 409", async () => {
  const existingBooking: BookingDocument = {
    _id: new ObjectId(),
    studioId: new ObjectId(STUDIO_ID),
    renterId: new ObjectId(OTHER_USER_ID),
    hostId: new ObjectId(HOST_ID),
    startAt: new Date("2026-12-01T10:00:00.000Z"),
    endAt: new Date("2026-12-01T14:00:00.000Z"),
    totalPrice: 400,
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { bookingCollection, studioCollection } = createFakeCollections([existingBooking]);

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    // Overlapping request: 12:00 to 15:00
    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({
        studioId: STUDIO_ID,
        startAt: "2026-12-01T12:00:00.000Z",
        endAt: "2026-12-01T15:00:00.000Z",
      }),
    });

    assert.equal(response.status, 409);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /already booked or reserved/);
  });
});

test("GET /api/bookings/my-bookings returns renter's bookings", async () => {
  const booking: BookingDocument = {
    _id: new ObjectId(),
    studioId: new ObjectId(STUDIO_ID),
    renterId: new ObjectId(RENTER_ID),
    hostId: new ObjectId(HOST_ID),
    startAt: new Date("2026-12-01T10:00:00.000Z"),
    endAt: new Date("2026-12-01T13:00:00.000Z"),
    totalPrice: 300,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { bookingCollection, studioCollection } = createFakeCollections([booking]);

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/bookings/my-bookings`, {
      headers: authHeaders(RENTER_ID, "renter"),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      count: number;
      bookings: Array<{ studio: { title: string } }>;
    };
    assert.equal(body.success, true);
    assert.equal(body.count, 1);
    assert.equal(body.bookings[0].studio.title, "Skyline Stage");
  });
});

test("PATCH /api/bookings/:id/cancel allows renter to cancel their booking", async () => {
  const bookingId = new ObjectId();
  const booking: BookingDocument = {
    _id: bookingId,
    studioId: new ObjectId(STUDIO_ID),
    renterId: new ObjectId(RENTER_ID),
    hostId: new ObjectId(HOST_ID),
    startAt: new Date("2026-12-01T10:00:00.000Z"),
    endAt: new Date("2026-12-01T13:00:00.000Z"),
    totalPrice: 300,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { bookingCollection, studioCollection, bookings } = createFakeCollections([booking]);

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: authHeaders(RENTER_ID, "renter"),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { success: boolean; booking: { status: string } };
    assert.equal(body.success, true);
    assert.equal(body.booking.status, "cancelled");
    assert.equal(bookings[0].status, "cancelled");
  });
});

test("PATCH /api/owner/bookings/:id/status allows host to accept booking", async () => {
  const bookingId = new ObjectId();
  const booking: BookingDocument = {
    _id: bookingId,
    studioId: new ObjectId(STUDIO_ID),
    renterId: new ObjectId(RENTER_ID),
    hostId: new ObjectId(HOST_ID),
    startAt: new Date("2026-12-01T10:00:00.000Z"),
    endAt: new Date("2026-12-01T13:00:00.000Z"),
    totalPrice: 300,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { bookingCollection, studioCollection, bookings } = createFakeCollections([booking]);

  await withServer(createTestApp(bookingCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/owner/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: authHeaders(HOST_ID, "host"),
      body: JSON.stringify({ status: "confirmed" }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { success: boolean; booking: { status: string } };
    assert.equal(body.success, true);
    assert.equal(body.booking.status, "confirmed");
    assert.equal(bookings[0].status, "confirmed");
  });
});
