"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import {
  formatLocation,
  getCategoryLabel,
  getStudioCoverImage,
  type Studio,
} from "@/lib/studios";

interface StudioResultCardProps {
  studio: Studio;
  selected: boolean;
  onHover: (id: string | null) => void;
}

export const StudioResultCard: React.FC<StudioResultCardProps> = ({
  studio,
  selected,
  onHover,
}) => {
  const detailsHref = `/studios/${studio._id}`;
  const coverImage = getStudioCoverImage(studio);
  const location = formatLocation(studio.location);
  const availability = studio.booking?.availability;
  const sessionLength = studio.booking
    ? studio.booking.maximumHours
      ? `${studio.booking.minimumHours}\u2013${studio.booking.maximumHours} hr sessions`
      : `${studio.booking.minimumHours}+ hr sessions`
    : null;

  return (
    <article
      id={`studio-result-${studio._id}`}
      data-studio-id={studio._id}
      onMouseEnter={() => onHover(studio._id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(studio._id)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onHover(null);
        }
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-300 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-background sm:flex-row ${
        selected
          ? "border-border-accent shadow-[0_12px_32px_-10px_var(--color-accent-glow)] ring-2 ring-accent/35"
          : "border-border-subtle hover:border-border-accent hover:shadow-[0_12px_32px_-10px_var(--color-accent-glow)]"
      }`}
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-surface-elevated sm:h-auto sm:w-44 md:w-48">
        <Image
          src={coverImage}
          alt={studio.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 192px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-image-overlay/70 via-transparent to-image-overlay/20" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="accent" size="sm">
            {getCategoryLabel(studio.category)}
          </Badge>
          {studio.booking?.instantBook && (
            <Badge variant="success" size="sm" dot>
              Instant book
            </Badge>
          )}
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md border border-white/10 bg-image-overlay/55 px-2 py-0.5 font-mono text-[11px] text-white/90 backdrop-blur-md">
          max {studio.capacity}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{location}</span>
            </p>

            {studio.booking?.leadTimeDays === 0 && (
              <span className="shrink-0 rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                Same-day
              </span>
            )}
          </div>

          <h3 className="text-base font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-lg">
            {studio.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-foreground-muted sm:text-sm">
            {studio.description}
          </p>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-foreground-muted">
            {availability && (
              <span
                className="inline-flex min-w-0 max-w-full items-center gap-1.5"
                title={availability}
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="truncate">{availability}</span>
              </span>
            )}

            {sessionLength && (
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-foreground-subtle"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate">{sessionLength}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                ${studio.pricePerHour}
              </span>
              <span className="text-xs text-foreground-muted">/ hr</span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-foreground transition-colors group-hover:border-border-accent group-hover:text-accent">
              View details
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <Link
        href={detailsHref}
        aria-label={`View details for ${studio.title}`}
        className="absolute inset-0 z-20 rounded-2xl focus-visible:outline-none"
      />
    </article>
  );
};
