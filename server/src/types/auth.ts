/** Authenticated user data derived from a verified Better Auth session. */
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}
