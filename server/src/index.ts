import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { getAuth, initAuth } from "./config/auth.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = (
  process.env.CLIENT_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const PRIVATE_IPV4_PATTERN =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;

/**
 * Local development is commonly opened through 127.0.0.1 or the LAN address
 * Next prints. Those loopback/private origins are safe to reflect while
 * credentials stay enabled; public origins are still rejected.
 */
function isDevelopmentOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;

    const host = hostname.toLowerCase();

    return (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      PRIVATE_IPV4_PATTERN.test(host)
    );
  } catch {
    return false;
  }
}

// Cookie-based auth requires an exact origin plus credentialed requests.
// Outside development only the configured CLIENT_URL is allowed.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === CLIENT_URL) {
        callback(null, true);
        return;
      }

      if (IS_DEVELOPMENT && isDevelopmentOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  })
);

// Better Auth must receive the raw request stream, so it is mounted before
// express.json(). The handler is lazy because the auth instance depends on
// the MongoDB connection established during startup.
let authHandler: ReturnType<typeof toNodeHandler> | null = null;

app.all("/api/auth/*", (req, res, next) => {
  try {
    authHandler ??= toNodeHandler(getAuth());
    Promise.resolve(authHandler(req, res)).catch(next);
  } catch (err) {
    next(err);
  }
});

app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Connect to MongoDB and initialize the single Better Auth instance before
// accepting requests.
(async () => {
  try {
    await initAuth();

    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    }
  } catch (err) {
    // Never log secrets, cookies, or raw auth errors during startup.
    console.error(
      "[Server] Failed to initialize:",
      err instanceof Error ? err.name : "unknown error"
    );
    process.exit(1);
  }
})();

export default app;
