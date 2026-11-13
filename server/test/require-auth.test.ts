import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { createRequireAuth } from "../src/middleware/require-auth.middleware.js";
import { withServer } from "./helpers.js";

const USER = {
  id: "64f1a2b3c4d5e6f7890a1b2c",
  email: "owner@example.com",
  role: "host",
};

test("returns 401 when no authenticated session exists", async () => {
  const app = express();

  app.get("/protected", createRequireAuth(async () => null), (_req, res) => {
    res.status(200).json({ success: true });
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/protected`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Authentication required.",
    });
  });
});

test("attaches the verified session user and continues", async () => {
  const app = express();

  app.get(
    "/protected",
    createRequireAuth(async () => USER),
    (_req, res) => {
      res.status(200).json({
        success: true,
        user: res.locals.authUser,
      });
    }
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/protected`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      user: USER,
    });
  });
});

test("returns a generic 500 when session verification fails", async () => {
  const app = express();

  app.get(
    "/protected",
    createRequireAuth(async () => {
      throw new Error("internal database failure");
    }),
    (_req, res) => {
      res.status(200).json({ success: true });
    }
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/protected`);
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(body, {
      success: false,
      message: "Unable to verify authentication. Please try again later.",
    });
    assert.doesNotMatch(JSON.stringify(body), /internal database failure/);
  });
});
