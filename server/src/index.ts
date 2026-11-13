import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { getAuth, initAuth } from "./config/auth.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

// Cookie-based auth requires an exact origin plus credentialed requests.
app.use(
  cors({
    origin: CLIENT_URL,
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
