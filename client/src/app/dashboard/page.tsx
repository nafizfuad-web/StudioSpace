"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyBookings, type Booking } from "@/lib/bookings";
import { fetchWishlist, type SavedStudioItem } from "@/lib/wishlist";
import { fetchUserProfile, type UserProfile } from "@/lib/user";

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<SavedStudioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [userProfile, userBookings, userWishlist] = await Promise.all([
          fetchUserProfile(),
          fetchMyBookings(),
          fetchWishlist(),
        ]);

        if (!active) return;
        setProfile(userProfile);
        setBookings(userBookings);
        setWishlist(userWishlist);
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center rounded-md border border-[#C2F800]/40 bg-[#C2F800]/10 px-2 py-0.5 text-xs font-semibold text-[#C2F800]">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
            Pending Approval
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-300">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-md border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-border-medium bg-surface px-2 py-0.5 text-xs font-semibold text-foreground-muted">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-surface border border-border-subtle" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-surface border border-border-subtle"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-surface border border-border-subtle" />
      </div>
    );
  }

  const displayName = profile?.name || "Creator";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-medium bg-gradient-to-r from-surface-elevated via-surface to-surface-elevated p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {displayName}
              </h1>
              <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-sky-300 uppercase">
                {profile?.role || "CLIENT"}
              </span>
            </div>
            <p className="text-sm text-foreground-muted">
              Manage your studio bookings, saved spaces, and creative projects in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/studios"
              className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_16px_rgba(194,248,0,0.25)] transition hover:bg-[#b0e200]"
            >
              Explore Studios
            </Link>
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center justify-center rounded-xl border border-border-medium bg-surface px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-surface-hover"
            >
              View My Bookings
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#C2F800]/5 blur-3xl"
          aria-hidden="true"
        />
      </div>

      {/* Account Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upcoming */}
        <div className="rounded-xl border border-border-medium bg-surface-elevated p-5 shadow-sm transition hover:border-[#C2F800]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Upcoming Bookings
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C2F800]/10 text-[#C2F800]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {upcomingBookings.length}
            </span>
            <span className="text-xs text-foreground-muted">active</span>
          </div>
        </div>

        {/* Saved Studios */}
        <div className="rounded-xl border border-border-medium bg-surface-elevated p-5 shadow-sm transition hover:border-pink-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Saved Studios
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {wishlist.length}
            </span>
            <span className="text-xs text-foreground-muted">in wishlist</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-xl border border-border-medium bg-surface-elevated p-5 shadow-sm transition hover:border-sky-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Total Bookings
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {bookings.length}
            </span>
            <span className="text-xs text-foreground-muted">all time</span>
          </div>
        </div>

        {/* Account Role */}
        <div className="rounded-xl border border-border-medium bg-surface-elevated p-5 shadow-sm transition hover:border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Account Role
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground capitalize">
              {profile?.role || "Renter"}
            </span>
            <span className="text-xs text-[#C2F800]">Verified</span>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Upcoming Bookings
            </h2>
            <p className="text-xs text-foreground-muted">
              Your next studio sessions and reservations.
            </p>
          </div>
          <Link
            href="/dashboard/bookings"
            className="text-xs font-semibold text-[#C2F800] hover:underline"
          >
            View all bookings →
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-medium bg-surface/50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated border border-border-medium text-foreground-muted">
              <svg
                className="h-6 w-6"
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
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No upcoming bookings
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              You do not have any confirmed or pending studio sessions scheduled right now.
            </p>
            <div className="mt-4">
              <Link
                href="/studios"
                className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-[#b0e200]"
              >
                Find a Studio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.slice(0, 4).map((booking) => {
              const startDate = new Date(booking.startAt);
              const endDate = new Date(booking.endAt);
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
                  className="overflow-hidden rounded-xl border border-border-medium bg-surface-elevated p-4 shadow-sm transition hover:border-border-accent"
                >
                  <div className="flex gap-4">
                    {booking.studio?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={booking.studio.images[0]}
                        alt={booking.studio.title}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover border border-border-subtle"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-surface border border-border-subtle text-foreground-muted text-xs">
                        Studio
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-bold text-foreground">
                          {booking.studio?.title || "Studio Session"}
                        </h4>
                        {getStatusBadge(booking.status)}
                      </div>

                      <p className="text-xs text-foreground-muted">
                        📅 {dateStr}
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        ⏰ {timeStr}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-[#C2F800]">
                          ${booking.totalPrice}
                        </span>
                        <Link
                          href={`/studios/${booking.studioId}`}
                          className="text-[11px] font-semibold text-foreground-muted hover:text-[#C2F800]"
                        >
                          Studio Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Saved Studios Preview Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Saved Studios
            </h2>
            <p className="text-xs text-foreground-muted">
              Studios you saved for upcoming creative projects.
            </p>
          </div>
          <Link
            href="/dashboard/saved"
            className="text-xs font-semibold text-[#C2F800] hover:underline"
          >
            View all saved ({wishlist.length}) →
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-medium bg-surface/50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated border border-border-medium text-pink-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No saved studios yet
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              Click the &quot;Add to Wishlist&quot; heart button on any studio details page to bookmark it here.
            </p>
            <div className="mt-4">
              <Link
                href="/studios"
                className="inline-flex items-center justify-center rounded-xl border border-border-medium bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.slice(0, 3).map((item) => {
              const studio = item.studio;
              if (!studio) return null;
              return (
                <div
                  key={item.savedId}
                  className="group overflow-hidden rounded-xl border border-border-medium bg-surface-elevated shadow-sm transition hover:border-[#C2F800]/40"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-surface">
                    {studio.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={studio.images[0]}
                        alt={studio.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-foreground-muted text-xs">
                        No image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-[#C2F800]">
                      ${studio.pricing?.hourly || 0}/hr
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="truncate text-sm font-bold text-foreground">
                      {studio.title}
                    </h4>
                    <p className="truncate text-xs text-foreground-muted">
                      📍 {studio.location?.city || "Location on request"}
                    </p>

                    <div className="pt-2">
                      <Link
                        href={`/studios/${studio._id || studio.id}`}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-[#C2F800]/10 border border-[#C2F800]/30 py-1.5 text-xs font-bold text-[#C2F800] transition hover:bg-[#C2F800] hover:text-black"
                      >
                        View Studio
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity / Quick Helper Section */}
      <section className="rounded-2xl border border-border-medium bg-surface-elevated p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground">
          Client Quick Actions
        </h3>
        <p className="mt-1 text-xs text-foreground-muted">
          Need assistance with your booking or interested in becoming a studio host?
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/profile"
            className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface p-4 transition hover:border-[#C2F800]/40"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C2F800]/15 text-[#C2F800]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">
                Apply to Become a Studio Owner
              </p>
              <p className="text-[11px] text-foreground-muted">
                List your recording spaces and earn rental income with admin approval.
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface p-4 transition hover:border-[#C2F800]/40"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">
                Manage Booking Schedules
              </p>
              <p className="text-[11px] text-foreground-muted">
                Check reservation dates, view status, or cancel pending bookings.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
