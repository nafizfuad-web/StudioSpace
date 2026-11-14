"use client";

import React, { useId } from "react";
import { useDateInputMin } from "@/hooks/useDateInputMin";
import { getCategoryLabel, STUDIO_CATEGORY_FILTERS } from "@/lib/studios";
import {
  CAPACITY_OPTIONS,
  FACILITY_GROUPS,
  getCategoryCounts,
  getFacilityCounts,
  type StudioCategoryFilter,
  type StudioFilters,
  type StudioPriceBounds,
} from "@/lib/studioSearch";
import type { Studio } from "@/lib/studios";

interface FilterPanelProps {
  filters: StudioFilters;
  studios: Studio[];
  priceBounds: StudioPriceBounds;
  resultCount: number;
  idPrefix: string;
  showHeader?: boolean;
  onChange: (patch: Partial<StudioFilters>) => void;
  onClear: () => void;
}

function CheckboxRow({
  id,
  checked,
  label,
  hint,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  hint?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1.5 text-sm text-foreground-secondary transition-colors hover:text-foreground"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border-medium bg-surface-elevated accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <span className="min-w-0">
        <span className="block leading-snug">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug text-foreground-subtle">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  studios,
  priceBounds,
  resultCount,
  idPrefix,
  showHeader = true,
  onChange,
  onClear,
}) => {
  const dateId = useId();
  const capacityId = useId();
  const dateInputRef = useDateInputMin();

  const categoryCounts = getCategoryCounts(studios);
  const facilityCounts = getFacilityCounts(studios);

  const priceSpan = Math.max(1, priceBounds.max - priceBounds.min);
  const sliderMin = Math.min(
    Math.max(filters.minPrice ?? priceBounds.min, priceBounds.min),
    priceBounds.max
  );
  const sliderMax = Math.max(
    Math.min(filters.maxPrice ?? priceBounds.max, priceBounds.max),
    priceBounds.min
  );
  const rangeStart = ((sliderMin - priceBounds.min) / priceSpan) * 100;
  const rangeWidth = ((sliderMax - sliderMin) / priceSpan) * 100;

  const commitMinPrice = (value: number) => {
    const next = Math.min(value, sliderMax);
    onChange({
      minPrice: next <= priceBounds.min ? null : next,
    });
  };

  const commitMaxPrice = (value: number) => {
    const next = Math.max(value, sliderMin);
    onChange({
      maxPrice: next >= priceBounds.max ? null : next,
    });
  };

  const toggleFacility = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...filters.facilities, id]))
      : filters.facilities.filter((facilityId) => facilityId !== id);

    onChange({ facilities: next });
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Filters
            </h2>
            <p
              className="mt-0.5 text-xs text-foreground-muted"
              aria-live="polite"
            >
              {resultCount} matching{" "}
              {resultCount === 1 ? "studio" : "studios"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md text-xs font-semibold text-accent transition-colors hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear all
          </button>
        </div>
      )}

      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
          Space type
        </legend>
        <div className="mt-2 space-y-1">
          {STUDIO_CATEGORY_FILTERS.map((option) => {
            const isActive = filters.category === option.value;
            const count = categoryCounts[option.value];

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    category: option.value as StudioCategoryFilter,
                  })
                }
                aria-pressed={isActive}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? "border-border-accent bg-accent/10 font-semibold text-accent"
                    : "border-transparent text-foreground-secondary hover:border-border-subtle hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <span>
                  {option.value === "all"
                    ? "All studios"
                    : getCategoryLabel(option.value)}
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    isActive ? "text-accent" : "text-foreground-subtle"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="border-t border-border-subtle pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
            Price per hour
          </h3>
          {(filters.minPrice !== null || filters.maxPrice !== null) && (
            <button
              type="button"
              onClick={() => onChange({ minPrice: null, maxPrice: null })}
              className="text-[11px] font-medium text-accent transition-colors hover:text-accent-light"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="rounded-lg border border-border-subtle bg-surface-elevated/70 px-2.5 py-1.5">
            <span className="font-mono text-xs text-foreground-subtle">$</span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {sliderMin}
            </span>
          </div>
          <span className="text-xs text-foreground-subtle">to</span>
          <div className="rounded-lg border border-border-subtle bg-surface-elevated/70 px-2.5 py-1.5">
            <span className="font-mono text-xs text-foreground-subtle">$</span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {sliderMax}
            </span>
          </div>
        </div>

        <div className="dual-range mt-3">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-elevated">
            <div
              className="absolute h-full rounded-full bg-accent"
              style={{
                left: `${rangeStart}%`,
                width: `${Math.max(0, rangeWidth)}%`,
              }}
            />
          </div>

          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={5}
            value={sliderMin}
            onChange={(event) => commitMinPrice(Number(event.target.value))}
            aria-label="Minimum hourly price"
            style={{
              zIndex: sliderMin > priceBounds.max - 5 ? 5 : 3,
            }}
          />
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={5}
            value={sliderMax}
            onChange={(event) => commitMaxPrice(Number(event.target.value))}
            aria-label="Maximum hourly price"
            style={{ zIndex: 4 }}
          />
        </div>

        <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-foreground-subtle">
          <span>${priceBounds.min}</span>
          <span>${priceBounds.max}</span>
        </div>
      </div>

      <div className="border-t border-border-subtle pt-5">
        <label
          htmlFor={`${idPrefix}-${capacityId}`}
          className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle"
        >
          Capacity
        </label>
        <select
          id={`${idPrefix}-${capacityId}`}
          value={filters.capacity}
          onChange={(event) =>
            onChange({ capacity: Number(event.target.value) })
          }
          className="mt-2 w-full cursor-pointer rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
        >
          {CAPACITY_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-surface text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="border-t border-border-subtle pt-5">
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
          Facilities
        </legend>
        <p className="mt-1 text-[11px] leading-relaxed text-foreground-subtle">
          Matched from each listing&apos;s feature list.
        </p>
        <div className="mt-2 max-h-72 space-y-0.5 overflow-y-auto pr-1">
          {FACILITY_GROUPS.map((group) => (
            <CheckboxRow
              key={group.id}
              id={`${idPrefix}-${group.id}`}
              checked={filters.facilities.includes(group.id)}
              label={group.label}
              hint={`${facilityCounts[group.id] ?? 0} listings`}
              onChange={(checked) => toggleFacility(group.id, checked)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-5">
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
          Availability
        </legend>

        <label
          htmlFor={`${idPrefix}-${dateId}`}
          className="mt-2 block text-xs font-medium text-foreground-secondary"
        >
          Operating date
        </label>
        <input
          ref={dateInputRef}
          id={`${idPrefix}-${dateId}`}
          type="date"
          value={filters.date}
          onChange={(event) => onChange({ date: event.target.value })}
          className="mt-1.5 w-full cursor-pointer rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
        />

        <div className="mt-2 space-y-0.5">
          <CheckboxRow
            id={`${idPrefix}-instant-book`}
            checked={filters.instantBook}
            label="Instant book"
            hint="Host confirms automatically"
            onChange={(checked) => onChange({ instantBook: checked })}
          />
          <CheckboxRow
            id={`${idPrefix}-same-day`}
            checked={filters.sameDay}
            label="Same-day booking"
            hint="No advance notice required"
            onChange={(checked) => onChange({ sameDay: checked })}
          />
        </div>

        <p className="mt-2 rounded-lg border border-border-subtle bg-surface-elevated/50 px-2.5 py-2 text-[11px] leading-relaxed text-foreground-muted">
          Dates use each listing&apos;s published operating days and advance
          notice. Live calendar availability is not connected yet.
        </p>
      </fieldset>

      <fieldset
        className="border-t border-border-subtle pt-5"
        aria-describedby={`${idPrefix}-rating-note`}
      >
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
          Rating
        </legend>
        <div className="mt-2 flex items-center gap-1 text-foreground-subtle">
          {Array.from({ length: 5 }).map((_, index) => (
            <svg
              key={index}
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.48 3.5a.6.6 0 011.04 0l2.13 4.31a.6.6 0 00.45.33l4.76.69a.6.6 0 01.33 1.02l-3.44 3.36a.6.6 0 00-.17.53l.81 4.74a.6.6 0 01-.87.63l-4.25-2.24a.6.6 0 00-.56 0l-4.25 2.24a.6.6 0 01-.87-.63l.81-4.74a.6.6 0 00-.17-.53L3.8 9.85a.6.6 0 01.33-1.02l4.76-.69a.6.6 0 00.45-.33l2.14-4.31z"
              />
            </svg>
          ))}
        </div>
        <p
          id={`${idPrefix}-rating-note`}
          className="mt-2 text-[11px] leading-relaxed text-foreground-subtle"
        >
          No verified ratings yet. Ratings will appear after guests complete
          bookings.
        </p>
      </fieldset>
    </div>
  );
};
