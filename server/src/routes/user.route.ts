import { Router, Request, Response, type RequestHandler } from "express";
import { ObjectId, type Collection } from "mongodb";
import {
  getUserCollection,
  type UserDocument,
  type UserRole,
} from "../models/user.model.js";
import {
  getHostApplicationCollection,
  createHostApplicationDoc,
  type HostApplicationDocument,
  type HostApplicationStatus,
} from "../models/host-application.model.js";
import {
  getAuthUser,
  requireAuth,
} from "../middleware/require-auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const VALID_ROLES: UserRole[] = ["renter", "host", "admin"];

export interface UserRouterDeps {
  requireAuth: RequestHandler;
  requireRole?: (...roles: UserRole[]) => RequestHandler;
  getUserCollection: () => Collection<UserDocument>;
  getApplicationCollection?: () => Collection<HostApplicationDocument>;
}

export function createUserRouter(deps: UserRouterDeps): Router {
  const router = Router();
  const requireRoleMiddleware = deps.requireRole ?? requireRole;
  const getUsers = deps.getUserCollection;
  const getApplications =
    deps.getApplicationCollection ?? getHostApplicationCollection;

  /**
   * Helper to find a user document from res.locals.authUser.
   */
  async function resolveUserDoc(userId: string, email: string): Promise<UserDocument | null> {
    if (OBJECT_ID_RE.test(userId)) {
      const byId = await getUsers().findOne({ _id: new ObjectId(userId) });
      if (byId) return byId;
    }
    return getUsers().findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * GET /user/me
   * Return the current authenticated user's profile, active role, and latest host application.
   */
  router.get(
    "/user/me",
    deps.requireAuth,
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const sessionUser = getAuthUser(res);
        const userDoc = await resolveUserDoc(sessionUser.id, sessionUser.email);

        const role = userDoc?.role ?? (sessionUser.role as UserRole) ?? "renter";
        const name = userDoc?.name ?? "";
        const email = userDoc?.email ?? sessionUser.email;
        const avatar = userDoc?.avatar ?? userDoc?.image ?? null;

        // Fetch user's latest host application if any
        let latestApp: HostApplicationDocument | null = null;
        if (userDoc?._id) {
          latestApp = await getApplications().findOne(
            { userId: userDoc._id },
            { sort: { createdAt: -1 } }
          );
        }

        res.status(200).json({
          success: true,
          user: {
            id: sessionUser.id,
            name,
            email,
            role,
            avatar,
            hostApplication: latestApp
              ? {
                  id: String(latestApp._id),
                  status: latestApp.status,
                  createdAt: latestApp.createdAt,
                  rejectionReason: latestApp.rejectionReason,
                }
              : null,
          },
        });
      } catch (err) {
        console.error("[UserRoute] Failed to fetch user profile:", err);
        res.status(500).json({
          success: false,
          message: "Unable to retrieve user profile. Please try again later.",
        });
      }
    }
  );

  /**
   * Handler for submitting a studio host application.
   * Shared between POST /user/host-application and POST /user/become-host.
   */
  async function handleHostApplicationSubmission(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = getAuthUser(res);
      const userDoc = await resolveUserDoc(sessionUser.id, sessionUser.email);

      if (!userDoc) {
        res.status(404).json({
          success: false,
          message: "User profile not found.",
        });
        return;
      }

      // Check if user is already a host or admin
      if (userDoc.role === "host" || userDoc.role === "admin") {
        res.status(400).json({
          success: false,
          message: "You are already a studio host or administrator.",
          role: userDoc.role,
        });
        return;
      }

      // Prevent duplicate pending applications
      const existingPending = await getApplications().findOne({
        userId: userDoc._id,
        status: "pending",
      });

      if (existingPending) {
        res.status(409).json({
          success: false,
          message:
            "You already have a pending host application. Please wait for an administrator to review it.",
          applicationId: String(existingPending._id),
        });
        return;
      }

      // Read optional notes from body
      let notes: string | undefined;
      if (req.body && typeof req.body === "object") {
        const input = req.body as Record<string, unknown>;
        if (typeof input.notes === "string" && input.notes.trim()) {
          notes = input.notes.trim();
        }
      }

      const doc = createHostApplicationDoc({
        userId: String(userDoc._id),
        userName: userDoc.name || sessionUser.email.split("@")[0] || "StudioSpace User",
        userEmail: userDoc.email,
        notes,
      });

      const result = await getApplications().insertOne(
        doc as HostApplicationDocument
      );

      res.status(201).json({
        success: true,
        message:
          "Host application submitted successfully and is pending administrator review.",
        application: {
          id: String(result.insertedId),
          status: "pending",
          notes: doc.notes,
          createdAt: doc.createdAt,
        },
      });
    } catch (err) {
      console.error("[UserRoute] Failed to submit host application:", err);
      res.status(500).json({
        success: false,
        message: "Unable to submit host application. Please try again later.",
      });
    }
  }

  /**
   * POST /user/host-application
   * Submit an application to become a Studio Owner / Host.
   */
  router.post(
    "/user/host-application",
    deps.requireAuth,
    handleHostApplicationSubmission
  );

  /**
   * POST /user/become-host (alias to participate in approved workflow)
   */
  router.post(
    "/user/become-host",
    deps.requireAuth,
    handleHostApplicationSubmission
  );

  /**
   * GET /user/host-application
   * Check the current user's latest host application status.
   */
  router.get(
    "/user/host-application",
    deps.requireAuth,
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const sessionUser = getAuthUser(res);
        const userDoc = await resolveUserDoc(sessionUser.id, sessionUser.email);

        if (!userDoc) {
          res.status(404).json({
            success: false,
            message: "User profile not found.",
          });
          return;
        }

        const application = await getApplications().findOne(
          { userId: userDoc._id },
          { sort: { createdAt: -1 } }
        );

        res.status(200).json({
          success: true,
          application: application
            ? {
                id: String(application._id),
                status: application.status,
                notes: application.notes,
                reviewedAt: application.reviewedAt,
                rejectionReason: application.rejectionReason,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
              }
            : null,
        });
      } catch (err) {
        console.error("[UserRoute] Failed to fetch host application:", err);
        res.status(500).json({
          success: false,
          message: "Unable to fetch application status. Please try again later.",
        });
      }
    }
  );

  /**
   * GET /admin/host-applications
   * Admin-only: list host applications. Can filter by ?status=pending|approved|rejected.
   */
  router.get(
    "/admin/host-applications",
    deps.requireAuth,
    requireRoleMiddleware("admin"),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { status } = req.query;
        const filter: { status?: HostApplicationStatus } = {};

        if (
          typeof status === "string" &&
          ["pending", "approved", "rejected"].includes(status)
        ) {
          filter.status = status as HostApplicationStatus;
        }

        const applications = await getApplications()
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray();

        res.status(200).json({
          success: true,
          count: applications.length,
          applications: applications.map((app) => ({
            id: String(app._id),
            userId: String(app.userId),
            userName: app.userName,
            userEmail: app.userEmail,
            status: app.status,
            notes: app.notes,
            reviewedBy: app.reviewedBy ? String(app.reviewedBy) : null,
            reviewedAt: app.reviewedAt,
            rejectionReason: app.rejectionReason,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          })),
        });
      } catch (err) {
        console.error("[UserRoute] Failed to fetch host applications:", err);
        res.status(500).json({
          success: false,
          message:
            "Unable to retrieve host applications. Please try again later.",
        });
      }
    }
  );

  /**
   * PATCH /admin/host-applications/:id/review
   * Admin-only: Approve or reject a studio owner application.
   * Records reviewer ID and timestamp. Cannot review own application.
   */
  router.patch(
    "/admin/host-applications/:id/review",
    deps.requireAuth,
    requireRoleMiddleware("admin"),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const adminUser = getAuthUser(res);
        const { id } = req.params;

        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message:
              "Invalid application ID. Must be a 24-character hexadecimal string.",
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
        const rawAction = input.action ?? input.status;

        if (
          typeof rawAction !== "string" ||
          !["approve", "approved", "reject", "rejected"].includes(rawAction.toLowerCase())
        ) {
          res.status(400).json({
            success: false,
            message: 'Decision must be "approve" or "reject".',
          });
          return;
        }

        const isApprove =
          rawAction.toLowerCase() === "approve" ||
          rawAction.toLowerCase() === "approved";

        const application = await getApplications().findOne({
          _id: new ObjectId(id),
        });

        if (!application) {
          res.status(404).json({
            success: false,
            message: "Host application not found.",
          });
          return;
        }

        // Security requirement: Applicants cannot approve or review their own application
        if (String(application.userId) === adminUser.id) {
          res.status(403).json({
            success: false,
            message: "Administrators cannot approve or review their own applications.",
          });
          return;
        }

        // Prevent modifying an already decided application
        if (application.status !== "pending") {
          res.status(400).json({
            success: false,
            message: `Application has already been reviewed (status: ${application.status}).`,
          });
          return;
        }

        const now = new Date();
        const reviewerId = new ObjectId(adminUser.id);

        if (isApprove) {
          // 1. Update application status
          await getApplications().updateOne(
            { _id: application._id },
            {
              $set: {
                status: "approved",
                reviewedBy: reviewerId,
                reviewedAt: now,
                updatedAt: now,
              },
            }
          );

          // 2. Securely update applicant's role to HOST in database
          await getUsers().updateOne(
            { _id: application.userId },
            { $set: { role: "host", updatedAt: now } }
          );

          res.status(200).json({
            success: true,
            message: "Application approved. User role upgraded to host.",
            application: {
              id: String(application._id),
              userId: String(application.userId),
              status: "approved",
              reviewedBy: adminUser.id,
              reviewedAt: now,
            },
          });
        } else {
          // Reject application: keep user role as RENTER
          const rejectionReason =
            typeof input.rejectionReason === "string"
              ? input.rejectionReason.trim()
              : undefined;

          await getApplications().updateOne(
            { _id: application._id },
            {
              $set: {
                status: "rejected",
                reviewedBy: reviewerId,
                reviewedAt: now,
                rejectionReason,
                updatedAt: now,
              },
            }
          );

          res.status(200).json({
            success: true,
            message: "Application rejected. User remains in renter role.",
            application: {
              id: String(application._id),
              userId: String(application.userId),
              status: "rejected",
              reviewedBy: adminUser.id,
              reviewedAt: now,
              rejectionReason,
            },
          });
        }
      } catch (err) {
        console.error("[UserRoute] Failed to review host application:", err);
        res.status(500).json({
          success: false,
          message: "Unable to review application. Please try again later.",
        });
      }
    }
  );

  /**
   * PATCH /admin/users/:id/role
   * Administrative role assignment. Only accessible by ADMIN.
   */
  router.patch(
    "/admin/users/:id/role",
    deps.requireAuth,
    requireRoleMiddleware("admin"),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const adminUser = getAuthUser(res);
        const { id } = req.params;

        if (typeof id !== "string" || !OBJECT_ID_RE.test(id)) {
          res.status(400).json({
            success: false,
            message:
              "Invalid user ID. Must be a 24-character hexadecimal string.",
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
        const targetRole = input.role;

        if (
          typeof targetRole !== "string" ||
          !VALID_ROLES.includes(targetRole as UserRole)
        ) {
          res.status(400).json({
            success: false,
            message: `Invalid role "${String(targetRole)}". Must be one of: ${VALID_ROLES.join(", ")}`,
          });
          return;
        }

        // Prevent admin from demoting themselves to avoid accidental lockout
        if (id === adminUser.id && targetRole !== "admin") {
          res.status(400).json({
            success: false,
            message: "Administrators cannot demote themselves.",
          });
          return;
        }

        const result = await getUsers().findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { role: targetRole as UserRole, updatedAt: new Date() } },
          { returnDocument: "after", includeResultMetadata: false }
        );

        if (!result) {
          res.status(404).json({
            success: false,
            message: "User not found.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "User role updated successfully.",
          user: {
            id: String(result._id),
            name: result.name,
            email: result.email,
            role: result.role,
          },
        });
      } catch (err) {
        console.error("[UserRoute] Failed to update user role:", err);
        res.status(500).json({
          success: false,
          message: "Unable to update user role. Please try again later.",
        });
      }
    }
  );

  return router;
}

export default createUserRouter({
  requireAuth,
  requireRole,
  getUserCollection,
  getApplicationCollection: getHostApplicationCollection,
});
