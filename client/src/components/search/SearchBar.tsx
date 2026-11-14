"use client";

import React, { useId, useState } from "react";
import { Button } from "@/components/ui";
import { useDateInputMin } from "@/hooks/useDateInputMin";
import { STUDIO_CATEGORY_FILTERS } from "@/lib/studios";
import type { StudioCityOption } from "@/lib/studioLocations";
import type {
  StudioCategoryFilter,
  StudioFilters,
} from "@/lib/studioSearch";

interface SearchBarProps {
  filters: StudioFilters;
  cityOptions: StudioCityOption[];
  onApply: (patch: {
    category: StudioCategoryFilter;
    location: string;
    date: string;
  }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  cityOptions,
  onApply,
}) => {
  const cityListId = useId();
  const dateId = useId();
  const categoryId = useId();
  const locationId = useId();

  const dateInputRef = useDateInputMin();
  const [category, setCategory] = useState<StudioCategoryFilter>(
    filters.category
  );
  const [location, setLocation] = useState(filters.location);
  const [date, setDate] = useState(filters.date);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply({
      category,
      location: location.trim(),
      date,
    });
  };

  const fieldClassName =
    "flex flex-col rounded-xl border border-border-subtle bg-surface-elevated/70 px-3 py-2 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30";

  const controlClassName =
    "mt-0.5 w-full bg-transparent text-sm font-medium text-foreground focus:outline-none";

  return (
    <div className="w-full rounded-2xl border border-border-medium bg-surface/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.9fr)_auto] lg:items-end"
      >
        <div className={fieldClassName}>
          <label
            htmlFor={categoryId}
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Studio type
          </label>
          <select
            id={categoryId}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as StudioCategoryFilter)
            }
            className={`${controlClassName} cursor-pointer`}
          >
            {STUDIO_CATEGORY_FILTERS.map((option) => (
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

        <div className={fieldClassName}>
          <label
            htmlFor={locationId}
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Location
          </label>
          <input
            id={locationId}
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            list={cityListId}
            autoComplete="off"
            placeholder="All cities"
            className={`${controlClassName} placeholder:text-foreground-subtle`}
          />
          <datalist id={cityListId}>
            {cityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
        </div>

        <div className={fieldClassName}>
          <label
            htmlFor={dateId}
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Date
          </label>
          <input
            ref={dateInputRef}
            id={dateId}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={`${controlClassName} cursor-pointer`}
          />
        </div>

        <div className="h-full sm:col-span-2 lg:col-span-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="h-full min-h-[56px] w-full justify-center rounded-xl text-sm font-semibold lg:px-6"
            leftIcon={
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          >
            Search studios
          </Button>
        </div>
      </form>
    </div>
  );
};
