"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchWishlist,
  removeFromWishlist,
  type SavedStudioItem,
} from "@/lib/wishlist";

export default function SavedStudiosPage() {
  const [items, setItems] = useState<SavedStudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSavedStudios = async () => {
    try {
      const data = await fetchWishlist();
      setItems(data);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedStudios();
  }, []);

  const handleRemove = async (studioId: string) => {
    setRemovingId(studioId);
    const res = await removeFromWishlist(studioId);
    setRemovingId(null);

    if (res.success) {
      setItems((prev) =>
        prev.filter((item) => (item.studio._id || item.studio.id) !== studioId)
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Saved Studios
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Your personal collection of favorite creative spaces and recording studios.
          </p>
        </div>

        <Link
          href="/studios"
          className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-4 py-2 text-xs font-bold text-black shadow-md transition hover:bg-[#b0e200]"
        >
          Explore More Studios
        </Link>
      </div>

      {/* Grid of Saved Studios */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-surface border border-border-subtle"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-medium bg-surface/40 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <svg
              className="h-8 w-8"
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
          <h3 className="mt-4 text-base font-bold text-foreground">
            Your Wishlist is Empty
          </h3>
          <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
            Save your favorite studios while browsing the marketplace. Just click the heart button on any studio details page.
          </p>
          <div className="mt-5">
            <Link
              href="/studios"
              className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_16px_rgba(194,248,0,0.25)] transition hover:bg-[#b0e200]"
            >
              Browse Studios
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const studio = item.studio;
            if (!studio) return null;
            const studioId = studio._id || studio.id;
            const isRemoving = removingId === studioId;

            return (
              <div
                key={item.savedId}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border-medium bg-surface-elevated shadow-sm transition-all duration-200 hover:border-border-accent hover:shadow-lg"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
                  {studio.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={studio.images[0]}
                      alt={studio.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-foreground-muted text-xs">
                      Studio Image
                    </div>
                  )}

                  {/* Hourly Price Tag */}
                  <div className="absolute top-3 left-3 rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-extrabold text-[#C2F800] shadow-md">
                    ${studio.pricing?.hourly || 0}
                    <span className="text-[10px] font-normal text-foreground-muted">
                      /hr
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(studioId)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 backdrop-blur-md text-pink-400 shadow-md transition hover:scale-110 hover:bg-black"
                    title="Remove from saved studios"
                    aria-label="Remove from saved studios"
                  >
                    {isRemoving ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
                    ) : (
                      <svg
                        className="h-4 w-4 fill-current text-pink-500"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Studio Information */}
                <div className="flex-1 p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-border-subtle bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                        {studio.category || "Creative Space"}
                      </span>
                    </div>

                    <h3 className="line-clamp-1 text-base font-bold text-foreground group-hover:text-[#C2F800] transition-colors">
                      {studio.title}
                    </h3>

                    <p className="line-clamp-1 text-xs text-foreground-muted">
                      📍 {studio.location?.city || "Location on request"}
                      {studio.location?.state ? `, ${studio.location.state}` : ""}
                    </p>
                  </div>

                  {/* Features / Details */}
                  <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-foreground-secondary">
                    <span>
                      👥 Up to {studio.capacity || 5} guests
                    </span>
                    <span>
                      ⏱ {studio.pricing?.minimumBookingHours || 1} hr min
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link
                      href={`/studios/${studioId}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#C2F800] py-2.5 text-xs font-bold text-black shadow-sm transition hover:bg-[#b0e200]"
                    >
                      View Studio Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
