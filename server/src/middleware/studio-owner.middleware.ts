import type { RequestHandler } from "express";
import { ObjectId, type Collection } from "mongodb";
import {
  getStudioCollection,
  type StudioDocument,
} from "../models/studio.model.js";
import { getAuthUser } from "./require-auth.middleware.js";

/** 24-character hexadecimal string (MongoDB ObjectId format). */
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/**
 * Build middleware that allows the request only when the authenticated user
 * owns the studio referenced by `req.params.id`.
 *
 * The collection getter is injectable so tests can use an in-memory store.
 */
export function createRequireStudioOwner(
  getCollection: () => Collection<StudioDocument> = getStudioCollection
): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      const user = getAuthUser(res);
      const { id } = req.params;

      if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
        res.status(400).json({
          success: false,
          message:
            "Invalid studio ID. Must be a 24-character hexadecimal string.",
        });
        return;
      }

      const studio = await getCollection().findOne(
        { _id: new ObjectId(id) },
        { projection: { hostId: 1 } }
      );

      if (!studio) {
        res.status(404).json({
          success: false,
          message: "Studio not found.",
        });
        return;
      }

      if (String(studio.hostId) !== user.id) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to modify this studio.",
        });
        return;
      }

      next();
    } catch (err) {
      // Never expose internal authorization or database details.
      console.error(
        "[RequireStudioOwner] Authorization check failed:",
        err instanceof Error ? err.name : "unknown error"
      );

      res.status(500).json({
        success: false,
        message: "Unable to verify studio ownership. Please try again later.",
      });
    }
  };
}

/** Production ownership middleware backed by the studios collection. */
export const requireStudioOwner = createRequireStudioOwner();
