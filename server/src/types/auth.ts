import type { UserRole } from "../models/user.model.js";

/** Authenticated user data derived from a verified Better Auth session. */
export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole | string;
}
