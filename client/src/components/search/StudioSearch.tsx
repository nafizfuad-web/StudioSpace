"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Container } from "@/components/ui";
import {
  fetchStudios,
  getCategoryLabel,
  type Studio,
} from "@/lib/studios";
import type { StudioCityOption } from "@/lib/studioLocations";
import {
  countActiveFilters,
  filterStudios,
  formatSearchDate,
  getFacilityGroup,
  getLocationOptionLabel,
  getStudioPriceBounds,
  getStudioSearchHref,
  parseStudioFilters,
  STUDIO_SORT_OPTIONS,
  type StudioFilters,
} from "@/lib/studioSearch";
import { FilterDrawer } from "./FilterDrawer";
import { FilterPanel } from "./FilterPanel";
import { SearchBar } from "./SearchBar";
import { StudioMap } from "./StudioMap";
import { StudioResultCard } from "./StudioResultCard";

type ViewMode = "list" | "map";

interface FilterChip {
  key: string;
  label: string;
  remove: () => void;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-accent bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/20 hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg
          className="h-2.5 w-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  );
}

function CardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface sm:flex-row"
      aria-hidden="true"
    >
      <div className="h-44 w-full animate-pulse bg-surface-elevated sm:h-auto sm:w-44 md:w-48" />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-3 w-full animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-surface-elevated" />
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-surface-elevated" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}

function FilterPanelSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-3 w-28 animate-pulse rounded-full bg-surface-elevated" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-9 w-full animate-pulse rounded-lg bg-surface-elevated"
        />
      ))}
      <div className="h-28 w-full animate-pulse rounded-xl bg-surface-elevated" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-surface-elevated" />
    </div>
  );
}

function MapSkeleton() {
  return (
    <div
      className="relative h-full w-full animate-pulse overflow-hidden rounded-2xl border border-border-subtle bg-surface"
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border-subtle bg-surface-elevated" />
    </div>
  );
}

export const StudioSearch: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseStudioFilters(searchParams),
    [searchParams]
  );

  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadStudios = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchStudios(controller.signal);
        if (isActive) setStudios(data);
      } catch (loadError) {
        if (!isActive || controller.signal.aborted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
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

  const updateFilters = useCallback(
    (patch: Partial<StudioFilters>) => {
      const next = { ...filters, ...patch };

      // Results can change under the map, so drop any pinned selection.
      setSelectedId(null);
      setHoveredId(null);
      setPendingScrollId(null);
      router.replace(getStudioSearchHref(next), { scroll: false });
    },
    [filters, router]
  );

  const clearAllFilters = useCallback(() => {
    setSelectedId(null);
    setHoveredId(null);
    router.replace("/studios", { scroll: false });
  }, [router]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const filteredStudios = useMemo(
    () => filterStudios(studios, filters),
    [filters, studios]
  );

  const priceBounds = useMemo(() => getStudioPriceBounds(studios), [studios]);

  const cityOptions = useMemo<StudioCityOption[]>(() => {
    const cities = new Map<string, string>();

    studios.forEach((studio) => {
      const city = studio.location?.city?.trim();
      if (city && !cities.has(city)) {
        cities.set(city, getLocationOptionLabel(studio) ?? city);
      }
    });

    return Array.from(cities.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [studios]);

  useEffect(() => {
    if (!pendingScrollId) return;

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`studio-result-${pendingScrollId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setPendingScrollId(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingScrollId, viewMode]);

  const handleMapSelect = useCallback(
    (id: string | null) => {
      setSelectedId(id);

      if (id && viewMode === "list") {
        setPendingScrollId(id);
      }
    },
    [viewMode]
  );

  const handleShowInList = useCallback(() => {
    if (!selectedId) return;
    setViewMode("list");
    setPendingScrollId(selectedId);
  }, [selectedId]);

  const activeFilterCount = countActiveFilters(filters);
  const activeChips: FilterChip[] = [];

  if (filters.category !== "all") {
    activeChips.push({
      key: "category",
      label: getCategoryLabel(filters.category),
      remove: () => updateFilters({ category: "all" }),
    });
  }

  if (filters.location) {
    activeChips.push({
      key: "location",
      label: filters.location,
      remove: () => updateFilters({ location: "" }),
    });
  }

  if (filters.date) {
    activeChips.push({
      key: "date",
      label: formatSearchDate(filters.date),
      remove: () => updateFilters({ date: "" }),
    });
  }

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const priceLabel =
      filters.minPrice !== null && filters.maxPrice !== null
        ? `$${filters.minPrice}\u2013$${filters.maxPrice}/hr`
        : filters.minPrice !== null
          ? `$${filters.minPrice}+/hr`
          : `Up to $${filters.maxPrice}/hr`;

    activeChips.push({
      key: "price",
      label: priceLabel,
      remove: () => updateFilters({ minPrice: null, maxPrice: null }),
    });
  }

  if (filters.capacity > 0) {
    activeChips.push({
      key: "capacity",
      label: `${filters.capacity}+ guests`,
      remove: () => updateFilters({ capacity: 0 }),
    });
  }

  filters.facilities.forEach((facilityId) => {
    const group = getFacilityGroup(facilityId);
    if (!group) return;

    activeChips.push({
      key: `facility-${facilityId}`,
      label: group.label,
      remove: () =>
        updateFilters({
          facilities: filters.facilities.filter((id) => id !== facilityId),
        }),
    });
  });

  if (filters.instantBook) {
    activeChips.push({
      key: "instant-book",
      label: "Instant book",
      remove: () => updateFilters({ instantBook: false }),
    });
  }

  if (filters.sameDay) {
    activeChips.push({
      key: "same-day",
      label: "Same-day",
      remove: () => updateFilters({ sameDay: false }),
    });
  }

  const listingCountLabel = isLoading
    ? "Loading studios"
    : `${filteredStudios.length} ${
        filteredStudios.length === 1 ? "studio" : "studios"
      }`;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border-subtle bg-background-secondary/50">
        <div
          className="pointer-events-none absolute -top-32 left-1/3 h-72 w-[38rem] rounded-full bg-accent/10 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-cyan-600/10 blur-[90px]"
          aria-hidden="true"
        />

        <Container size="2xl" className="relative py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="text-xs text-foreground-muted">
            <Link
              href="/"
              className="rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Home
            </Link>
            <span aria-hidden="true" className="mx-2 text-foreground-subtle">
              /
            </span>
            <span className="text-foreground-secondary">Studios</span>
          </nav>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="accent" size="sm" dot>
                Studio catalogue
              </Badge>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Find your next{" "}
                <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                  creative space.
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted sm:text-base">
                Search every published listing by production type, city, date,
                price, and the facilities your crew needs.
              </p>
            </div>

            <div className="flex w-full shrink-0 items-center gap-5 rounded-2xl border border-border-subtle bg-surface/70 px-5 py-4 backdrop-blur lg:w-auto">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {isLoading ? "\u2014" : studios.length}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                  Published studios
                </p>
              </div>
              <span
                className="h-10 w-px bg-border-subtle"
                aria-hidden="true"
              />
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-accent">
                  {isLoading ? "\u2014" : cityOptions.length}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                  Cities represented
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <SearchBar
              key={`${filters.category}|${filters.location}|${filters.date}`}
              filters={filters}
              cityOptions={cityOptions}
              onApply={updateFilters}
            />
          </div>
        </Container>
      </section>

      <Container size="2xl" className="py-8 md:py-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_360px]">
          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border-subtle bg-surface/65 p-5">
              {isLoading ? (
                <FilterPanelSkeleton />
              ) : (
                <FilterPanel
                  filters={filters}
                  studios={studios}
                  priceBounds={priceBounds}
                  resultCount={filteredStudios.length}
                  idPrefix="sidebar"
                  onChange={updateFilters}
                  onClear={clearAllFilters}
                />
              )}
            </div>
          </aside>

          <div
            className={`min-w-0 ${
              viewMode === "map" ? "hidden xl:block" : "block"
            }`}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-sm font-semibold text-foreground"
                  aria-live="polite"
                >
                  {listingCountLabel}
                  {filters.location ? (
                    <span className="font-normal text-foreground-muted">
                      {" "}
                      in {filters.location}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {filters.date
                    ? `Filtered by published operating days for ${formatSearchDate(
                        filters.date
                      )}.`
                    : "Live catalogue data from StudioSpace."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="h-9 rounded-lg lg:hidden"
                  aria-label={`Open filters${
                    activeFilterCount > 0
                      ? `, ${activeFilterCount} active`
                      : ""
                  }`}
                  leftIcon={
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
                        d="M4 6h16M7 12h10M10 18h4"
                      />
                    </svg>
                  }
                >
                  Filters
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Button>

                <label className="relative">
                  <span className="sr-only">Sort studios</span>
                  <select
                    value={filters.sort}
                    onChange={(event) =>
                      updateFilters({
                        sort: event.target
                          .value as StudioFilters["sort"],
                      })
                    }
                    className="h-9 cursor-pointer appearance-none rounded-lg border border-border-subtle bg-surface-elevated pl-3 pr-8 text-xs font-medium text-foreground-secondary transition-colors hover:border-border-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                  >
                    {STUDIO_SORT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-surface text-foreground"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </label>

                <div
                  className="flex rounded-lg border border-border-subtle bg-surface-elevated p-0.5 xl:hidden"
                  role="group"
                  aria-label="Results view"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      viewMode === "list"
                        ? "bg-accent text-accent-contrast"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
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
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    aria-pressed={viewMode === "map"}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      viewMode === "map"
                        ? "bg-accent text-accent-contrast"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
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
                        d="M9 20l-6-3V4l6 3m0 13l6-3m-6 3V7m6 10l6 3V7l-6-3m0 13V4M9 7l6-3"
                      />
                    </svg>
                    Map
                  </button>
                </div>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={chip.remove}
                  />
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="rounded-full px-2 py-1 text-[11px] font-semibold text-foreground-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Clear all
                </button>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center sm:p-10">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M12 9v3.75m0 3h.008v.008H12v-.008zM10.29 3.86L1.82 18a2.25 2.25 0 001.93 3.375h16.5A2.25 2.25 0 0022.18 18L13.71 3.86a2.25 2.25 0 00-3.42 0z"
                    />
                  </svg>
                </span>
                <h2 className="mt-4 text-lg font-bold text-foreground">
                  We couldn&apos;t load the studio catalogue
                </h2>
                <p className="mt-2 text-sm text-foreground-muted">{error}</p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setRequestKey((key) => key + 1)}
                  >
                    Try again
                  </Button>
                  <Button variant="secondary" size="md" href="/">
                    Back home
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !error && filteredStudios.length === 0 && (
              <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center sm:p-10">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border-accent bg-accent/10 text-accent">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <h2 className="mt-4 text-lg font-bold text-foreground">
                  No studios match these filters
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
                  Try removing a facility, widening the price range, or choosing
                  a different operating date. The current catalogue only filters
                  on information each host actually published.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={clearAllFilters}
                  className="mt-5"
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {!isLoading && !error && filteredStudios.length > 0 && (
              <div className="space-y-4">
                {filteredStudios.map((studio) => (
                  <StudioResultCard
                    key={studio._id}
                    studio={studio}
                    selected={selectedId === studio._id}
                    onHover={setHoveredId}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className={`min-w-0 ${
              viewMode === "map"
                ? "block lg:col-start-2 xl:col-start-3"
                : "hidden xl:block"
            }`}
          >
            <div className="h-[calc(100dvh-17rem)] min-h-[460px] xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)] xl:min-h-[560px] xl:max-h-[900px]">
              {isLoading ? (
                <MapSkeleton />
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface p-6 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-subtle bg-surface-elevated text-foreground-subtle">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M9 20l-6-3V4l6 3m0 13l6-3m-6 3V7m6 10l6 3V7l-6-3m0 13V4M9 7l6-3"
                      />
                    </svg>
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Map unavailable
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-foreground-muted">
                    The map will return when the studio service responds.
                  </p>
                </div>
              ) : (
                <StudioMap
                  studios={filteredStudios}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  onSelect={handleMapSelect}
                  onHover={setHoveredId}
                  onShowInList={handleShowInList}
                />
              )}
            </div>
          </div>
        </div>
      </Container>

      <FilterDrawer
        open={drawerOpen}
        resultCount={filteredStudios.length}
        onClose={closeDrawer}
        onClear={clearAllFilters}
      >
        <FilterPanel
          filters={filters}
          studios={studios}
          priceBounds={priceBounds}
          resultCount={filteredStudios.length}
          idPrefix="drawer"
          showHeader={false}
          onChange={updateFilters}
          onClear={clearAllFilters}
        />
      </FilterDrawer>
    </>
  );
};
