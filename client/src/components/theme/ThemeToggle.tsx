"use client";

import React from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Light/dark theme switch.
 *
 * The correct icon is selected by CSS from the `data-theme` attribute, so the
 * button renders accurately on the server and never flashes the wrong icon.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const handleToggle = () => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage may be unavailable (private mode); the theme still applies.
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-surface/60 text-foreground-secondary transition-colors duration-200 hover:border-border-medium hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      {/* Sun is visible in dark mode. */}
      <svg
        className="theme-icon theme-icon-sun pointer-events-none h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3.5" strokeWidth={1.75} />
        <path
          strokeLinecap="round"
          strokeWidth={1.75}
          d="M12 2.75v2M12 19.25v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2.75 12h2M19.25 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </svg>

      {/* Moon is visible in light mode. */}
      <svg
        className="theme-icon theme-icon-moon pointer-events-none h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    </button>
  );
};
