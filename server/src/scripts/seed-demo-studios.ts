// src/scripts/seed-demo-studios.ts
// Upsert the 24-listing demo catalog into MongoDB.
//
// Usage (from the server directory):
//   npm run seed:studios
//
// The script is idempotent: every listing and host has a stable ObjectId, so
// running it again updates the same documents instead of creating duplicates.

import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../config/database.js";
import { DEMO_HOSTS, DEMO_STUDIOS } from "../data/demo-studios.js";
import {
  getStudioCollection,
  type StudioDocument,
} from "../models/studio.model.js";
import {
  getUserCollection,
  type UserDocument,
} from "../models/user.model.js";

dotenv.config();

/** Old end-to-end fixtures that duplicated each other in the dev database. */
const LEGACY_TEST_STUDIO = {
  title: "Pabna Riverside Creative Studio",
  hostId: "64f1a2b3c4d5e6f7890a1b2c",
};

async function seedDemoStudios(): Promise<void> {
  const { client } = await connectToDatabase();
  const studios = getStudioCollection();
  const users = getUserCollection();

  try {
    const hostsByEmail = new Map(
      DEMO_HOSTS.map((host) => [host.email, host])
    );

    const hostDocuments: UserDocument[] = DEMO_HOSTS.map((host) => ({
      _id: new ObjectId(host._id),
      name: host.name,
      email: host.email,
      emailVerified: true,
      image: host.avatar,
      avatar: host.avatar,
      role: "host",
      createdAt: host.joinedAt,
      updatedAt: host.joinedAt,
    }));

    await users.bulkWrite(
      hostDocuments.map((host) => ({
        replaceOne: {
          filter: { _id: host._id },
          replacement: host,
          upsert: true,
        },
      }))
    );

    const studioDocuments: StudioDocument[] = DEMO_STUDIOS.map((studio) => {
      const host = hostsByEmail.get(studio.hostEmail);

      if (!host) {
        throw new Error(
          `Demo studio "${studio.slug}" references an unknown host: ${studio.hostEmail}`
        );
      }

      return {
        _id: new ObjectId(studio._id),
        title: studio.title,
        description: studio.description,
        category: studio.category,
        location: studio.location,
        pricePerHour: studio.pricePerHour,
        capacity: studio.capacity,
        features: studio.features,
        images: studio.images,
        booking: studio.booking,
        hostId: new ObjectId(host._id),
        status: studio.status,
        createdAt: studio.createdAt,
        updatedAt: studio.updatedAt,
      };
    });

    await studios.bulkWrite(
      studioDocuments.map((studio) => ({
        replaceOne: {
          filter: { _id: studio._id },
          replacement: studio,
          upsert: true,
        },
      }))
    );

    // Remove the duplicate Pabna smoke-test fixtures left by earlier manual
    // testing. This is narrowly scoped and never touches other listings.
    const legacyHostId = new ObjectId(LEGACY_TEST_STUDIO.hostId);
    const legacyResult = await studios.deleteMany({
      _id: { $nin: studioDocuments.map((studio) => studio._id) },
      title: LEGACY_TEST_STUDIO.title,
      hostId: legacyHostId,
    });

    const categoryCounts = DEMO_STUDIOS.reduce<Record<string, number>>(
      (counts, studio) => {
        counts[studio.category] = (counts[studio.category] ?? 0) + 1;
        return counts;
      },
      {}
    );

    console.info(
      `[Seed] Upserted ${hostDocuments.length} hosts and ${studioDocuments.length} studios.`
    );
    console.info(
      `[Seed] Categories: ${Object.entries(categoryCounts)
        .map(([category, count]) => `${category}=${count}`)
        .join(", ")}`
    );
    if (legacyResult.deletedCount > 0) {
      console.info(
        `[Seed] Removed ${legacyResult.deletedCount} legacy duplicate fixture(s).`
      );
    }
    console.info("[Seed] Studio detail URLs:");
    for (const studio of DEMO_STUDIOS) {
      console.info(`  /studios/${studio._id}  ${studio.title}`);
    }
  } finally {
    await client.close();
  }
}

seedDemoStudios().catch((error) => {
  console.error(
    "[Seed] Failed to seed demo studios:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
