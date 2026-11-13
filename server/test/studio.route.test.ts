import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { ObjectId, type Collection } from "mongodb";
import { createRequireAuth } from "../src/middleware/require-auth.middleware.js";
import { createStudioRouter } from "../src/routes/studio.route.js";
import type { StudioDocument } from "../src/models/studio.model.js";
import type { UserDocument } from "../src/models/user.model.js";
import { withServer } from "./helpers.js";

const OWNER_ID = "64f1a2b3c4d5e6f7890a1b2c";
const OTHER_ID = "64f1a2b3c4d5e6f7890a1b2d";
const STUDIO_ID = "64f1a2b3c4d5e6f7890a1b2e";
const MISSING_ID = "64f1a2b3c4d5e6f7890a1b2f";

const VALID_CREATE_BODY = {
  title: "New Studio",
  description: "A brand new studio",
  category: "photography",
  location: { city: "Dhaka", country: "Bangladesh" },
  pricePerHour: 75,
  capacity: 5,
};

function makeStudio(): StudioDocument {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    _id: new ObjectId(STUDIO_ID),
    title: "Seed Studio",
    description: "Seed description",
    category: "photography",
    location: { city: "Dhaka" },
    pricePerHour: 50,
    capacity: 4,
    hostId: new ObjectId(OWNER_ID),
    status: "published",
    createdAt: now,
    updatedAt: now,
  };
}

function createFakeCollection(initial: StudioDocument[] = []): {
  collection: Collection<StudioDocument>;
  docs: StudioDocument[];
} {
  const docs = [...initial];

  const findDoc = (filter: { _id?: ObjectId }): StudioDocument | null => {
    if (!filter._id) return null;
    return (
      docs.find((doc) => String(doc._id) === String(filter._id)) ?? null
    );
  };

  const collection = {
    find: () => ({
      toArray: async () => docs.map((doc) => ({ ...doc })),
    }),
    findOne: async (filter: { _id?: ObjectId }) => {
      const doc = findDoc(filter);
      return doc ? { ...doc } : null;
    },
    insertOne: async (doc: Omit<StudioDocument, "_id">) => {
      const insertedId = new ObjectId();
      docs.push({ ...(doc as StudioDocument), _id: insertedId });
      return { insertedId, acknowledged: true };
    },
    findOneAndUpdate: async (
      filter: { _id?: ObjectId },
      update: { $set?: Partial<StudioDocument> }
    ) => {
      const doc = findDoc(filter);
      if (!doc) return null;
      if (update.$set) Object.assign(doc, update.$set);
      return { ...doc };
    },
    deleteOne: async (filter: { _id?: ObjectId }) => {
      const index = docs.findIndex(
        (doc) => filter._id && String(doc._id) === String(filter._id)
      );

      if (index === -1) {
        return { deletedCount: 0, acknowledged: true };
      }

      docs.splice(index, 1);
      return { deletedCount: 1, acknowledged: true };
    },
  } as unknown as Collection<StudioDocument>;

  return { collection, docs };
}

function authHeaders(userId: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-test-user-id": userId,
  };
}

function createTestApp(
  collection: Collection<StudioDocument>,
  userCollection?: Collection<UserDocument>
) {
  const app = express();
  app.use(express.json());

  const requireAuth = createRequireAuth(async (req) => {
    const raw = req.headers["x-test-user-id"];
    const id = Array.isArray(raw) ? raw[0] : raw;

    if (!id) return null;

    return {
      id,
      email: `${id}@example.com`,
      role: "host",
    };
  });

  app.use(
    "/api",
    createStudioRouter({
      requireAuth,
      getCollection: () => collection,
      getUserCollection: userCollection
        ? () => userCollection
        : undefined,
    })
  );

  return app;
}

test("public GET /api/studios remains accessible without a session", async () => {
  const { collection } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios`);
    const body = (await response.json()) as {
      success: boolean;
      count: number;
      studios: unknown[];
    };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.count, 1);
    assert.equal(body.studios.length, 1);
  });
});

test("public GET /api/studios/:id remains accessible without a session", async () => {
  const { collection } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`);
    const body = (await response.json()) as {
      success: boolean;
      studio: { _id: string; title: string };
      host: unknown;
    };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.studio._id, STUDIO_ID);
    assert.equal(body.host, null);
  });
});

test("public GET /api/studios/:id includes public host details only", async () => {
  const joinedAt = new Date("2025-04-12T00:00:00.000Z");
  const hostDoc = {
    _id: new ObjectId(OWNER_ID),
    name: "Seed Host",
    email: "host@example.com",
    emailVerified: true,
    avatar: "https://images.unsplash.com/photo-host",
    role: "host",
    createdAt: joinedAt,
    updatedAt: joinedAt,
  } as UserDocument;

  const userCollection = {
    findOne: async () => ({ ...hostDoc }),
  } as unknown as Collection<UserDocument>;

  const { collection } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection, userCollection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`);
    const body = (await response.json()) as {
      success: boolean;
      host: {
        _id: string;
        name: string;
        avatar: string | null;
        role?: string;
        createdAt?: string;
        email?: string;
      } | null;
    };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.host);
    assert.equal(body.host._id, OWNER_ID);
    assert.equal(body.host.name, "Seed Host");
    assert.equal(body.host.avatar, hostDoc.avatar);
    assert.equal(body.host.role, "host");
    assert.equal(body.host.createdAt, joinedAt.toISOString());
    assert.equal(body.host.email, undefined);
  });
});

test("POST /api/studios returns 401 without a session", async () => {
  const { collection, docs } = createFakeCollection();

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_CREATE_BODY),
    });

    assert.equal(response.status, 401);
    assert.equal(docs.length, 0);
  });
});

test("POST /api/studios rejects a client-supplied hostId", async () => {
  const { collection, docs } = createFakeCollection();

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios`, {
      method: "POST",
      headers: authHeaders(OWNER_ID),
      body: JSON.stringify({ ...VALID_CREATE_BODY, hostId: OTHER_ID }),
    });

    assert.equal(response.status, 400);
    assert.equal(docs.length, 0);
    assert.deepEqual(await response.json(), {
      success: false,
      message:
        "hostId is derived from the authenticated session and cannot be supplied.",
    });
  });
});

test("POST /api/studios ignores forged query and header identifiers", async () => {
  const { collection, docs } = createFakeCollection();

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/studios?hostId=${OTHER_ID}`,
      {
        method: "POST",
        headers: {
          ...authHeaders(OWNER_ID),
          "x-user-id": OTHER_ID,
          "x-host-id": OTHER_ID,
        },
        body: JSON.stringify(VALID_CREATE_BODY),
      }
    );

    const body = (await response.json()) as {
      success: boolean;
      studio: { hostId: string; status: string };
    };

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.studio.hostId, OWNER_ID);
    assert.equal(body.studio.status, "draft");
    assert.equal(docs.length, 1);
    assert.equal(String(docs[0].hostId), OWNER_ID);
  });
});

test("POST /api/studios creates the studio for the authenticated user", async () => {
  const { collection, docs } = createFakeCollection();

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios`, {
      method: "POST",
      headers: authHeaders(OWNER_ID),
      body: JSON.stringify(VALID_CREATE_BODY),
    });

    const body = (await response.json()) as {
      success: boolean;
      studio: { _id: string; hostId: string; title: string };
    };

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.studio.title, VALID_CREATE_BODY.title);
    assert.equal(body.studio.hostId, OWNER_ID);
    assert.equal(docs.length, 1);
    assert.equal(String(docs[0].hostId), OWNER_ID);
  });
});

test("PUT /api/studios/:id returns 401 without a session", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized update" }),
    });

    assert.equal(response.status, 401);
    assert.equal(docs[0].title, "Seed Studio");
  });
});

test("PUT /api/studios/:id returns 403 for a non-owner", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
      method: "PUT",
      headers: authHeaders(OTHER_ID),
      body: JSON.stringify({ title: "Hijacked" }),
    });

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "You do not have permission to modify this studio.",
    });
    assert.equal(docs[0].title, "Seed Studio");
  });
});

test("PUT /api/studios/:id allows the owner to update editable fields", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
      method: "PUT",
      headers: authHeaders(OWNER_ID),
      body: JSON.stringify({ title: "Updated Studio", capacity: 9 }),
    });

    const body = (await response.json()) as {
      success: boolean;
      studio: { title: string; capacity: number; hostId: string; status: string };
    };

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.studio.title, "Updated Studio");
    assert.equal(body.studio.capacity, 9);
    assert.equal(body.studio.hostId, OWNER_ID);
    assert.equal(body.studio.status, "published");
    assert.equal(docs[0].title, "Updated Studio");
    assert.equal(String(docs[0].hostId), OWNER_ID);
  });
});

test("PUT /api/studios/:id rejects every protected field with 400", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);
  const protectedValues: Record<string, unknown> = {
    hostId: OTHER_ID,
    _id: OTHER_ID,
    status: "archived",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await withServer(createTestApp(collection), async (baseUrl) => {
    for (const [field, value] of Object.entries(protectedValues)) {
      const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
        method: "PUT",
        headers: authHeaders(OWNER_ID),
        body: JSON.stringify({ [field]: value }),
      });

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        success: false,
        message: `Field "${field}" cannot be modified.`,
      });
    }

    assert.equal(String(docs[0].hostId), OWNER_ID);
    assert.equal(docs[0].status, "published");
    assert.equal(docs[0].title, "Seed Studio");
  });
});

test("PUT /api/studios/:id returns 404 for a missing studio", async () => {
  const { collection } = createFakeCollection();

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${MISSING_ID}`, {
      method: "PUT",
      headers: authHeaders(OWNER_ID),
      body: JSON.stringify({ title: "Missing" }),
    });

    assert.equal(response.status, 404);
  });
});

test("DELETE /api/studios/:id returns 401 without a session", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
      method: "DELETE",
    });

    assert.equal(response.status, 401);
    assert.equal(docs.length, 1);
  });
});

test("DELETE /api/studios/:id returns 403 for a non-owner", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
      method: "DELETE",
      headers: authHeaders(OTHER_ID),
    });

    assert.equal(response.status, 403);
    assert.equal(docs.length, 1);
  });
});

test("DELETE /api/studios/:id allows the owner to delete", async () => {
  const { collection, docs } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`, {
      method: "DELETE",
      headers: authHeaders(OWNER_ID),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      message: "Studio deleted successfully.",
    });
    assert.equal(docs.length, 0);

    const getResponse = await fetch(`${baseUrl}/api/studios/${STUDIO_ID}`);
    assert.equal(getResponse.status, 404);
  });
});

test("PUT and DELETE reject an invalid studio ID with 400", async () => {
  const { collection } = createFakeCollection([makeStudio()]);

  await withServer(createTestApp(collection), async (baseUrl) => {
    const putResponse = await fetch(`${baseUrl}/api/studios/not-an-id`, {
      method: "PUT",
      headers: authHeaders(OWNER_ID),
      body: JSON.stringify({ title: "Invalid" }),
    });

    const deleteResponse = await fetch(`${baseUrl}/api/studios/not-an-id`, {
      method: "DELETE",
      headers: authHeaders(OWNER_ID),
    });

    assert.equal(putResponse.status, 400);
    assert.equal(deleteResponse.status, 400);
  });
});
