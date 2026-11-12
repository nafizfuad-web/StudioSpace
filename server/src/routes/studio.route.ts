import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  getStudioCollection,
  createStudioDoc,
  Address,
  StudioCategory,
  StudioDocument,
} from "../models/studio.model";

const router = Router();

/** The five allowed studio categories. */
const VALID_CATEGORIES: StudioCategory[] = [
  "photography",
  "film",
  "podcast",
  "music",
  "workshop",
];

/** 24-character hexadecimal string (MongoDB ObjectId format). */
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/** Fields clients are allowed to update on an existing studio. */
const EDITABLE_STUDIO_FIELDS = [
  "title",
  "description",
  "category",
  "location",
  "pricePerHour",
  "capacity",
  "features",
  "images",
] as const;

type EditableStudioField = (typeof EDITABLE_STUDIO_FIELDS)[number];

/** Check that a value is an array containing only strings. */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * GET /studios
 * Retrieve all studio documents from the "studios" collection.
 */
router.get("/studios", async (_req: Request, res: Response) => {
  try {
    const collection = getStudioCollection();
    const studios = await collection.find().toArray();

    res.status(200).json({
      success: true,
      count: studios.length,
      studios,
    });
  } catch (err) {
    console.error("[StudioRoute] Failed to fetch studios:", err);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve studios. Please try again later.",
    });
  }
});

/**
 * GET /studios/:id
 * Retrieve a single studio document by its MongoDB ObjectId.
 */
router.get("/studios/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // --- Validate the ID format before querying MongoDB ---
    if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
      });
      return;
    }

    const collection = getStudioCollection();
    const studio = await collection.findOne({ _id: new ObjectId(id) });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      studio,
    });
  } catch (err) {
    console.error("[StudioRoute] Failed to fetch studio by ID:", err);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve studio. Please try again later.",
    });
  }
});

/**
 * PUT /studios/:id
 * Update an existing studio document using a whitelisted set of fields.
 */
router.put("/studios/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // --- Validate the ID format before querying MongoDB ---
    if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
      });
      return;
    }

    const body: unknown = req.body;

    // --- Guard: body must be a non-null, non-array object ---
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      res.status(400).json({
        success: false,
        message: "Request body must be a JSON object.",
      });
      return;
    }

    const input = body as Record<string, unknown>;
    const updates: Partial<Pick<StudioDocument, EditableStudioField>> = {};
    const has = (field: EditableStudioField) =>
      Object.prototype.hasOwnProperty.call(input, field);

    // --- Validate and collect only whitelisted fields ---
    if (has("title")) {
      if (typeof input.title !== "string" || input.title.trim() === "") {
        res.status(400).json({
          success: false,
          message: "title must be a non-empty string.",
        });
        return;
      }
      updates.title = input.title.trim();
    }

    if (has("description")) {
      if (typeof input.description !== "string" || input.description.trim() === "") {
        res.status(400).json({
          success: false,
          message: "description must be a non-empty string.",
        });
        return;
      }
      updates.description = input.description.trim();
    }

    if (has("category")) {
      if (
        typeof input.category !== "string" ||
        !VALID_CATEGORIES.includes(input.category as StudioCategory)
      ) {
        res.status(400).json({
          success: false,
          message: `Invalid category "${String(input.category)}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        });
        return;
      }
      updates.category = input.category as StudioCategory;
    }

    if (has("location")) {
      if (
        typeof input.location !== "object" ||
        input.location === null ||
        Array.isArray(input.location)
      ) {
        res.status(400).json({
          success: false,
          message: "location must be a JSON object.",
        });
        return;
      }
      updates.location = input.location as Address;
    }

    if (has("pricePerHour")) {
      if (
        typeof input.pricePerHour !== "number" ||
        !Number.isFinite(input.pricePerHour) ||
        input.pricePerHour <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "pricePerHour must be a positive number.",
        });
        return;
      }
      updates.pricePerHour = input.pricePerHour;
    }

    if (has("capacity")) {
      if (
        typeof input.capacity !== "number" ||
        !Number.isInteger(input.capacity) ||
        input.capacity <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "capacity must be a positive integer.",
        });
        return;
      }
      updates.capacity = input.capacity;
    }

    if (has("features")) {
      if (!isStringArray(input.features)) {
        res.status(400).json({
          success: false,
          message: "features must be an array of strings.",
        });
        return;
      }
      updates.features = input.features.map((feature) => feature.trim());
    }

    if (has("images")) {
      if (!isStringArray(input.images)) {
        res.status(400).json({
          success: false,
          message: "images must be an array of strings.",
        });
        return;
      }
      updates.images = input.images.map((image) => image.trim());
    }

    // --- Reject an update with no editable fields ---
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: `Request body must include at least one editable field: ${EDITABLE_STUDIO_FIELDS.join(", ")}.`,
      });
      return;
    }

    // --- Update only whitelisted fields and refresh updatedAt ---
    const collection = getStudioCollection();
    const studio = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after", includeResultMetadata: false }
    );

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      studio,
    });
  } catch (err) {
    console.error("[StudioRoute] Failed to update studio:", err);
    res.status(500).json({
      success: false,
      message: "Unable to update studio. Please try again later.",
    });
  }
});

/**
 * DELETE /studios/:id
 * Delete a single studio document by its MongoDB ObjectId.
 *
 * DEVELOPMENT ONLY: Authentication and owner authorization are not implemented.
 * Before production, this endpoint must require an authenticated user and verify
 * that the user owns the studio (hostId) before allowing deletion.
 */
router.delete("/studios/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // --- Validate the ID format before querying MongoDB ---
    if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
      });
      return;
    }

    // --- Delete only by _id, never by hostId or other fields ---
    const collection = getStudioCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully.",
    });
  } catch (err) {
    console.error("[StudioRoute] Failed to delete studio:", err);
    res.status(500).json({
      success: false,
      message: "Unable to delete studio. Please try again later.",
    });
  }
});

/**
 * POST /studios
 * Create a new studio document.
 *
 * NOTE: `hostId` is currently accepted from req.body because authentication
 * is not yet implemented. Once auth middleware is in place, hostId should be
 * derived from the authenticated user's session/JWT instead of trusting the
 * client-supplied value.
 */
router.post("/studios", async (req: Request, res: Response) => {
  try {
    const body: unknown = req.body;

    // --- Guard: body must be a non-null, non-array object ---
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      res.status(400).json({
        success: false,
        message: "Request body must be a JSON object.",
      });
      return;
    }

    const input = body as Record<string, unknown>;

    // --- Check required fields ---
    const requiredFields = [
      "title",
      "description",
      "category",
      "location",
      "pricePerHour",
      "capacity",
      "hostId",
    ] as const;

    const missing = requiredFields.filter(
      (field) => input[field] === undefined || input[field] === null
    );

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
      return;
    }

    // --- Validate title and description ---
    if (typeof input.title !== "string" || input.title.trim() === "") {
      res.status(400).json({
        success: false,
        message: "title must be a non-empty string.",
      });
      return;
    }

    if (typeof input.description !== "string" || input.description.trim() === "") {
      res.status(400).json({
        success: false,
        message: "description must be a non-empty string.",
      });
      return;
    }

    // --- Validate category ---
    if (
      typeof input.category !== "string" ||
      !VALID_CATEGORIES.includes(input.category as StudioCategory)
    ) {
      res.status(400).json({
        success: false,
        message: `Invalid category "${String(input.category)}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
      return;
    }

    // --- Validate location is a non-null, non-array object ---
    if (
      typeof input.location !== "object" ||
      input.location === null ||
      Array.isArray(input.location)
    ) {
      res.status(400).json({
        success: false,
        message: "location must be a JSON object.",
      });
      return;
    }

    // --- Validate pricing and capacity ---
    if (
      typeof input.pricePerHour !== "number" ||
      !Number.isFinite(input.pricePerHour) ||
      input.pricePerHour <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "pricePerHour must be a positive number.",
      });
      return;
    }

    if (
      typeof input.capacity !== "number" ||
      !Number.isInteger(input.capacity) ||
      input.capacity <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "capacity must be a positive integer.",
      });
      return;
    }

    // --- Validate hostId format ---
    if (typeof input.hostId !== "string" || !OBJECT_ID_RE.test(input.hostId)) {
      res.status(400).json({
        success: false,
        message: "hostId must be a 24-character hexadecimal string.",
      });
      return;
    }

    // --- Build the document from a fixed whitelist (ignore extra fields) ---
    const doc = createStudioDoc({
      title: input.title,
      description: input.description,
      category: input.category as StudioCategory,
      location: input.location as Address,
      pricePerHour: input.pricePerHour,
      capacity: input.capacity,
      hostId: input.hostId,
    });

    // --- Insert into MongoDB ---
    // createStudioDoc() omits _id; MongoDB generates it during insertOne().
    const collection = getStudioCollection();
    const result = await collection.insertOne(doc as StudioDocument);

    res.status(201).json({
      success: true,
      studio: { _id: result.insertedId, ...doc },
    });
  } catch (err) {
    // Validation errors thrown by createStudioDoc() → 400
    if (err instanceof Error) {
      const validationMessages = [
        "Studio title is required",
        "Studio description is required",
        "pricePerHour must be positive",
        "capacity must be a positive integer",
      ];

      if (validationMessages.some((msg) => err.message === msg)) {
        res.status(400).json({
          success: false,
          message: err.message,
        });
        return;
      }
    }

    // Unexpected errors → generic 500 (never expose internal DB details)
    console.error("[StudioRoute] Failed to create studio:", err);
    res.status(500).json({
      success: false,
      message: "Unable to create studio. Please try again later.",
    });
  }
});

export default router;
