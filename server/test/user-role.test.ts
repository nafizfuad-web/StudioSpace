import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { ObjectId, type Collection } from "mongodb";
import { createRequireAuth } from "../src/middleware/require-auth.middleware.js";
import { createUserRouter } from "../src/routes/user.route.js";
import type { UserDocument } from "../src/models/user.model.js";
import type { HostApplicationDocument } from "../src/models/host-application.model.js";
import { withServer } from "./helpers.js";

const RENTER_ID = "64f1a2b3c4d5e6f7890a1b2c";
const OTHER_RENTER_ID = "64f1a2b3c4d5e6f7890a1b2d";
const HOST_ID = "64f1a2b3c4d5e6f7890a1b2e";
const ADMIN_ID = "64f1a2b3c4d5e6f7890a1b2f";
const SECOND_ADMIN_ID = "64f1a2b3c4d5e6f7890a1b30";
const MISSING_ID = "64f1a2b3c4d5e6f7890a1b31";

function makeUser(
  id: string,
  role: "renter" | "host" | "admin" = "renter"
): UserDocument {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    _id: new ObjectId(id),
    name: `User ${id}`,
    email: `${id}@example.com`,
    emailVerified: true,
    role,
    avatar: "https://example.com/avatar.jpg",
    createdAt: now,
    updatedAt: now,
  };
}

function createFakeUserCollection(initial: UserDocument[] = []): {
  collection: Collection<UserDocument>;
  docs: UserDocument[];
} {
  const docs = [...initial];

  const collection = {
    findOne: async (filter: { _id?: ObjectId; email?: string }) => {
      if (filter._id) {
        return docs.find((d) => String(d._id) === String(filter._id)) ?? null;
      }
      if (filter.email) {
        return docs.find((d) => d.email === filter.email) ?? null;
      }
      return null;
    },
    updateOne: async (
      filter: { _id?: ObjectId },
      update: { $set?: Partial<UserDocument> }
    ) => {
      const doc = docs.find((d) => filter._id && String(d._id) === String(filter._id));
      if (doc && update.$set) {
        Object.assign(doc, update.$set);
        return { modifiedCount: 1, matchedCount: 1, acknowledged: true };
      }
      return { modifiedCount: 0, matchedCount: 0, acknowledged: true };
    },
    findOneAndUpdate: async (
      filter: { _id?: ObjectId },
      update: { $set?: Partial<UserDocument> }
    ) => {
      const doc = docs.find((d) => filter._id && String(d._id) === String(filter._id));
      if (!doc) return null;
      if (update.$set) Object.assign(doc, update.$set);
      return { ...doc };
    },
  } as unknown as Collection<UserDocument>;

  return { collection, docs };
}

function createFakeApplicationCollection(
  initial: HostApplicationDocument[] = []
): {
  collection: Collection<HostApplicationDocument>;
  docs: HostApplicationDocument[];
} {
  const docs = [...initial];

  const collection = {
    findOne: async (filter: {
      _id?: ObjectId;
      userId?: ObjectId;
      status?: string;
    }) => {
      return (
        docs.find((d) => {
          if (filter._id && String(d._id) !== String(filter._id)) return false;
          if (filter.userId && String(d.userId) !== String(filter.userId))
            return false;
          if (filter.status && d.status !== filter.status) return false;
          return true;
        }) ?? null
      );
    },
    find: (filter?: { status?: string }) => ({
      sort: () => ({
        toArray: async () => {
          if (!filter?.status) return [...docs];
          return docs.filter((d) => d.status === filter.status);
        },
      }),
    }),
    insertOne: async (doc: Omit<HostApplicationDocument, "_id">) => {
      const insertedId = new ObjectId();
      const newDoc = { ...(doc as HostApplicationDocument), _id: insertedId };
      docs.push(newDoc);
      return { insertedId, acknowledged: true };
    },
    updateOne: async (
      filter: { _id?: ObjectId },
      update: { $set?: Partial<HostApplicationDocument> }
    ) => {
      const doc = docs.find(
        (d) => filter._id && String(d._id) === String(filter._id)
      );
      if (doc && update.$set) {
        Object.assign(doc, update.$set);
        return { modifiedCount: 1, matchedCount: 1, acknowledged: true };
      }
      return { modifiedCount: 0, matchedCount: 0, acknowledged: true };
    },
  } as unknown as Collection<HostApplicationDocument>;

  return { collection, docs };
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
  userCol: Collection<UserDocument>,
  appCol: Collection<HostApplicationDocument>
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
    createUserRouter({
      requireAuth,
      getUserCollection: () => userCol,
      getApplicationCollection: () => appCol,
    })
  );

  return app;
}

test("GET /api/user/me returns 401 when not authenticated", async () => {
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/me`);
    assert.equal(response.status, 401);
  });
});

test("GET /api/user/me returns profile, role, and application status", async () => {
  const user = makeUser(RENTER_ID, "renter");
  const { collection: userCol } = createFakeUserCollection([user]);
  const { collection: appCol } = createFakeApplicationCollection([
    {
      _id: new ObjectId(),
      userId: new ObjectId(RENTER_ID),
      userName: "User Test",
      userEmail: user.email,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/me`, {
      headers: authHeaders(RENTER_ID, "renter"),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      user: { role: string; hostApplication: { status: string } };
    };
    assert.equal(body.success, true);
    assert.equal(body.user.role, "renter");
    assert.equal(body.user.hostApplication.status, "pending");
  });
});

test("POST /api/user/host-application returns 401 when not authenticated", async () => {
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/host-application`, {
      method: "POST",
    });
    assert.equal(response.status, 401);
  });
});

test("POST /api/user/host-application allows a renter to submit an application", async () => {
  const user = makeUser(RENTER_ID, "renter");
  const { collection: userCol, docs: userDocs } = createFakeUserCollection([user]);
  const { collection: appCol, docs: appDocs } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/host-application`, {
      method: "POST",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({ notes: "I own a daylight photo studio." }),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as {
      success: boolean;
      application: { status: string; notes: string };
    };
    assert.equal(body.success, true);
    assert.equal(body.application.status, "pending");
    assert.equal(body.application.notes, "I own a daylight photo studio.");
    assert.equal(appDocs.length, 1);
    assert.equal(appDocs[0].status, "pending");
    // Crucial: User remains a renter until admin approves
    assert.equal(userDocs[0].role, "renter");
  });
});

test("POST /api/user/host-application prevents duplicate pending applications", async () => {
  const user = makeUser(RENTER_ID, "renter");
  const existingApp: HostApplicationDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(RENTER_ID),
    userName: user.name,
    userEmail: user.email,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol } = createFakeUserCollection([user]);
  const { collection: appCol, docs: appDocs } = createFakeApplicationCollection([existingApp]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/host-application`, {
      method: "POST",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({ notes: "Another application" }),
    });

    assert.equal(response.status, 409);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /already have a pending host application/);
    assert.equal(appDocs.length, 1);
  });
});

test("POST /api/user/host-application rejects applications from existing hosts or admins", async () => {
  const host = makeUser(HOST_ID, "host");
  const { collection: userCol } = createFakeUserCollection([host]);
  const { collection: appCol } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/host-application`, {
      method: "POST",
      headers: authHeaders(HOST_ID, "host"),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /already a studio host or administrator/);
  });
});

test("GET /api/user/host-application returns user's latest application status", async () => {
  const user = makeUser(RENTER_ID, "renter");
  const appDoc: HostApplicationDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(RENTER_ID),
    userName: user.name,
    userEmail: user.email,
    status: "pending",
    notes: "My application",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol } = createFakeUserCollection([user]);
  const { collection: appCol } = createFakeApplicationCollection([appDoc]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/host-application`, {
      headers: authHeaders(RENTER_ID, "renter"),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      application: { status: string; notes: string };
    };
    assert.equal(body.success, true);
    assert.equal(body.application.status, "pending");
    assert.equal(body.application.notes, "My application");
  });
});

test("GET /api/admin/host-applications returns 403 for non-admins", async () => {
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const renterRes = await fetch(`${baseUrl}/api/admin/host-applications`, {
      headers: authHeaders(RENTER_ID, "renter"),
    });
    assert.equal(renterRes.status, 403);

    const hostRes = await fetch(`${baseUrl}/api/admin/host-applications`, {
      headers: authHeaders(HOST_ID, "host"),
    });
    assert.equal(hostRes.status, 403);
  });
});

test("GET /api/admin/host-applications returns applications for admin", async () => {
  const app1: HostApplicationDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(RENTER_ID),
    userName: "Renter 1",
    userEmail: "r1@example.com",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const app2: HostApplicationDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(OTHER_RENTER_ID),
    userName: "Renter 2",
    userEmail: "r2@example.com",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection([app1, app2]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/host-applications?status=pending`, {
      headers: authHeaders(ADMIN_ID, "admin"),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      count: number;
      applications: Array<{ status: string }>;
    };
    assert.equal(body.success, true);
    assert.equal(body.count, 1);
    assert.equal(body.applications[0].status, "pending");
  });
});

test("PATCH /api/admin/host-applications/:id/review returns 403 for non-admins", async () => {
  const appId = new ObjectId();
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/host-applications/${appId}/review`, {
      method: "PATCH",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({ action: "approve" }),
    });
    assert.equal(response.status, 403);
  });
});

test("PATCH /api/admin/host-applications/:id/review prevents administrators from approving their own application", async () => {
  const appId = new ObjectId();
  const appDoc: HostApplicationDocument = {
    _id: appId,
    userId: new ObjectId(ADMIN_ID),
    userName: "Admin Applicant",
    userEmail: "admin@example.com",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection([appDoc]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/host-applications/${appId}/review`, {
      method: "PATCH",
      headers: authHeaders(ADMIN_ID, "admin"),
      body: JSON.stringify({ action: "approve" }),
    });

    assert.equal(response.status, 403);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /cannot approve or review their own application/);
  });
});

test("PATCH /api/admin/host-applications/:id/review approves application and promotes user to host", async () => {
  const appId = new ObjectId();
  const user = makeUser(RENTER_ID, "renter");
  const appDoc: HostApplicationDocument = {
    _id: appId,
    userId: new ObjectId(RENTER_ID),
    userName: user.name,
    userEmail: user.email,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol, docs: userDocs } = createFakeUserCollection([user]);
  const { collection: appCol, docs: appDocs } = createFakeApplicationCollection([appDoc]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/host-applications/${appId}/review`, {
      method: "PATCH",
      headers: authHeaders(ADMIN_ID, "admin"),
      body: JSON.stringify({ action: "approve" }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      application: { status: string; reviewedBy: string };
    };
    assert.equal(body.success, true);
    assert.equal(body.application.status, "approved");
    assert.equal(body.application.reviewedBy, ADMIN_ID);

    // Verify database state: application approved with reviewer and timestamp
    assert.equal(appDocs[0].status, "approved");
    assert.equal(String(appDocs[0].reviewedBy), ADMIN_ID);
    assert.ok(appDocs[0].reviewedAt instanceof Date);

    // Verify user role promoted to host in users collection
    assert.equal(userDocs[0].role, "host");
  });
});

test("PATCH /api/admin/host-applications/:id/review rejects application and leaves user role as renter", async () => {
  const appId = new ObjectId();
  const user = makeUser(RENTER_ID, "renter");
  const appDoc: HostApplicationDocument = {
    _id: appId,
    userId: new ObjectId(RENTER_ID),
    userName: user.name,
    userEmail: user.email,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol, docs: userDocs } = createFakeUserCollection([user]);
  const { collection: appCol, docs: appDocs } = createFakeApplicationCollection([appDoc]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/host-applications/${appId}/review`, {
      method: "PATCH",
      headers: authHeaders(ADMIN_ID, "admin"),
      body: JSON.stringify({
        action: "reject",
        rejectionReason: "Incomplete identity verification documents.",
      }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      application: { status: string; rejectionReason: string };
    };
    assert.equal(body.success, true);
    assert.equal(body.application.status, "rejected");
    assert.equal(
      body.application.rejectionReason,
      "Incomplete identity verification documents."
    );

    // Verify application state
    assert.equal(appDocs[0].status, "rejected");
    assert.equal(String(appDocs[0].reviewedBy), ADMIN_ID);
    assert.equal(
      appDocs[0].rejectionReason,
      "Incomplete identity verification documents."
    );

    // Verify user role remains renter
    assert.equal(userDocs[0].role, "renter");
  });
});

test("PATCH /api/admin/host-applications/:id/review returns 400 when reviewing already decided application", async () => {
  const appId = new ObjectId();
  const appDoc: HostApplicationDocument = {
    _id: appId,
    userId: new ObjectId(RENTER_ID),
    userName: "Renter",
    userEmail: "r@example.com",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { collection: userCol } = createFakeUserCollection();
  const { collection: appCol } = createFakeApplicationCollection([appDoc]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/host-applications/${appId}/review`, {
      method: "PATCH",
      headers: authHeaders(ADMIN_ID, "admin"),
      body: JSON.stringify({ action: "reject" }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { success: boolean; message: string };
    assert.equal(body.success, false);
    assert.match(body.message, /already been reviewed/);
  });
});

test("A rejected applicant is allowed to submit a new application", async () => {
  const user = makeUser(RENTER_ID, "renter");
  const rejectedApp: HostApplicationDocument = {
    _id: new ObjectId(),
    userId: new ObjectId(RENTER_ID),
    userName: user.name,
    userEmail: user.email,
    status: "rejected",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
  };
  const { collection: userCol } = createFakeUserCollection([user]);
  const { collection: appCol, docs: appDocs } = createFakeApplicationCollection([rejectedApp]);

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/user/host-application`, {
      method: "POST",
      headers: authHeaders(RENTER_ID, "renter"),
      body: JSON.stringify({ notes: "Updated application with complete docs" }),
    });

    assert.equal(response.status, 201);
    assert.equal(appDocs.length, 2);
    assert.equal(appDocs[1].status, "pending");
  });
});

test("PATCH /api/admin/users/:id/role allows direct administrative role change", async () => {
  const admin = makeUser(ADMIN_ID, "admin");
  const targetUser = makeUser(OTHER_RENTER_ID, "renter");
  const { collection: userCol, docs: userDocs } = createFakeUserCollection([admin, targetUser]);
  const { collection: appCol } = createFakeApplicationCollection();

  await withServer(createTestApp(userCol, appCol), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/users/${OTHER_RENTER_ID}/role`, {
      method: "PATCH",
      headers: authHeaders(ADMIN_ID, "admin"),
      body: JSON.stringify({ role: "host" }),
    });

    assert.equal(response.status, 200);
    assert.equal(userDocs.find((d) => String(d._id) === OTHER_RENTER_ID)?.role, "host");
  });
});
