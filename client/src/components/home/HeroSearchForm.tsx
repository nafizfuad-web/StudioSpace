"use client";

import React, { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useDateInputMin } from "@/hooks/useDateInputMin";
import { STUDIO_CATEGORY_FILTERS } from "@/lib/studios";
import { STUDIO_CITY_OPTIONS } from "@/lib/studioLocations";
import type { StudioCategoryFilter } from "@/lib/studioSearch";

interface HeroSearchFormProps {
  /**
   * Slide accent colour. Painted through a CSS custom property so the whole
   * panel follows the active slide without duplicating Tailwind classes.
   */
  accent: string;
  /** Slide label used to describe the form to assistive technology. */
  label: string;
}

const FIELD_CLASS =
  "col-span-1 flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 transition-colors focus-within:border-[var(--hero-accent)] focus-within:bg-white/[0.08]";
const LABEL_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hero-accent)]";
const CONTROL_CLASS =
  "mt-0.5 w-full min-w-0 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/35";

export const HeroSearchForm: React.FC<HeroSearchFormProps> = ({
  accent,
  label,
}) => {
  const router = useRouter();
  const dateInputRef = useDateInputMin();
  const locationId = useId();
  const categoryId = useId();
  const dateId = useId();

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<StudioCategoryFilter>("all");
  const [date, setDate] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // The hero form submits into the same /studios search the catalogue reads,
    // so every value below maps to a real, URL-backed filter.
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (category !== "all") params.set("category", category);
    if (date) params.set("date", date);

    const query = params.toString();
    router.push(query ? `/studios?${query}` : "/studios");
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={label}
      style={{ "--hero-accent": accent } as React.CSSProperties}
      className="mt-8 grid w-full max-w-[52rem] grid-cols-2 gap-2.5 rounded-2xl border border-white/10 bg-[#08090e]/80 p-3 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:gap-3 sm:p-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto]"
    >
      {/* Location */}
      <div className={`${FIELD_CLASS} col-span-2 lg:col-span-1`}>
        <label htmlFor={locationId} className={LABEL_CLASS}>
          Location
        </label>
        <select
          id={locationId}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className={`${CONTROL_CLASS} cursor-pointer`}
        >
          <option value="" className="bg-[#0f1017] text-white">
            All locations
          </option>
          {STUDIO_CITY_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0f1017] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className={FIELD_CLASS}>
        <label htmlFor={categoryId} className={LABEL_CLASS}>
          Category
        </label>
        <select
          id={categoryId}
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as StudioCategoryFilter)
          }
          className={`${CONTROL_CLASS} cursor-pointer`}
        >
          {STUDIO_CATEGORY_FILTERS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0f1017] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className={FIELD_CLASS}>
        <label htmlFor={dateId} className={LABEL_CLASS}>
          Date
        </label>
        <input
          ref={dateInputRef}
          id={dateId}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={`${CONTROL_CLASS} cursor-pointer [color-scheme:dark]`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        style={{ backgroundColor: accent }}
        className="col-span-2 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-[#07080c] transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090e] active:scale-[0.99] lg:col-span-1 lg:min-h-[54px]"
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
            strokeWidth={2.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search Studios
      </button>
    </form>
  );
};
