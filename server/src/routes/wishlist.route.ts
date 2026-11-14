import { Router, Request, Response, type RequestHandler } from "express";
import { ObjectId, type Collection } from "mongodb";
import {
  getWishlistCollection,
  createWishlistDoc,
  type SavedStudioDocument,
} from "../models/wishlist.model.js";
import {
  getStudioCollection,
  type StudioDocument,
} from "../models/studio.model.js";
import {
  getAuthUser,
  requireAuth,
} from "../middleware/require-auth.middleware.js";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

export interface WishlistRouterDeps {
  requireAuth: RequestHandler;
  getWishlistCollection: () => Collection<SavedStudioDocument>;
  getStudioCollection: () => Collection<StudioDocument>;
}

export function createWishlistRouter(deps: WishlistRouterDeps): Router {
  const router = Router();
  const getWishlist = deps.getWishlistCollection;
  const getStudios = deps.getStudioCollection;

  /**
   * GET /wishlist
   * Retrieve all studios saved to the authenticated user's wishlist.
   */
  router.get(
    "/wishlist",
    deps.requireAuth,
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const savedItems = await getWishlist()
          .find({ userId: new ObjectId(user.id) })
          .sort({ createdAt: -1 })
          .toArray();

        const studioIds = savedItems.map((item) => item.studioId);

        // Fetch corresponding studio documents
        const studios = await getStudios()
          .find({ _id: { $in: studioIds } })
          .toArray();

        // Map into full response keeping saved order
        const studioMap = new Map(studios.map((s) => [String(s._id), s]));
        const savedStudios = savedItems
          .map((item) => {
            const studio = studioMap.get(String(item.studioId));
            if (!studio) return null;
            return {
              savedId: String(item._id),
              savedAt: item.createdAt,
              studio: {
                _id: String(studio._id),
                title: studio.title,
                description: studio.description,
                category: studio.category,
                location: studio.location,
                pricePerHour: studio.pricePerHour,
                capacity: studio.capacity,
                features: studio.features ?? [],
                images: studio.images ?? [],
                booking: studio.booking,
                hostId: String(studio.hostId),
                status: studio.status,
              },
            };
          })
          .filter(Boolean);

        res.status(200).json({
          success: true,
          count: savedStudios.length,
          savedStudios,
        });
      } catch (err) {
        console.error("[WishlistRoute] Failed to fetch saved studios:", err);
        res.status(500).json({
          success: false,
          message: "Unable to retrieve your saved studios. Please try again later.",
        });
      }
    }
  );

  /**
   * GET /wishlist/:studioId/check
   * Check whether a specific studio is in the authenticated user's wishlist.
   */
  router.get(
    "/wishlist/:studioId/check",
    deps.requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const { studioId } = req.params;

        if (typeof studioId !== "string" || !OBJECT_ID_RE.test(studioId)) {
          res.status(400).json({
            success: false,
            message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        const item = await getWishlist().findOne({
          userId: new ObjectId(user.id),
          studioId: new ObjectId(studioId),
        });

        res.status(200).json({
          success: true,
          isSaved: Boolean(item),
        });
      } catch (err) {
        console.error("[WishlistRoute] Failed to check wishlist status:", err);
        res.status(500).json({
          success: false,
          message: "Unable to check saved status. Please try again later.",
        });
      }
    }
  );

  /**
   * POST /wishlist/:studioId
   * Save a studio to the authenticated user's wishlist (idempotent).
   */
  router.post(
    "/wishlist/:studioId",
    deps.requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const { studioId } = req.params;

        if (typeof studioId !== "string" || !OBJECT_ID_RE.test(studioId)) {
          res.status(400).json({
            success: false,
            message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        const studio = await getStudios().findOne({ _id: new ObjectId(studioId) });
        if (!studio) {
          res.status(404).json({
            success: false,
            message: "Studio not found.",
          });
          return;
        }

        // Upsert into wishlist to prevent duplicates
        await getWishlist().updateOne(
          {
            userId: new ObjectId(user.id),
            studioId: new ObjectId(studioId),
          },
          {
            $setOnInsert: {
              userId: new ObjectId(user.id),
              studioId: new ObjectId(studioId),
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );

        res.status(200).json({
          success: true,
          message: "Studio added to your saved list.",
          isSaved: true,
        });
      } catch (err) {
        console.error("[WishlistRoute] Failed to add studio to wishlist:", err);
        res.status(500).json({
          success: false,
          message: "Unable to save studio. Please try again later.",
        });
      }
    }
  );

  /**
   * DELETE /wishlist/:studioId
   * Remove a studio from the authenticated user's wishlist.
   */
  router.delete(
    "/wishlist/:studioId",
    deps.requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const { studioId } = req.params;

        if (typeof studioId !== "string" || !OBJECT_ID_RE.test(studioId)) {
          res.status(400).json({
            success: false,
            message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        await getWishlist().deleteOne({
          userId: new ObjectId(user.id),
          studioId: new ObjectId(studioId),
        });

        res.status(200).json({
          success: true,
          message: "Studio removed from your saved list.",
          isSaved: false,
        });
      } catch (err) {
        console.error("[WishlistRoute] Failed to remove studio from wishlist:", err);
        res.status(500).json({
          success: false,
          message: "Unable to remove studio. Please try again later.",
        });
      }
    }
  );

  return router;
}

export default createWishlistRouter({
  requireAuth,
  getWishlistCollection,
  getStudioCollection,
});
