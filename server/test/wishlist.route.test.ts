import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { ObjectId, type Collection } from "mongodb";
import { createRequireAuth } from "../src/middleware/require-auth.middleware.js";
import { createWishlistRouter } from "../src/routes/wishlist.route.js";
import type { SavedStudioDocument } from "../src/models/wishlist.model.js";
import type { StudioDocument } from "../src/models/studio.model.js";
import { withServer } from "./helpers.js";

const USER_ID = "64f1a2b3c4d5e6f7890a1b2c";
const STUDIO_ID = "64f1a2b3c4d5e6f7890a1b2d";
const OTHER_STUDIO_ID = "64f1a2b3c4d5e6f7890a1b2e";

function makeStudio(id: string): StudioDocument {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    _id: new ObjectId(id),
    title: `Studio ${id}`,
    description: "Description",
    category: "photography",
    location: { city: "Dhaka" },
    pricePerHour: 100,
    capacity: 5,
    hostId: new ObjectId("64f1a2b3c4d5e6f7890a1b2f"),
    status: "published",
    createdAt: now,
    updatedAt: now,
  };
}

function createFakeWishlistCollections(
  initialSaved: SavedStudioDocument[] = [],
  initialStudios: StudioDocument[] = [makeStudio(STUDIO_ID), makeStudio(OTHER_STUDIO_ID)]
) {
  const saved = [...initialSaved];
  const studios = [...initialStudios];

  const wishlistCollection = {
    find: (filter: { userId?: ObjectId }) => ({
      sort: () => ({
        toArray: async () => {
          let res = saved;
          if (filter?.userId) {
            res = res.filter((s) => String(s.userId) === String(filter.userId));
          }
          return res.map((s) => ({ ...s }));
        },
      }),
    }),
    findOne: async (filter: { userId?: ObjectId; studioId?: ObjectId }) => {
      return (
        saved.find((s) => {
          if (filter.userId && String(s.userId) !== String(filter.userId)) return false;
          if (filter.studioId && String(s.studioId) !== String(filter.studioId)) return false;
          return true;
        }) ?? null
      );
    },
    updateOne: async (
      filter: { userId?: ObjectId; studioId?: ObjectId },
      update: { $setOnInsert?: Partial<SavedStudioDocument> },
      options?: { upsert?: boolean }
    ) => {
      const exists = saved.find(
        (s) =>
          filter.userId &&
          filter.studioId &&
          String(s.userId) === String(filter.userId) &&
          String(s.studioId) === String(filter.studioId)
      );
      if (!exists && options?.upsert && update.$setOnInsert) {
        saved.push({
          _id: new ObjectId(),
          userId: filter.userId!,
          studioId: filter.studioId!,
          createdAt: new Date(),
        } as SavedStudioDocument);
        return { upsertedCount: 1, acknowledged: true };
      }
      return { upsertedCount: 0, acknowledged: true };
    },
    deleteOne: async (filter: { userId?: ObjectId; studioId?: ObjectId }) => {
      const idx = saved.findIndex(
        (s) =>
          filter.userId &&
          filter.studioId &&
          String(s.userId) === String(filter.userId) &&
          String(s.studioId) === String(filter.studioId)
      );
      if (idx !== -1) {
        saved.splice(idx, 1);
        return { deletedCount: 1, acknowledged: true };
      }
      return { deletedCount: 0, acknowledged: true };
    },
  } as unknown as Collection<SavedStudioDocument>;

  const studioCollection = {
    find: (filter?: { _id?: { $in?: ObjectId[] } }) => ({
      toArray: async () => {
        if (!filter?._id?.$in) return studios.map((s) => ({ ...s }));
        const idStrings = filter._id.$in.map(String);
        return studios
          .filter((s) => idStrings.includes(String(s._id)))
          .map((s) => ({ ...s }));
      },
    }),
    findOne: async (filter: { _id?: ObjectId }) => {
      return studios.find((s) => filter._id && String(s._id) === String(filter._id)) ?? null;
    },
  } as unknown as Collection<StudioDocument>;

  return { wishlistCollection, studioCollection, saved, studios };
}

function authHeaders(userId: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-test-user-id": userId,
  };
}

function createTestApp(
  wishlistCol: Collection<SavedStudioDocument>,
  studioCol: Collection<StudioDocument>
) {
  const app = express();
  app.use(express.json());

  const requireAuth = createRequireAuth(async (req) => {
    const raw = req.headers["x-test-user-id"];
    const id = Array.isArray(raw) ? raw[0] : raw;
    if (!id) return null;
    return { id, email: `${id}@example.com`, role: "renter" };
  });

  app.use(
    "/api",
    createWishlistRouter({
      requireAuth,
      getWishlistCollection: () => wishlistCol,
      getStudioCollection: () => studioCol,
    })
  );

  return app;
}

test("GET /api/wishlist returns 401 when not authenticated", async () => {
  const { wishlistCollection, studioCollection } = createFakeWishlistCollections();

  await withServer(createTestApp(wishlistCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wishlist`);
    assert.equal(response.status, 401);
  });
});

test("POST /api/wishlist/:studioId saves studio to user wishlist", async () => {
  const { wishlistCollection, studioCollection, saved } = createFakeWishlistCollections();

  await withServer(createTestApp(wishlistCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wishlist/${STUDIO_ID}`, {
      method: "POST",
      headers: authHeaders(USER_ID),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { success: boolean; isSaved: boolean };
    assert.equal(body.success, true);
    assert.equal(body.isSaved, true);
    assert.equal(saved.length, 1);
    assert.equal(String(saved[0].studioId), STUDIO_ID);
  });
});

test("GET /api/wishlist/:studioId/check returns isSaved true when studio is in wishlist", async () => {
  const savedDoc: SavedStudioDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(USER_ID),
    studioId: new ObjectId(STUDIO_ID),
    createdAt: new Date(),
  };

  const { wishlistCollection, studioCollection } = createFakeWishlistCollections([savedDoc]);

  await withServer(createTestApp(wishlistCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wishlist/${STUDIO_ID}/check`, {
      headers: authHeaders(USER_ID),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { success: boolean; isSaved: boolean };
    assert.equal(body.success, true);
    assert.equal(body.isSaved, true);
  });
});

test("DELETE /api/wishlist/:studioId removes studio from wishlist", async () => {
  const savedDoc: SavedStudioDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(USER_ID),
    studioId: new ObjectId(STUDIO_ID),
    createdAt: new Date(),
  };

  const { wishlistCollection, studioCollection, saved } = createFakeWishlistCollections([savedDoc]);

  await withServer(createTestApp(wishlistCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wishlist/${STUDIO_ID}`, {
      method: "DELETE",
      headers: authHeaders(USER_ID),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { success: boolean; isSaved: boolean };
    assert.equal(body.success, true);
    assert.equal(body.isSaved, false);
    assert.equal(saved.length, 0);
  });
});

test("GET /api/wishlist returns full studio records for saved studios", async () => {
  const savedDoc: SavedStudioDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(USER_ID),
    studioId: new ObjectId(STUDIO_ID),
    createdAt: new Date(),
  };

  const { wishlistCollection, studioCollection } = createFakeWishlistCollections([savedDoc]);

  await withServer(createTestApp(wishlistCollection, studioCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wishlist`, {
      headers: authHeaders(USER_ID),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      count: number;
      savedStudios: Array<{ studio: { _id: string; title: string } }>;
    };
    assert.equal(body.success, true);
    assert.equal(body.count, 1);
    assert.equal(body.savedStudios[0].studio._id, STUDIO_ID);
  });
});
