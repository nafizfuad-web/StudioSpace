"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading, Badge, Button } from "@/components/ui";
import {
  STUDIO_CATEGORY_FILTERS,
  fetchStudios,
  formatLocation,
  getCategoryLabel,
  getStudioCoverImage,
  type Studio,
  type StudioCategory,
} from "@/lib/studios";

type ActiveFilter = "all" | StudioCategory;

export const FeaturedStudios: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadStudios = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchStudios(controller.signal);
        if (isActive) setStudios(data);
      } catch (err) {
        if (!isActive || controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load studios right now."
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadStudios();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestKey]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStudios = useMemo(
    () =>
      activeFilter === "all"
        ? studios
        : studios.filter((studio) => studio.category === activeFilter),
    [activeFilter, studios]
  );

  return (
    <section
      id="explore"
      className="py-16 md:py-24 bg-background-secondary/60 border-y border-border-subtle"
    >
      <Container size="xl" className="space-y-10">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <SectionHeading
            badge="Curated Studios"
            title="Production-Ready Spaces Ready to Book"
            subtitle="Inspected for lighting capabilities, power hookups, acoustic isolation, and crew comfort."
          />

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {STUDIO_CATEGORY_FILTERS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                aria-pressed={activeFilter === tab.value}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.value
                    ? "bg-accent text-accent-contrast shadow-[0_0_15px_var(--color-accent-glow)]"
                    : "bg-surface border border-border-subtle text-foreground-muted hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`studio-skeleton-${index}`}
                className="rounded-2xl bg-surface border border-border-subtle overflow-hidden"
                aria-hidden="true"
              >
                <div className="h-60 w-full animate-pulse bg-surface-elevated" />
                <div className="p-5 space-y-4">
                  <div className="h-3 w-2/3 rounded-full bg-surface-elevated animate-pulse" />
                  <div className="h-5 w-full rounded-full bg-surface-elevated animate-pulse" />
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                    <div className="h-6 w-20 rounded-full bg-surface-elevated animate-pulse" />
                    <div className="h-8 w-24 rounded-lg bg-surface-elevated animate-pulse" />
                  </div>
                </div>
              </div>
            ))}

          {!isLoading && error && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-border-subtle bg-surface p-8 sm:p-10 text-center">
              <h3 className="text-lg font-bold text-foreground">
                We couldn&apos;t load the studios
              </h3>
              <p className="mt-2 text-sm text-foreground-muted">{error}</p>
              <Button
                variant="secondary"
                size="md"
                className="mt-5"
                onClick={() => setRequestKey((key) => key + 1)}
              >
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredStudios.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-border-subtle bg-surface p-8 sm:p-10 text-center">
              <h3 className="text-lg font-bold text-foreground">
                No studios in this category yet
              </h3>
              <p className="mt-2 text-sm text-foreground-muted">
                Be the first to list a production-ready space on StudioSpace.
              </p>
              <Button
                variant="secondary"
                size="md"
                className="mt-5"
                href="/#host"
              >
                List your space
              </Button>
            </div>
          )}

          {!isLoading &&
            !error &&
            filteredStudios.map((studio) => {
              const detailsHref = `/studios/${studio._id}`;
              const coverImage = getStudioCoverImage(studio);
              const categoryLabel = getCategoryLabel(studio.category);
              const locationLabel = formatLocation(studio.location);

              return (
                <div
                  key={studio._id}
                  className="group rounded-2xl bg-surface border border-border-subtle hover:border-border-accent transition-all duration-300 overflow-hidden flex flex-col hover:shadow-[0_12px_32px_-8px_var(--color-accent-glow)]"
                >
                  {/* Image Container with Badges */}
                  <div className="relative">
                    <Link
                      href={detailsHref}
                      aria-label={`View details for ${studio.title}`}
                      className="group/image relative block h-60 w-full overflow-hidden bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                    >
                      <Image
                        src={coverImage}
                        alt={studio.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-image-overlay via-transparent to-image-overlay/30" />

                      {/* Top Badges */}
                      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2">
                        <Badge variant="accent" size="sm">
                          {categoryLabel}
                        </Badge>
                      </div>

                      {/* Bottom Meta Overlay */}
                      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-xs text-white/80">
                        <span className="flex min-w-0 items-center gap-1 font-medium bg-image-overlay/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
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
                              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate">{locationLabel}</span>
                        </span>
                        <span className="shrink-0 font-mono text-white/90 bg-image-overlay/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                          max {studio.capacity}
                        </span>
                      </div>
                    </Link>

                    {/* Favorite Heart Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(studio._id)}
                      className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-image-overlay/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:scale-110 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={
                        favorites[studio._id]
                          ? `Remove ${studio.title} from favorites`
                          : `Add ${studio.title} to favorites`
                      }
                      aria-pressed={Boolean(favorites[studio._id])}
                    >
                      <svg
                        className={`h-4 w-4 transition-colors ${
                          favorites[studio._id]
                            ? "fill-red-500 text-red-500"
                            : "fill-transparent text-white"
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
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="block truncate text-xs font-semibold text-accent uppercase tracking-wider">
                        {locationLabel}
                      </span>
                      <h3 className="text-base font-bold text-foreground line-clamp-1">
                        <Link
                          href={detailsHref}
                          className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                        >
                          {studio.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-foreground tracking-tight">
                          ${studio.pricePerHour}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          / hr
                        </span>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        href={detailsHref}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Browse the full catalogue */}
        <div className="pt-4 text-center">
          <Button variant="outline" size="lg" href="/studios" className="px-8">
            Browse the full catalogue
          </Button>
        </div>
      </Container>
    </section>
  );
};
