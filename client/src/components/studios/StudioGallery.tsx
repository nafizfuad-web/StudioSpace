"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getStudioImages, type Studio } from "@/lib/studios";

interface StudioGalleryProps {
  studio: Pick<Studio, "title" | "images">;
}

export const StudioGallery: React.FC<StudioGalleryProps> = ({
  studio,
}) => {
  const images = getStudioImages(studio);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = Math.min(activeIndex, images.length - 1);
  const activeImage = images[safeIndex];

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % images.length);
  };

  return (
    <div
      className="space-y-3"
      role="group"
      aria-label="Studio photo gallery"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated">
        <Image
          src={activeImage}
          alt={`${studio.title} — photo ${safeIndex + 1} of ${images.length}`}
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 62vw"
        />

        {images.length > 1 && (
          <>
            <div className="absolute inset-x-3 bottom-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Show previous studio photo"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-image-overlay/70 text-white backdrop-blur-md transition-colors hover:bg-image-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Show next studio photo"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-image-overlay/70 text-white backdrop-blur-md transition-colors hover:bg-image-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-image-overlay/60 px-2 py-0.5 font-mono text-xs text-white/90 backdrop-blur-md">
              {safeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Choose a studio photo"
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              aria-pressed={index === safeIndex}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                index === safeIndex
                  ? "border-accent opacity-100 shadow-[0_0_12px_var(--color-accent-glow)]"
                  : "border-border-subtle opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
