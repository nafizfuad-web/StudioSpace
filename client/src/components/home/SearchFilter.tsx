"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";

export const SearchFilter: React.FC = () => {
  const [activity, setActivity] = useState("photo-shoot");
  const [city, setCity] = useState("los-angeles");
  const [attendees, setAttendees] = useState("1-10");

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-surface/95 border border-border-medium p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center"
      >
        {/* Activity Selection */}
        <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-elevated/70 border border-border-subtle focus-within:border-accent transition-colors">
          <label
            htmlFor="activity-select"
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Activity Type
          </label>
          <select
            id="activity-select"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="photo-shoot" className="bg-[#14161f] text-foreground">
              Photo Shoot
            </option>
            <option value="film-production" className="bg-[#14161f] text-foreground">
              Film & Video Production
            </option>
            <option value="music-video" className="bg-[#14161f] text-foreground">
              Music Video Shoot
            </option>
            <option value="soundstage" className="bg-[#14161f] text-foreground">
              Soundstage & Audio
            </option>
            <option value="podcast" className="bg-[#14161f] text-foreground">
              Podcast Recording
            </option>
            <option value="workshop" className="bg-[#14161f] text-foreground">
              Creative Workshop
            </option>
          </select>
        </div>

        {/* Location Selection */}
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
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="los-angeles" className="bg-[#14161f] text-foreground">
              Los Angeles, CA
            </option>
            <option value="new-york" className="bg-[#14161f] text-foreground">
              New York, NY
            </option>
            <option value="london" className="bg-[#14161f] text-foreground">
              London, UK
            </option>
            <option value="atlanta" className="bg-[#14161f] text-foreground">
              Atlanta, GA
            </option>
            <option value="toronto" className="bg-[#14161f] text-foreground">
              Toronto, ON
            </option>
            <option value="berlin" className="bg-[#14161f] text-foreground">
              Berlin, DE
            </option>
          </select>
        </div>

        {/* Crew Size */}
        <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-elevated/70 border border-border-subtle focus-within:border-accent transition-colors">
          <label
            htmlFor="crew-select"
            className="text-[11px] font-semibold uppercase tracking-wider text-accent"
          >
            Cast & Crew
          </label>
          <select
            id="crew-select"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="1-5" className="bg-[#14161f] text-foreground">
              1 – 5 people
            </option>
            <option value="1-10" className="bg-[#14161f] text-foreground">
              6 – 15 people
            </option>
            <option value="15-30" className="bg-[#14161f] text-foreground">
              16 – 30 people
            </option>
            <option value="30+" className="bg-[#14161f] text-foreground">
              30+ people (Large Crew)
            </option>
          </select>
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
                className="w-4 h-4 mr-1 text-[#090a0f]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

      {/* Popular quick tags */}
      <div className="mt-3 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-2 px-1 text-xs text-foreground-muted">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-foreground-subtle">
          Popular:
        </span>
        <button
          type="button"
          onClick={() => setActivity("photo-shoot")}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          Daylight Loft
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => setActivity("film-production")}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          Cyc Wall Stage
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => setActivity("soundstage")}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          Soundproof Stage
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => setActivity("podcast")}
          className="hover:text-accent transition-colors cursor-pointer"
        >
          Podcast Studio
        </button>
      </div>
    </div>
  );
};
