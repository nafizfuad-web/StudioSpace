import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { resolveSession } from "../config/auth.js";
import type { AuthUser } from "../types/auth.js";

/** Resolve the authenticated user for a request, or null when unauthenticated. */
export type SessionResolver = (req: Request) => Promise<AuthUser | null>;

/**
 * Build authentication middleware around a session resolver.
 *
 * Production uses the Better Auth cookie-session resolver. Tests inject a
 * deterministic resolver without touching MongoDB or real session tokens.
 */
export function createRequireAuth(
  resolve: SessionResolver = resolveSession
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await resolve(req);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      res.locals.authUser = user;
      next();
    } catch (err) {
      // Log only a generic error name. Never log cookies, headers, tokens,
      // or raw Better Auth error details.
      console.error(
        "[RequireAuth] Session verification failed:",
        err instanceof Error ? err.name : "unknown error"
      );

      res.status(500).json({
        success: false,
        message: "Unable to verify authentication. Please try again later.",
      });
    }
  };
}

/** Production authentication middleware backed by Better Auth sessions. */
export const requireAuth = createRequireAuth();

/** Read the authenticated user attached by requireAuth. */
export function getAuthUser(res: Response): AuthUser {
  const user = res.locals.authUser as AuthUser | undefined;

  if (!user) {
    throw new Error("getAuthUser() called before requireAuth middleware.");
  }

  return user;
}
