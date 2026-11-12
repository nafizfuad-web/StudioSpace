// src/config/database.ts
import { MongoClient, Db, MongoClientOptions } from "mongodb";

/**
 * Environment variables expected:
 *   MONGODB_URI        – Full MongoDB connection string (e.g. mongodb+srv://...)
 *   MONGODB_DATABASE   – Database name. If omitted, defaults to "studiospace".
 */
const uri = process.env.MONGODB_URI as string;
if (!uri) {
  // Fail fast – the server cannot operate without a DB connection.
  console.error("[MongoDB] MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DATABASE ?? "studiospace";

// Options: keep the connection alive and use the new URL parser.
const options: MongoClientOptions = {};

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB and cache the client/database instances.
 * Subsequent calls will return the already‑connected objects.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(dbName);
    console.info(`[MongoDB] Connected to database "${dbName}"`);
    return { client, db };
  } catch (err) {
    console.error("[MongoDB] Connection error:", err);
    // Ensure we exit with a non‑zero status as required.
    process.exit(1);
  }
}

/**
 * Export the live database reference for convenience.
 * Call `connectToDatabase` first to guarantee it is initialized.
 */
export function getDb(): Db {
  if (!db) {
    console.error("[MongoDB] Database not initialized. Call connectToDatabase() first.");
    process.exit(1);
  }
  return db;
}

import { MongoClient, Db, MongoClientOptions } from "mongodb";
// MongoDB connection helper for StudioSpace backend.
// Reads connection details from environment variables and exports a single
// MongoClient instance (reused across the app) and the selected database.

// We'll load the official MongoDB driver dynamically at runtime.
// Types are provided via a minimal declaration file (src/types/mongodb.d.ts).
// This avoids a hard compile‑time dependency while still using the driver when present.


/**
 * Environment variables expected:
 *   MONGODB_URI        – Full MongoDB connection string (e.g. mongodb+srv://...)
 *   MONGODB_DATABASE   – Database name. If omitted, defaults to "studiospace".
 */
const uri = process.env.MONGODB_URI;
if (!uri) {
  // Fail fast – the server cannot operate without a DB connection.
  console.error("[MongoDB] MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DATABASE ?? "studiospace";

// Options: keep the connection alive and use the new URL parser.
const options: MongoClientOptions = {
  // The driver defaults are fine; we enable useUnifiedTopology implicitly.
};

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB and cache the client/database instances.
 * Subsequent calls will return the already‑connected objects.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(dbName);
    console.info(`[MongoDB] Connected to database "${dbName}"`);
    return { client, db };
  } catch (err) {
    console.error("[MongoDB] Connection error:", err);
    // Ensure we exit with a non‑zero status as required.
    process.exit(1);
  }
}

/**
 * Export the live database reference for convenience.
 * Call `connectToDatabase` first to guarantee it is initialized.
 */
export function getDb(): Db {
  if (!db) {
    console.error("[MongoDB] Database not initialized. Call connectToDatabase() first.");
    process.exit(1);
  }
  return db;
}
