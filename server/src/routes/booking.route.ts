import { Router, Request, Response, type RequestHandler } from "express";
import { ObjectId, type Collection } from "mongodb";
import {
  getBookingCollection,
  createBookingDoc,
  type BookingDocument,
  type BookingStatus,
} from "../models/booking.model.js";
import {
  getStudioCollection,
  type StudioDocument,
} from "../models/studio.model.js";
import {
  getUserCollection,
  type UserDocument,
  type UserRole,
} from "../models/user.model.js";
import {
  getAuthUser,
  requireAuth,
} from "../middleware/require-auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

export interface BookingRouterDeps {
  requireAuth: RequestHandler;
  requireRole?: (...roles: UserRole[]) => RequestHandler;
  getBookingCollection: () => Collection<BookingDocument>;
  getStudioCollection: () => Collection<StudioDocument>;
  getUserCollection?: () => Collection<UserDocument>;
}

export function createBookingRouter(deps: BookingRouterDeps): Router {
  const router = Router();
  const requireRoleMiddleware = deps.requireRole ?? requireRole;
  const getBookings = deps.getBookingCollection;
  const getStudios = deps.getStudioCollection;
  const getUsers = deps.getUserCollection ?? getUserCollection;

  /**
   * Helper to attach studio metadata to a booking document.
   */
  async function attachStudioDetails(booking: BookingDocument) {
    const studio = await getStudios().findOne(
      { _id: booking.studioId },
      { projection: { title: 1, category: 1, location: 1, pricePerHour: 1, images: 1, status: 1 } }
    );

    return {
      id: String(booking._id),
      studioId: String(booking.studioId),
      renterId: String(booking.renterId),
      hostId: String(booking.hostId),
      startAt: booking.startAt,
      endAt: booking.endAt,
      totalPrice: booking.totalPrice,
      guestCount: booking.guestCount ?? 1,
      notes: booking.notes,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      studio: studio
        ? {
            id: String(studio._id),
            title: studio.title,
            category: studio.category,
            location: studio.location,
            pricePerHour: studio.pricePerHour,
            images: studio.images ?? [],
            status: studio.status,
          }
        : null,
    };
  }

  /**
   * POST /bookings
   * Create a new booking reservation for a studio.
   * Calculates hours and price on backend from trusted studio record.
   * Prevents double-booking conflicts.
   */
  router.post(
    "/bookings",
    deps.requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const renter = getAuthUser(res);
        const body: unknown = req.body;

        if (typeof body !== "object" || body === null || Array.isArray(body)) {
          res.status(400).json({
            success: false,
            message: "Request body must be a JSON object.",
          });
          return;
        }

        const input = body as Record<string, unknown>;
        const { studioId, startAt, endAt, guestCount, notes } = input;

        // 1. Validate studio ID
        if (typeof studioId !== "string" || !OBJECT_ID_RE.test(studioId)) {
          res.status(400).json({
            success: false,
            message: "Invalid studio ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        // 2. Validate dates
        if (!startAt || !endAt || typeof startAt !== "string" || typeof endAt !== "string") {
          res.status(400).json({
            success: false,
            message: "Both startAt and endAt dates are required in ISO format.",
          });
          return;
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            message: "Invalid startAt or endAt date format.",
          });
          return;
        }

        if (endDate <= startDate) {
          res.status(400).json({
            success: false,
            message: "endAt must be strictly after startAt.",
          });
          return;
        }

        // Calculate duration in hours (rounded up to nearest hour, minimum 1)
        const durationHours = Math.max(
          1,
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
        );

        // 3. Look up studio in database
        const studio = await getStudios().findOne({ _id: new ObjectId(studioId) });
        if (!studio) {
          res.status(404).json({
            success: false,
            message: "Studio not found.",
          });
          return;
        }

        // Prevent hosts from booking their own studio
        if (String(studio.hostId) === renter.id) {
          res.status(400).json({
            success: false,
            message: "You cannot book your own studio.",
          });
          return;
        }

        // Validate minimum booking hours if specified
        if (studio.booking?.minimumHours && durationHours < studio.booking.minimumHours) {
          res.status(400).json({
            success: false,
            message: `This studio requires a minimum booking of ${studio.booking.minimumHours} hours.`,
          });
          return;
        }

        // 4. Validate guest count
        let parsedGuests = 1;
        if (guestCount !== undefined) {
          if (typeof guestCount !== "number" || !Number.isInteger(guestCount) || guestCount <= 0) {
            res.status(400).json({
              success: false,
              message: "guestCount must be a positive integer.",
            });
            return;
          }
          if (guestCount > studio.capacity) {
            res.status(400).json({
              success: false,
              message: `Number of guests exceeds studio capacity (${studio.capacity} max).`,
            });
            return;
          }
          parsedGuests = guestCount;
        }

        // 5. Check for schedule conflicts
        const conflictingBooking = await getBookings().findOne({
          studioId: studio._id,
          status: { $in: ["confirmed", "pending"] },
          startAt: { $lt: endDate },
          endAt: { $gt: startDate },
        });

        if (conflictingBooking) {
          res.status(409).json({
            success: false,
            message:
              "This studio is already booked or reserved for the selected time window. Please select another time or date.",
          });
          return;
        }

        // 6. Calculate total price on backend from trusted studio pricePerHour
        const calculatedTotalPrice = durationHours * studio.pricePerHour;

        // Status is pending by default (or confirmed if studio has instantBook enabled)
        const initialStatus: BookingStatus = studio.booking?.instantBook
          ? "confirmed"
          : "pending";

        const doc = createBookingDoc({
          studioId,
          renterId: renter.id,
          hostId: String(studio.hostId),
          startAt: startDate,
          endAt: endDate,
          totalPrice: calculatedTotalPrice,
          guestCount: parsedGuests,
          notes: typeof notes === "string" ? notes.trim() : undefined,
          status: initialStatus,
        });

        const result = await getBookings().insertOne(doc as BookingDocument);

        const createdBooking = await attachStudioDetails({
          ...doc,
          _id: result.insertedId,
        } as BookingDocument);

        res.status(201).json({
          success: true,
          message:
            initialStatus === "confirmed"
              ? "Booking confirmed instantly!"
              : "Booking reservation submitted successfully! Awaiting host confirmation.",
          booking: createdBooking,
        });
      } catch (err) {
        console.error("[BookingRoute] Failed to create booking:", err);
        res.status(500).json({
          success: false,
          message: "Unable to complete booking reservation. Please try again later.",
        });
      }
    }
  );

  /**
   * GET /bookings/my-bookings
   * Retrieve all bookings made by the authenticated client / renter.
   */
  router.get(
    "/bookings/my-bookings",
    deps.requireAuth,
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const renter = getAuthUser(res);
        const bookings = await getBookings()
          .find({ renterId: new ObjectId(renter.id) })
          .sort({ startAt: -1 })
          .toArray();

        const enriched = await Promise.all(
          bookings.map((booking) => attachStudioDetails(booking))
        );

        res.status(200).json({
          success: true,
          count: enriched.length,
          bookings: enriched,
        });
      } catch (err) {
        console.error("[BookingRoute] Failed to fetch renter bookings:", err);
        res.status(500).json({
          success: false,
          message: "Unable to retrieve your bookings. Please try again later.",
        });
      }
    }
  );

  /**
   * GET /bookings/:id
   * Retrieve a single booking by ID.
   * Authorized only for the renter, the studio host, or an admin.
   */
  router.get(
    "/bookings/:id",
    deps.requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const { id } = req.params;

        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message: "Invalid booking ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        const booking = await getBookings().findOne({ _id: new ObjectId(id) });
        if (!booking) {
          res.status(404).json({
            success: false,
            message: "Booking not found.",
          });
          return;
        }

        // Authorization check: must be renter, host, or admin
        const isRenter = String(booking.renterId) === user.id;
        const isHost = String(booking.hostId) === user.id;
        const isAdmin = user.role === "admin";

        if (!isRenter && !isHost && !isAdmin) {
          res.status(403).json({
            success: false,
            message: "You do not have permission to view this booking.",
          });
          return;
        }

        const enriched = await attachStudioDetails(booking);

        res.status(200).json({
          success: true,
          booking: enriched,
        });
      } catch (err) {
        console.error("[BookingRoute] Failed to fetch booking by ID:", err);
        res.status(500).json({
          success: false,
          message: "Unable to retrieve booking details. Please try again later.",
        });
      }
    }
  );

  /**
   * PATCH /bookings/:id/cancel
   * Cancel an upcoming or pending booking.
   * Can be performed by the renter, the studio host, or an admin.
   */
  router.patch(
    "/bookings/:id/cancel",
    deps.requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const { id } = req.params;

        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message: "Invalid booking ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        const booking = await getBookings().findOne({ _id: new ObjectId(id) });
        if (!booking) {
          res.status(404).json({
            success: false,
            message: "Booking not found.",
          });
          return;
        }

        const isRenter = String(booking.renterId) === user.id;
        const isHost = String(booking.hostId) === user.id;
        const isAdmin = user.role === "admin";

        if (!isRenter && !isHost && !isAdmin) {
          res.status(403).json({
            success: false,
            message: "You do not have permission to cancel this booking.",
          });
          return;
        }

        if (booking.status === "cancelled") {
          res.status(400).json({
            success: false,
            message: "This booking has already been cancelled.",
          });
          return;
        }

        if (booking.status === "completed") {
          res.status(400).json({
            success: false,
            message: "Completed bookings cannot be cancelled.",
          });
          return;
        }

        const now = new Date();
        await getBookings().updateOne(
          { _id: booking._id },
          { $set: { status: "cancelled", updatedAt: now } }
        );

        res.status(200).json({
          success: true,
          message: "Booking successfully cancelled.",
          booking: {
            id: String(booking._id),
            status: "cancelled",
            updatedAt: now,
          },
        });
      } catch (err) {
        console.error("[BookingRoute] Failed to cancel booking:", err);
        res.status(500).json({
          success: false,
          message: "Unable to cancel booking. Please try again later.",
        });
      }
    }
  );

  /**
   * GET /owner/bookings
   * Retrieve incoming bookings for studios owned by the authenticated host (or all for admin).
   */
  router.get(
    "/owner/bookings",
    deps.requireAuth,
    requireRoleMiddleware("host", "admin"),
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const filter = user.role === "admin" ? {} : { hostId: new ObjectId(user.id) };

        const bookings = await getBookings()
          .find(filter)
          .sort({ startAt: -1 })
          .toArray();

        const enriched = await Promise.all(
          bookings.map(async (booking) => {
            const base = await attachStudioDetails(booking);
            // Also attach basic renter name/email for host
            const renterDoc = await getUsers().findOne(
              { _id: booking.renterId },
              { projection: { name: 1, email: 1, avatar: 1, image: 1 } }
            );

            return {
              ...base,
              renter: renterDoc
                ? {
                    id: String(renterDoc._id),
                    name: renterDoc.name || "Client",
                    email: renterDoc.email,
                    avatar: renterDoc.avatar ?? renterDoc.image ?? null,
                  }
                : null,
            };
          })
        );

        res.status(200).json({
          success: true,
          count: enriched.length,
          bookings: enriched,
        });
      } catch (err) {
        console.error("[BookingRoute] Failed to fetch owner bookings:", err);
        res.status(500).json({
          success: false,
          message: "Unable to retrieve owner bookings. Please try again later.",
        });
      }
    }
  );

  /**
   * PATCH /owner/bookings/:id/status
   * Host accepts or rejects a pending booking request.
   */
  router.patch(
    "/owner/bookings/:id/status",
    deps.requireAuth,
    requireRoleMiddleware("host", "admin"),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = getAuthUser(res);
        const { id } = req.params;

        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message: "Invalid booking ID. Must be a 24-character hexadecimal string.",
          });
          return;
        }

        const body: unknown = req.body;
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
          res.status(400).json({
            success: false,
            message: "Request body must be a JSON object.",
          });
          return;
        }

        const input = body as Record<string, unknown>;
        const { status } = input;

        if (status !== "confirmed" && status !== "rejected") {
          res.status(400).json({
            success: false,
            message: 'Status must be either "confirmed" or "rejected".',
          });
          return;
        }

        const booking = await getBookings().findOne({ _id: new ObjectId(id) });
        if (!booking) {
          res.status(404).json({
            success: false,
            message: "Booking not found.",
          });
          return;
        }

        // Verify host ownership
        const isHost = String(booking.hostId) === user.id;
        const isAdmin = user.role === "admin";

        if (!isHost && !isAdmin) {
          res.status(403).json({
            success: false,
            message: "You do not have permission to manage this booking.",
          });
          return;
        }

        if (booking.status !== "pending") {
          res.status(400).json({
            success: false,
            message: `Booking has already been ${booking.status}.`,
          });
          return;
        }

        const now = new Date();
        await getBookings().updateOne(
          { _id: booking._id },
          { $set: { status: status as BookingStatus, updatedAt: now } }
        );

        res.status(200).json({
          success: true,
          message: `Booking ${status === "confirmed" ? "accepted" : "rejected"} successfully.`,
          booking: {
            id: String(booking._id),
            status,
            updatedAt: now,
          },
        });
      } catch (err) {
        console.error("[BookingRoute] Failed to update booking status:", err);
        res.status(500).json({
          success: false,
          message: "Unable to update booking status. Please try again later.",
        });
      }
    }
  );

  return router;
}

export default createBookingRouter({
  requireAuth,
  requireRole,
  getBookingCollection,
  getStudioCollection,
  getUserCollection,
});
