"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchMyBookings,
  cancelBooking,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings";

type FilterTab = "all" | BookingStatus;

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(
    null
  );
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking.id);
    setCancelError(null);

    const res = await cancelBooking(cancelModalBooking.id);
    setCancellingId(null);

    if (res.success) {
      setCancelModalBooking(null);
      // Refresh bookings
      await loadBookings();
    } else {
      setCancelError(res.message);
    }
  };

  // Filter counts
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C2F800]/40 bg-[#C2F800]/10 px-2.5 py-0.5 text-xs font-bold text-[#C2F800]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C2F800]" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending Host Approval
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Cancelled
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/40 bg-zinc-500/10 px-2.5 py-0.5 text-xs font-bold text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Declined
          </span>
        );
    }
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All Bookings", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Track and manage your studio reservations, session dates, and status.
          </p>
        </div>

        <Link
          href="/studios"
          className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-4 py-2 text-xs font-bold text-black shadow-md transition hover:bg-[#b0e200]"
        >
          Book Another Studio
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border-medium pb-px scrollbar-none">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
                  isActive
                    ? "border-[#C2F800] text-[#C2F800]"
                    : "border-transparent text-foreground-muted hover:border-border-medium hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-[#C2F800]/20 text-[#C2F800]"
                      : "bg-surface-elevated text-foreground-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-surface border border-border-subtle"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-medium bg-surface/40 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border-medium text-foreground-muted">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">
            No bookings found
          </h3>
          <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
            {activeTab === "all"
              ? "You haven't reserved any creative studios yet. Browse hundreds of audio, photo, and video studios available on StudioSpace."
              : `You do not have any ${activeTab} bookings.`}
          </p>
          <div className="mt-5">
            <Link
              href="/studios"
              className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_16px_rgba(194,248,0,0.25)] transition hover:bg-[#b0e200]"
            >
              Explore Studios
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const startDate = new Date(booking.startAt);
            const endDate = new Date(booking.endAt);
            const canCancel =
              booking.status === "pending" || booking.status === "confirmed";

            const dateStr = startDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const timeStr = `${startDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${endDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-2xl border border-border-medium bg-surface-elevated p-5 shadow-sm transition hover:border-border-accent"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Thumbnail */}
                  {booking.studio?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.studio.images[0]}
                      alt={booking.studio.title}
                      className="h-32 w-full sm:w-44 rounded-xl object-cover border border-border-subtle shrink-0"
                    />
                  ) : (
                    <div className="flex h-32 w-full sm:w-44 shrink-0 items-center justify-center rounded-xl bg-surface border border-border-subtle text-foreground-muted text-xs">
                      Studio Image
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/studios/${booking.studioId}`}
                          className="text-base font-bold text-foreground hover:text-[#C2F800] transition-colors"
                        >
                          {booking.studio?.title || "Studio Session"}
                        </Link>
                        {getStatusBadge(booking.status)}
                      </div>

                      <p className="text-xs text-foreground-muted">
                        📍 {booking.studio?.location?.city || "Location available after confirmation"}
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-surface/70 border border-border-subtle p-3 text-xs">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-foreground-muted">
                          Date
                        </span>
                        <span className="font-medium text-foreground">
                          {dateStr}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-foreground-muted">
                          Session Time
                        </span>
                        <span className="font-medium text-foreground">
                          {timeStr}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-foreground-muted">
                          Guests
                        </span>
                        <span className="font-medium text-foreground">
                          {booking.guestCount || 1} guest{(booking.guestCount || 1) > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-foreground-muted">
                          Total Price
                        </span>
                        <span className="text-sm font-extrabold text-[#C2F800]">
                          ${booking.totalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                      <div className="text-[11px] text-foreground-muted">
                        Reference: #{booking.id.slice(-8).toUpperCase()}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/studios/${booking.studioId}`}
                          className="inline-flex items-center rounded-lg border border-border-medium bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
                        >
                          Studio Details
                        </Link>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelError(null);
                              setCancelModalBooking(booking);
                            }}
                            className="inline-flex items-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border-medium bg-surface-elevated p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Cancel Studio Reservation?
                </h3>
                <p className="text-xs text-foreground-muted">
                  Are you sure you want to cancel this booking?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border-subtle bg-surface p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">
                {cancelModalBooking.studio?.title}
              </p>
              <p className="text-foreground-muted">
                Total: ${cancelModalBooking.totalPrice}
              </p>
            </div>

            {cancelError && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                {cancelError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={Boolean(cancellingId)}
                className="rounded-xl border border-border-medium bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingId)}
                className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
