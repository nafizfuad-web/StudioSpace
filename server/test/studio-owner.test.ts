import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { ObjectId, type Collection } from "mongodb";
import { createRequireStudioOwner } from "../src/middleware/studio-owner.middleware.js";
import type { StudioDocument } from "../src/models/studio.model.js";
import { withServer } from "./helpers.js";

const OWNER_ID = "64f1a2b3c4d5e6f7890a1b2c";
const OTHER_ID = "64f1a2b3c4d5e6f7890a1b2d";
const STUDIO_ID = "64f1a2b3c4d5e6f7890a1b2e";
const MISSING_ID = "64f1a2b3c4d5e6f7890a1b2f";

function makeStudio(hostId: string): StudioDocument {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    _id: new ObjectId(STUDIO_ID),
    title: "Seed Studio",
    description: "Seed description",
    category: "photography",
    location: { city: "Dhaka" },
    pricePerHour: 50,
    capacity: 4,
    hostId: new ObjectId(hostId),
    status: "published",
    createdAt: now,
    updatedAt: now,
  };
}

function collectionWith(studio: StudioDocument | null): Collection<StudioDocument> {
  return {
    findOne: async (filter: { _id?: ObjectId }) => {
      if (!studio || !filter._id) return null;
      return String(studio._id) === String(filter._id) ? studio : null;
    },
  } as unknown as Collection<StudioDocument>;
}

function appFor(
  studio: StudioDocument | null,
  userId: string = OWNER_ID,
  role?: string
) {
  const app = express();

  app.use((_req, res, next) => {
    res.locals.authUser = { id: userId, email: "user@example.com", role };
    next();
  });

  app.get(
    "/studios/:id",
    createRequireStudioOwner(() => collectionWith(studio)),
    (_req, res) => {
      res.status(200).json({ success: true });
    }
  );

  return app;
}

test("rejects an invalid studio ID with 400", async () => {
  await withServer(appFor(makeStudio(OWNER_ID)), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/studios/not-an-object-id`);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
    });
  });
});

test("returns 404 when the studio does not exist", async () => {
  await withServer(appFor(null), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/studios/${MISSING_ID}`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Studio not found.",
    });
  });
});

test("returns 403 when the authenticated user is not the owner", async () => {
  await withServer(appFor(makeStudio(OWNER_ID), OTHER_ID), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/studios/${STUDIO_ID}`);

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "You do not have permission to modify this studio.",
    });
  });
});

test("allows the authenticated owner to continue", async () => {
  await withServer(appFor(makeStudio(OWNER_ID), OWNER_ID), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/studios/${STUDIO_ID}`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
  });
});

test("allows an administrator to modify a studio owned by another host", async () => {
  await withServer(
    appFor(makeStudio(OWNER_ID), OTHER_ID, "admin"),
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/studios/${STUDIO_ID}`);

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { success: true });
    }
  );
});
