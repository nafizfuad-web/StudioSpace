import { MongoClient, Db, MongoClientOptions } from "mongodb";

/**
 * Reusable MongoDB client and database for the application.
 * The connection details are read lazily inside `connectToDatabase` after
 * `dotenv.config()` has been executed in `src/index.ts`.
 */
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB using environment variables.
 * This function should be called after the environment has been loaded.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  // Load environment variables now (dotenv is already configured in index.ts).
  const uri = process.env.MONGODB_URI as string;
  if (!uri) {
    console.error("[MongoDB] MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }
  const dbName = process.env.MONGODB_DATABASE ?? "studiospace";
  const options: MongoClientOptions = {};

  try {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(dbName);
    console.info(`[MongoDB] Connected to database "${dbName}"`);
    return { client, db };
  } catch (err) {
    console.error("[MongoDB] Connection error:", err);
    process.exit(1);
  }
}

/**
 * Get the initialized database instance.
 */
export function getDb(): Db {
  if (!db) {
    console.error("[MongoDB] Database not initialized. Call connectToDatabase() first.");
    process.exit(1);
  }
  return db;
}
