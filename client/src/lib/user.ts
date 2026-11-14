import { API_URL } from "./apiUrl";

export type UserRole = "renter" | "host" | "admin";

export interface HostApplicationInfo {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  hostApplication?: HostApplicationInfo | null;
}

export interface UserMeApiResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

export interface HostApplicationApiResponse {
  success: boolean;
  message?: string;
  applicationId?: string;
  status?: string;
}

/**
 * Fetch the authenticated user's profile and active role from backend.
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/user/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;
    const data: UserMeApiResponse = await res.json();
    return data.user || null;
  } catch (err) {
    console.error("[UserClient] Error fetching user profile:", err);
    return null;
  }
}

/**
 * Submit an application to become a studio host (owner).
 */
export async function submitHostApplication(
  notes?: string
): Promise<{ success: boolean; message: string; applicationId?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/user/host-application`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ notes }),
    });

    const data: HostApplicationApiResponse = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to submit host application.",
      };
    }

    return {
      success: true,
      message:
        data.message ||
        "Application submitted successfully! An administrator will review your application.",
      applicationId: data.applicationId,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error. Please try again.",
    };
  }
}
