import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import type { Db } from "mongodb";
import type { AuthUser } from "../types/auth.js";
import { connectToDatabase } from "./database.js";

/**
 * Read the Better Auth secret without ever logging or returning its value.
 * Better Auth requires at least 32 characters of high-entropy input.
 */
function getRequiredSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set to a random value of at least 32 characters."
    );
  }

  return secret;
}

/**
 * Build the single Better Auth instance used by the server.
 *
 * `generateId` is intentionally left at the MongoDB adapter default so user
 * and session identifiers remain 24-character ObjectId-compatible strings.
 * This keeps `studios.hostId` (an ObjectId) compatible with authenticated
 * user IDs.
 */
function buildAuth(db: Db) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    database: mongodbAdapter(db),
    baseURL:
      process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 5000}`,
    secret: getRequiredSecret(),
    trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:3000"],
    ...(googleClientId && googleClientSecret
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          },
        }
      : {}),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: ["renter", "host", "admin"],
          required: false,
          defaultValue: "renter",
          input: false,
        },
      },
    },
    session: {
      modelName: "sessions",
    },
    account: {
      modelName: "accounts",
    },
    verification: {
      modelName: "verifications",
    },
  });
}

export type AuthInstance = ReturnType<typeof buildAuth>;

let auth: AuthInstance | null = null;

/** Build the auth instance for a specific database (used by tests/tools). */
export function createAuth(db: Db): AuthInstance {
  return buildAuth(db);
}

/**
 * Initialize Better Auth after the MongoDB connection has been established.
 * The auth instance is lazy because the MongoDB adapter needs a live Db.
 */
export async function initAuth(): Promise<AuthInstance> {
  if (auth) return auth;

  const { db } = await connectToDatabase();
  auth = createAuth(db);
  return auth;
}

/** Return the initialized Better Auth instance. */
export function getAuth(): AuthInstance {
  if (!auth) {
    throw new Error(
      "Better Auth has not been initialized. Call initAuth() after connecting to MongoDB."
    );
  }
  return auth;
}

/**
 * Verify a session with a specific Better Auth instance. Exported separately
 * so tests can exercise cookie forwarding without a live database.
 */
export async function resolveSessionWith(
  authInstance: AuthInstance,
  req: Request
): Promise<AuthUser | null> {
  const session = await authInstance.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role:
      typeof session.user.role === "string" ? session.user.role : undefined,
  };
}

/**
 * Verify the session cookie on an Express request and return only the user
 * fields needed for authorization. Session tokens and cookies are never
 * returned to callers.
 */
export async function resolveSession(req: Request): Promise<AuthUser | null> {
  return resolveSessionWith(getAuth(), req);
}
