"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { createBooking } from "@/lib/bookings";
import { addToWishlist, checkStudioWishlist, removeFromWishlist } from "@/lib/wishlist";
import type { Studio } from "@/lib/studios";

interface StudioBookingActionsProps {
  studio: Studio;
}

const TIME_OPTIONS = [
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
  { value: "18:00", label: "06:00 PM" },
  { value: "19:00", label: "07:00 PM" },
  { value: "20:00", label: "08:00 PM" },
  { value: "21:00", label: "09:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

export const StudioBookingActions: React.FC<StudioBookingActionsProps> = ({ studio }) => {
  const router = useRouter();
  const session = authClient.useSession();
  const user = session.data?.user ?? null;

  // Wishlist state
  const [isSaved, setIsSaved] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Booking modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [guestCount, setGuestCount] = useState(1);
  const [bookingNotes, setBookingNotes] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  // Fetch initial wishlist status if user is authenticated
  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    let isMounted = true;
    checkStudioWishlist(studio._id).then((saved) => {
      if (isMounted) setIsSaved(saved);
    });

    return () => {
      isMounted = false;
    };
  }, [studio._id, user]);

  // Calculate duration and price
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);
  const rawDuration = Math.max(1, endHour - startHour);
  const minHours = studio.booking?.minimumHours || 1;
  const durationHours = Math.max(rawDuration, minHours);
  const calculatedTotal = durationHours * studio.pricePerHour;

  const handleOpenBooking = () => {
    if (!user) {
      const returnUrl = encodeURIComponent(`/studios/${studio._id}`);
      router.push(`/signin?next=${returnUrl}`);
      return;
    }
    setErrorMessage(null);
    setSuccessBookingId(null);
    setIsBookingOpen(true);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      const returnUrl = encodeURIComponent(`/studios/${studio._id}`);
      router.push(`/signin?next=${returnUrl}`);
      return;
    }

    if (isWishlistLoading) return;
    setIsWishlistLoading(true);

    try {
      if (isSaved) {
        await removeFromWishlist(studio._id);
        setIsSaved(false);
      } else {
        await addToWishlist(studio._id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      const returnUrl = encodeURIComponent(`/studios/${studio._id}`);
      router.push(`/signin?next=${returnUrl}`);
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Please select a booking date.");
      return;
    }

    if (endHour <= startHour) {
      setErrorMessage("End time must be after start time.");
      return;
    }

    if (rawDuration < minHours) {
      setErrorMessage(`This studio requires a minimum booking of ${minHours} hours.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const startDateTime = `${selectedDate}T${startTime}:00.000Z`;
    const endDateTime = `${selectedDate}T${endTime}:00.000Z`;

    const res = await createBooking({
      studioId: studio._id,
      startAt: startDateTime,
      endAt: endDateTime,
      guestCount,
      notes: bookingNotes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.booking) {
      setSuccessBookingId(res.booking.id);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <>
      {/* Action Buttons directly below price */}
      <div className="mt-4 flex flex-col gap-2.5">
        {/* Button 1: Reserve This Studio (Lime #C2F800) */}
        <button
          type="button"
          onClick={handleOpenBooking}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C2F800] px-4 py-3.5 text-sm font-extrabold text-black transition-all duration-200 hover:bg-[#b0e200] active:scale-[0.98] shadow-[0_0_22px_rgba(194,248,0,0.28)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2F800]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Reserve This Studio</span>
        </button>

        {/* Button 2: Add to Wishlist (Secondary Outlined with Heart Icon) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isSaved
              ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-border-medium bg-surface-elevated text-foreground hover:bg-surface-hover hover:border-border-accent"
          }`}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${
              isSaved ? "fill-red-500 text-red-500 scale-110" : "fill-transparent text-foreground-secondary"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{isWishlistLoading ? "Updating..." : isSaved ? "Saved to Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>

      {/* Booking Process Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border-medium bg-surface p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-5 right-5 text-foreground-muted hover:text-foreground p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!successBookingId ? (
              <form onSubmit={handleConfirmBooking} className="space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#C2F800] font-semibold">
                    Reserve Production Stage
                  </span>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {studio.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    ${studio.pricePerHour}/hr • Up to {studio.capacity} guests
                  </p>
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4 text-sm">
                  {/* Booking Date */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                      Booking Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3.5 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                        Start Time
                      </label>
                      <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 text-foreground focus:border-accent focus:outline-none"
                      >
                        {TIME_OPTIONS.slice(0, -1).map((opt) => (
                          <option key={`start-${opt.value}`} value={opt.value} className="bg-surface">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                        End Time
                      </label>
                      <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2.5 text-foreground focus:border-accent focus:outline-none"
                      >
                        {TIME_OPTIONS.filter((opt) => parseInt(opt.value.split(":")[0], 10) > startHour).map(
                          (opt) => (
                            <option key={`end-${opt.value}`} value={opt.value} className="bg-surface">
                              {opt.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                        Number of Guests
                      </label>
                      <span className="text-xs text-foreground-muted">Max {studio.capacity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                        className="h-10 w-10 rounded-xl border border-border-medium bg-surface-elevated text-lg font-bold hover:bg-surface-hover"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-base text-foreground">
                        {guestCount} {guestCount === 1 ? "guest" : "guests"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount((c) => Math.min(studio.capacity, c + 1))}
                        className="h-10 w-10 rounded-xl border border-border-medium bg-surface-elevated text-lg font-bold hover:bg-surface-hover"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1.5">
                      Production Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your crew, lighting equipment, or shoot requirements..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Booking Summary Card & Price Calculation */}
                <div className="rounded-2xl border border-border-accent/40 bg-surface-elevated/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-foreground-secondary">
                    <span>Rate Calculation</span>
                    <span>
                      ${studio.pricePerHour} × {durationHours} hr{durationHours > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="border-t border-border-subtle pt-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="block text-xs text-foreground-muted font-medium">Total Price</span>
                      <span className="text-[11px] text-foreground-subtle">
                        {studio.booking?.depositPercentage
                          ? `${studio.booking.depositPercentage}% deposit required`
                          : "No upfront deposit"}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-[#C2F800] tracking-tight">
                      ${calculatedTotal}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-1 rounded-xl border border-border-subtle bg-surface-elevated py-3 text-sm font-medium text-foreground hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-[#C2F800] py-3 text-sm font-bold text-black hover:bg-[#b0e200] disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(194,248,0,0.2)]"
                  >
                    {isSubmitting ? "Reserving..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            ) : (
              /* Success View */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C2F800]/20 text-[#C2F800]">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Reservation Requested!
                </h3>

                <p className="text-sm text-foreground-secondary max-w-sm mx-auto leading-relaxed">
                  Your reservation request for <strong className="text-foreground">{studio.title}</strong> has been submitted. The studio owner will review and confirm your session.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/dashboard/bookings"
                    className="rounded-xl bg-[#C2F800] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#b0e200]"
                  >
                    View in My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="rounded-xl border border-border-subtle bg-surface-elevated px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
