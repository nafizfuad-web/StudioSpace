"use client";

import { useEffect, useRef } from "react";
import { getTodayIso } from "@/lib/studioSearch";

/**
 * Set a date input's `min` attribute to today's local date after hydration.
 *
 * Writing the attribute through a ref avoids rendering a server/client date
 * mismatch and avoids a state update solely for a presentational attribute.
 */
export function useDateInputMin() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const updateMin = () => {
      input.min = getTodayIso();
    };

    updateMin();
    input.addEventListener("focus", updateMin);

    return () => input.removeEventListener("focus", updateMin);
  }, []);

  return inputRef;
}
