"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useDateInputMin } from "@/hooks/useDateInputMin";
import { STUDIO_CATEGORY_FILTERS } from "@/lib/studios";
import { STUDIO_CITY_OPTIONS } from "@/lib/studioLocations";
import type { StudioCategoryFilter } from "@/lib/studioSearch";

const POPULAR_SEARCHES: Array<{ label: string; href: string }> = [
  {
    label: "Daylight lofts",
    href: "/studios?category=photography&facilities=natural-light",
  },
  {
    label: "Cyc wall stages",
    href: "/studios?category=photography&facilities=cyclorama",
  },
  { label: "Podcast studios", href: "/studios?category=podcast" },
  { label: "Film stages", href: "/studios?category=film" },
];

export const SearchFilter: React.FC = () => {
  const router = useRouter();
  const dateInputRef = useDateInputMin();
  const [category, setCategory] = useState<StudioCategoryFilter>("all");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (city) params.set("location", city);
    if (date) params.set("date", date);

    const query = params.toString();
    router.push(query ? `/studios?${query}` : "/studios");
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-surface/95 border border-border-medium p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center"
      >
        {/* Studio Category */}
        <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-elevated/70 border border-border-subtle focus-within:border-accent transition-colors">
          <label
            htmlFor="activity-select"
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Studio Type
          </label>
          <select
            id="activity-select"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as StudioCategoryFilter)
            }
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer mt-0.5"
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

        {/* Location */}
        <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-elevated/70 border border-border-subtle focus-within:border-accent transition-colors">
          <label
            htmlFor="location-select"
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Location
          </label>
          <select
            id="location-select"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="" className="bg-surface text-foreground">
              All locations
            </option>
            {STUDIO_CITY_OPTIONS.map((option) => (
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

        {/* Date */}
        <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-elevated/70 border border-border-subtle focus-within:border-accent transition-colors">
          <label
            htmlFor="date-select"
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Date
          </label>
          <input
            ref={dateInputRef}
            id="date-select"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer mt-0.5"
          />
        </div>

        {/* Submit Button */}
        <div className="sm:col-span-3 lg:col-span-1 h-full flex items-center">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-full min-h-[52px] font-semibold text-sm justify-center rounded-xl"
            leftIcon={
              <svg
                className="w-4 h-4 mr-1 text-accent-contrast"
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
            Search Studios
          </Button>
        </div>
      </form>

      {/* Popular quick links */}
      <div className="mt-3 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-2 px-1 text-xs text-foreground-muted">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-foreground-subtle">
          Popular:
        </span>
        {POPULAR_SEARCHES.map((search, index) => (
          <React.Fragment key={search.label}>
            {index > 0 && <span aria-hidden="true">•</span>}
            <Link
              href={search.href}
              className="hover:text-accent transition-colors"
            >
              {search.label}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
