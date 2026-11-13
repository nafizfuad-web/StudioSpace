import { Router, Request, Response, type RequestHandler } from "express";
import { ObjectId, type Collection } from "mongodb";
import {
  getStudioCollection,
  createStudioDoc,
  Address,
  StudioCategory,
  StudioDocument,
} from "../models/studio.model.js";
import {
  getAuthUser,
  requireAuth,
} from "../middleware/require-auth.middleware.js";
import { createRequireStudioOwner } from "../middleware/studio-owner.middleware.js";
import {
  getUserCollection,
  type UserDocument,
} from "../models/user.model.js";

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

/** Server-owned fields that clients must never modify. */
const PROTECTED_STUDIO_FIELDS = [
  "hostId",
  "_id",
  "status",
  "createdAt",
  "updatedAt",
] as const;

type EditableStudioField = (typeof EDITABLE_STUDIO_FIELDS)[number];

/** Check that a value is an array containing only strings. */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Return the first protected field present in the request body, if any. */
function findProtectedField(input: Record<string, unknown>): string | null {
  for (const field of PROTECTED_STUDIO_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      return field;
    }
  }
  return null;
}

export interface StudioRouterDeps {
  requireAuth: RequestHandler;
  getCollection: () => Collection<StudioDocument>;
  /** Optional user collection used to attach public host details. */
  getUserCollection?: () => Collection<UserDocument>;
}

/** Public host fields returned with studio details (never email or secrets). */
export interface PublicHost {
  _id: string;
  name: string;
  avatar: string | null;
  role?: string;
  createdAt?: Date;
}

/**
 * Build the studio router.
 *
 * The authentication middleware and collection getter are injectable so tests
 * can exercise the real route behavior without connecting to MongoDB or using
 * real session tokens.
 */
export function createStudioRouter(deps: StudioRouterDeps): Router {
  const router = Router();
  const requireStudioOwner = createRequireStudioOwner(deps.getCollection);
  const getCollection = deps.getCollection;
  const getUser = deps.getUserCollection;

  /**
   * GET /studios
   * Retrieve all studio documents from the "studios" collection.
   */
  router.get("/studios", async (_req: Request, res: Response) => {
    try {
      const studios = await getCollection().find().toArray();

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
          message:
            "Invalid studio ID. Must be a 24-character hexadecimal string.",
        });
        return;
      }

      const studio = await getCollection().findOne({
        _id: new ObjectId(id),
      });

      if (!studio) {
        res.status(404).json({
          success: false,
          message: "Studio not found.",
        });
        return;
      }

      // --- Attach public host details when a user lookup is available ---
      let host: PublicHost | null = null;

      if (getUser) {
        try {
          const hostDoc = await getUser().findOne(
            { _id: studio.hostId },
            {
              projection: {
                name: 1,
                avatar: 1,
                image: 1,
                role: 1,
                createdAt: 1,
              },
            }
          );

          if (hostDoc) {
            host = {
              _id: String(hostDoc._id),
              name: hostDoc.name?.trim() || "StudioSpace Host",
              avatar: hostDoc.avatar ?? hostDoc.image ?? null,
              role: hostDoc.role,
              createdAt: hostDoc.createdAt,
            };
          }
        } catch (hostErr) {
          // Host details are supplementary; a lookup failure must not hide the
          // studio itself.
          console.error(
            "[StudioRoute] Failed to fetch studio host details:",
            hostErr
          );
        }
      }

      res.status(200).json({
        success: true,
        studio,
        host,
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
   * Requires an authenticated user who owns the studio.
   */
  router.put(
    "/studios/:id",
    deps.requireAuth,
    requireStudioOwner,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // --- Validate the ID format before querying MongoDB ---
        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message:
              "Invalid studio ID. Must be a 24-character hexadecimal string.",
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

        // --- Reject server-owned fields instead of silently ignoring them ---
        const protectedField = findProtectedField(input);
        if (protectedField) {
          res.status(400).json({
            success: false,
            message: `Field "${protectedField}" cannot be modified.`,
          });
          return;
        }

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
          if (
            typeof input.description !== "string" ||
            input.description.trim() === ""
          ) {
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
        const studio = await getCollection().findOneAndUpdate(
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
    }
  );

  /**
   * DELETE /studios/:id
   * Delete a single studio document owned by the authenticated user.
   */
  router.delete(
    "/studios/:id",
    deps.requireAuth,
    requireStudioOwner,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // --- Validate the ID format before querying MongoDB ---
        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message:
              "Invalid studio ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        // --- Delete only by _id, never by hostId or other fields ---
        const result = await getCollection().deleteOne({
          _id: new ObjectId(id),
        });

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
    }
  );

  /**
   * POST /studios
   * Create a new studio document for the authenticated user.
   *
   * `hostId` always comes from the verified session. A client-supplied
   * `hostId` is rejected rather than trusted.
   */
  router.post(
    "/studios",
    deps.requireAuth,
    async (req: Request, res: Response) => {
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

        // --- Never accept a client-supplied owner identifier ---
        if (Object.prototype.hasOwnProperty.call(input, "hostId")) {
          res.status(400).json({
            success: false,
            message:
              "hostId is derived from the authenticated session and cannot be supplied.",
          });
          return;
        }

        // --- Check required fields ---
        const requiredFields = [
          "title",
          "description",
          "category",
          "location",
          "pricePerHour",
          "capacity",
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

        if (
          typeof input.description !== "string" ||
          input.description.trim() === ""
        ) {
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

        // --- Derive ownership exclusively from the verified session ---
        const hostId = getAuthUser(res).id;

        if (!OBJECT_ID_RE.test(hostId)) {
          console.error(
            "[StudioRoute] Authenticated user ID is not a valid ObjectId."
          );
          res.status(500).json({
            success: false,
            message: "Unable to create studio. Please try again later.",
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
          hostId,
        });

        // --- Insert into MongoDB ---
        // createStudioDoc() omits _id; MongoDB generates it during insertOne().
        const result = await getCollection().insertOne(doc as StudioDocument);

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
    }
  );

  return router;
}

export default createStudioRouter({
  requireAuth,
  getCollection: getStudioCollection,
  getUserCollection,
});
