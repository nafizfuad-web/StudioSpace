import { API_URL } from "./apiUrl";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export interface BookingStudioInfo {
  id: string;
  title: string;
  category: string;
  location?: {
    city?: string;
    street?: string;
    state?: string;
    country?: string;
  } | null;
  pricePerHour: number;
  images: string[];
  status?: string;
}

export interface Booking {
  id: string;
  studioId: string;
  renterId: string;
  hostId: string;
  startAt: string;
  endAt: string;
  totalPrice: number;
  guestCount: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  studio?: BookingStudioInfo | null;
}

export interface CreateBookingParams {
  studioId: string;
  startAt: string;
  endAt: string;
  guestCount: number;
  notes?: string;
}

export interface BookingApiResponse<T> {
  success: boolean;
  message?: string;
  booking?: T;
  bookings?: T[];
  count?: number;
}

/**
 * Submit a new studio booking reservation.
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<{ success: boolean; message: string; booking?: Booking }> {
  try {
    const res = await fetch(`${API_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to create booking reservation.",
      };
    }

    return {
      success: true,
      message: data.message || "Booking reserved successfully!",
      booking: data.booking,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error. Please try again.",
    };
  }
}

/**
 * Fetch all bookings for the authenticated client.
 */
export async function fetchMyBookings(): Promise<Booking[]> {
  try {
    const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Unable to fetch your bookings.");
    }

    const data: BookingApiResponse<Booking> = await res.json();
    return data.bookings || [];
  } catch (err) {
    console.error("[BookingsClient] Error fetching my bookings:", err);
    return [];
  }
}

/**
 * Cancel an upcoming or pending booking.
 */
export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Unable to cancel booking.",
      };
    }

    return {
      success: true,
      message: data.message || "Booking cancelled successfully.",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error. Please try again.",
    };
  }
}
