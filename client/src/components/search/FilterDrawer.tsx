"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui";

interface FilterDrawerProps {
  open: boolean;
  resultCount: number;
  onClose: () => void;
  onClear: () => void;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  resultCount,
  onClose,
  onClear,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable =
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/65 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-filter-drawer-title"
        className="absolute inset-y-0 right-0 flex h-full w-[min(92vw,23rem)] flex-col border-l border-border-medium bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div>
            <h2
              id="studio-filter-drawer-title"
              className="text-base font-bold tracking-tight text-foreground"
            >
              Filters
            </h2>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Refine the catalogue to your production.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface text-foreground-secondary transition-colors hover:border-border-medium hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-surface/80 px-5 py-4">
          <button
            type="button"
            onClick={onClear}
            className="rounded-md text-xs font-semibold text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear all
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="rounded-lg px-5"
          >
            Show {resultCount} {resultCount === 1 ? "studio" : "studios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
