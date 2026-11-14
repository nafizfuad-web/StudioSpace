import { API_URL } from "./apiUrl";
import type { Studio } from "./studios";

export interface SavedStudioItem {
  savedId: string;
  savedAt: string;
  studio: Studio;
}

export interface WishlistApiResponse {
  success: boolean;
  message?: string;
  count?: number;
  savedStudios?: SavedStudioItem[];
  isSaved?: boolean;
}

/**
 * Check if a studio is saved in the authenticated user's wishlist.
 */
export async function checkStudioWishlist(studioId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/wishlist/${studioId}/check`, {
      credentials: "include",
    });

    if (!res.ok) return false;
    const data: WishlistApiResponse = await res.json();
    return Boolean(data.isSaved);
  } catch {
    return false;
  }
}

/**
 * Add a studio to the authenticated user's wishlist.
 */
export async function addToWishlist(
  studioId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}/api/wishlist/${studioId}`, {
      method: "POST",
      credentials: "include",
    });

    const data: WishlistApiResponse = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to save studio to wishlist.",
      };
    }

    return {
      success: true,
      message: data.message || "Studio saved to wishlist.",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error.",
    };
  }
}

/**
 * Remove a studio from the authenticated user's wishlist.
 */
export async function removeFromWishlist(
  studioId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}/api/wishlist/${studioId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data: WishlistApiResponse = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to remove studio.",
      };
    }

    return {
      success: true,
      message: data.message || "Studio removed from wishlist.",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error.",
    };
  }
}

/**
 * Retrieve all studios in the authenticated user's wishlist.
 */
export async function fetchWishlist(): Promise<SavedStudioItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      credentials: "include",
    });

    if (!res.ok) return [];
    const data: WishlistApiResponse = await res.json();
    return data.savedStudios || [];
  } catch (err) {
    console.error("[WishlistClient] Error fetching saved studios:", err);
    return [];
  }
}
