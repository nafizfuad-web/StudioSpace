import type { NextFunction, Request, RequestHandler, Response } from "express";
import { getAuthUser } from "./require-auth.middleware.js";
import type { AuthUser } from "../types/auth.js";
import type { UserRole } from "../models/user.model.js";

export type AuthUserGetter = (res: Response) => AuthUser;

/**
 * Build middleware that verifies the authenticated user has one of the allowed roles.
 *
 * Must be mounted after requireAuth. If user.role is unset, defaults to "renter".
 */
export function createRequireRole(
  allowedRoles: UserRole[],
  getUser: AuthUserGetter = getAuthUser
): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getUser(res);
      const role = (user.role ?? "renter") as UserRole;

      if (!allowedRoles.includes(role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
        });
        return;
      }

      next();
    } catch (err) {
      console.error(
        "[RequireRole] Verification failed:",
        err instanceof Error ? err.name : "unknown error"
      );

      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }
  };
}

/** Convenience middleware factory for production routes. */
export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return createRequireRole(allowedRoles);
}
