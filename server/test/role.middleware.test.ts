import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";
import { createRequireRole } from "../src/middleware/role.middleware.js";
import type { AuthUser } from "../src/types/auth.js";

function makeResponse() {
  const tracker = {
    statusCode: null as number | null,
    body: null as unknown,
    res: {} as Response,
  };

  tracker.res = {
    status(code: number) {
      tracker.statusCode = code;
      return tracker.res;
    },
    json(data: unknown) {
      tracker.body = data;
      return tracker.res;
    },
  } as unknown as Response;

  return tracker;
}

test("createRequireRole: returns 401 when auth user resolution throws", () => {
  const middleware = createRequireRole(["host"], () => {
    throw new Error("getAuthUser() called before requireAuth");
  });

  const out = makeResponse();
  let nextCalled = false;

  middleware({} as Request, out.res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(out.statusCode, 401);
  assert.deepEqual(out.body, {
    success: false,
    message: "Authentication required.",
  });
});

test("createRequireRole: defaults undefined role to renter and rejects when renter not allowed", () => {
  const user: AuthUser = { id: "user-1", email: "user@example.com" };
  const middleware = createRequireRole(["host", "admin"], () => user);

  const out = makeResponse();
  let nextCalled = false;

  middleware({} as Request, out.res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(out.statusCode, 403);
  assert.deepEqual(out.body, {
    success: false,
    message: "You do not have permission to perform this action.",
  });
});

test("createRequireRole: returns 403 when user role is renter on host-only routes", () => {
  const user: AuthUser = { id: "user-1", email: "renter@example.com", role: "renter" };
  const middleware = createRequireRole(["host", "admin"], () => user);

  const out = makeResponse();
  let nextCalled = false;

  middleware({} as Request, out.res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(out.statusCode, 403);
});

test("createRequireRole: allows host when host is permitted", () => {
  const user: AuthUser = { id: "host-1", email: "host@example.com", role: "host" };
  const middleware = createRequireRole(["host", "admin"], () => user);

  const out = makeResponse();
  let nextCalled = false;

  middleware({} as Request, out.res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(out.statusCode, null);
});

test("createRequireRole: allows admin when admin is permitted", () => {
  const user: AuthUser = { id: "admin-1", email: "admin@example.com", role: "admin" };
  const middleware = createRequireRole(["admin"], () => user);

  const out = makeResponse();
  let nextCalled = false;

  middleware({} as Request, out.res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(out.statusCode, null);
});

test("createRequireRole: rejects host on admin-only route", () => {
  const user: AuthUser = { id: "host-1", email: "host@example.com", role: "host" };
  const middleware = createRequireRole(["admin"], () => user);

  const out = makeResponse();
  let nextCalled = false;

  middleware({} as Request, out.res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(out.statusCode, 403);
});
