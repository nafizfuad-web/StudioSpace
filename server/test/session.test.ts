import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request } from "express";
import {
  resolveSessionWith,
  type AuthInstance,
} from "../src/config/auth.js";

const USER_ID = "64f1a2b3c4d5e6f7890a1b2c";

test("forwards the cookie header to Better Auth and returns the verified user", async () => {
  let receivedCookie: string | null = null;

  const fakeAuth = {
    api: {
      getSession: async ({ headers }: { headers: Headers }) => {
        receivedCookie = headers.get("cookie");
        return {
          user: {
            id: USER_ID,
            email: "owner@example.com",
            role: "host",
          },
        };
      },
    },
  } as unknown as AuthInstance;

  const req = {
    headers: { cookie: "better-auth.session_token=test-only-value" },
  } as unknown as Request;

  const user = await resolveSessionWith(fakeAuth, req);

  assert.equal(receivedCookie, "better-auth.session_token=test-only-value");
  assert.deepEqual(user, {
    id: USER_ID,
    email: "owner@example.com",
    role: "host",
  });
});

test("returns null when Better Auth reports no session", async () => {
  const fakeAuth = {
    api: {
      getSession: async () => null,
    },
  } as unknown as AuthInstance;

  const req = { headers: {} } as unknown as Request;

  assert.equal(await resolveSessionWith(fakeAuth, req), null);
});
