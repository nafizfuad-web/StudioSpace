"use client";

import React, {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { Container } from "@/components/ui";
import { HeroSearchForm } from "./HeroSearchForm";

/** Time each slide stays on screen before the carousel advances. */
const AUTOPLAY_MS = 5500;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  description: string;
  image: string;
  imageAlt: string;
  /** Slide-scoped accent; the brand cyan stays on the first slide. */
  accent: string;
  objectPosition: string;
  searchLabel: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "photography",
    eyebrow: "Photography Studios",
    titleLead: "Find the Perfect Space for Your Next",
    titleHighlight: "Creative Project.",
    description:
      "Discover inspiring photo studios, professional photography spaces and creative locations.",
    image:
      "https://images.unsplash.com/photo-1767130298927-2df12c33e5d6?auto=format&fit=crop&w=1920&q=80",
    imageAlt:
      "Professional photography studio with lighting stands and a seamless backdrop",
    accent: "#00d2c4",
    objectPosition: "center",
    searchLabel: "Search photography studios",
  },
  {
    id: "video",
    eyebrow: "Video Production",
    titleLead: "Bring Your",
    titleHighlight: "Ideas to Life.",
    description:
      "Book professional video production studios for filming, content creation and creative projects.",
    image:
      "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?auto=format&fit=crop&w=1920&q=80",
    imageAlt:
      "Cinematic video production studio with a camera rig and professional stage lighting",
    accent: "#3d8bff",
    objectPosition: "center",
    searchLabel: "Search video production studios",
  },
  {
    id: "podcast",
    eyebrow: "Podcast & Recording",
    titleLead: "Your Voice Deserves the",
    titleHighlight: "Perfect Space.",
    description:
      "Discover premium podcast studios, recording rooms and soundproof creative spaces.",
    image:
      "https://images.unsplash.com/photo-1581368135153-a506cf13b1e1?auto=format&fit=crop&w=1920&q=80",
    imageAlt:
      "Modern podcast studio with a professional microphone, headphones and treated walls",
    accent: "#a855f7",
    objectPosition: "center",
    searchLabel: "Search podcast and recording studios",
  },
  {
    id: "events",
    eyebrow: "Events & Creative Spaces",
    titleLead: "Make Every Moment",
    titleHighlight: "Extraordinary.",
    description:
      "Find beautiful event venues, creative lounges and inspiring spaces for your next gathering.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
    imageAlt:
      "Premium event space with elegant interior lighting and formal dining furniture",
    accent: "#f59e0b",
    objectPosition: "center",
    searchLabel: "Search event venues and creative spaces",
  },
];

function subscribeToReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * Reduced-motion preference read without a state-syncing effect, so the
 * component never triggers a cascading render just to read a media query.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * Fully automatic hero: four photographic slides cross-fade on a 5.5s cadence
 * with no manual navigation. Hovering or moving keyboard focus into the banner
 * suspends rotation so copy can be read and the search form filled in, and a
 * reduced-motion preference keeps the first slide in place.
 */
export const HeroCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  const activeSlide = HERO_SLIDES[activeIndex];
  const totalSlides = HERO_SLIDES.length;

  const isPlaying =
    !isHovering && !hasFocusWithin && !prefersReducedMotion;

  // Restarts on every index change so each slide gets the full interval.
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPlaying, activeIndex, totalSlides]);

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setHasFocusWithin(false);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="StudioSpace featured studio types"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsHovering(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setIsHovering(false);
      }}
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.matches(":focus-visible")) setHasFocusWithin(true);
      }}
      onBlurCapture={handleBlur}
      style={{ "--hero-accent": activeSlide.accent } as React.CSSProperties}
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Cinematic 16:9 photographic layers. Only opacity changes between
          slides, so the banner height never shifts. */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              preload={index === 0}
              style={{ objectPosition: slide.objectPosition }}
              className={`object-cover ${isActive ? "hero-image-zoom" : ""}`}
            />
          </div>
        );
      })}

      {/* Readability overlays: dark on the left for copy, lighter over the photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,10,15,0.96)_0%,rgba(9,10,15,0.9)_30%,rgba(9,10,15,0.55)_56%,rgba(9,10,15,0.18)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,10,15,0.92)_0%,rgba(9,10,15,0.18)_32%,rgba(9,10,15,0)_60%,rgba(9,10,15,0.45)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-[30rem] w-[30rem] rounded-full opacity-25 blur-[130px] transition-colors duration-700"
        style={{ backgroundColor: activeSlide.accent }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <Container size="2xl" className="relative z-10">
        <div className="flex min-h-[34rem] flex-col justify-center py-14 md:min-h-[38rem] md:py-16 lg:min-h-[40rem] lg:py-20">
          <div className="w-full max-w-[46rem]">
            {/* Slide identity + position */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm sm:text-[11px]"
                style={{
                  borderColor: `${activeSlide.accent}59`,
                  backgroundColor: `${activeSlide.accent}1f`,
                  color: activeSlide.accent,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: activeSlide.accent }}
                />
                {activeSlide.eyebrow}
              </span>
              <span className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-white/45">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(totalSlides).padStart(2, "0")}
              </span>
            </div>

            {/* Only the active headline is mounted, so the page keeps a single h1. */}
            <h1
              key={activeSlide.id}
              className="hero-slide-in mt-5 flex min-h-[3.3em] items-end text-[2rem] leading-[1.1] font-extrabold tracking-tight text-white sm:text-[2.75rem] md:text-[3rem] lg:min-h-[2.3em] lg:text-5xl"
            >
              <span className="block">
                {activeSlide.titleLead}{" "}
                <span className="relative inline-block">
                  <span style={{ color: activeSlide.accent }}>
                    {activeSlide.titleHighlight}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full opacity-80"
                    style={{
                      background: `linear-gradient(90deg, ${activeSlide.accent}, transparent)`,
                    }}
                  />
                </span>
              </span>
            </h1>

            <p
              key={`${activeSlide.id}-copy`}
              className="hero-slide-in mt-5 min-h-[3.25em] max-w-xl text-sm leading-relaxed text-white/75 sm:text-base md:text-lg"
            >
              {activeSlide.description}
            </p>
          </div>

          {/* One persistent form: rotating slides never discard typed input. */}
          <HeroSearchForm
            accent={activeSlide.accent}
            label={activeSlide.searchLabel}
          />
        </div>
      </Container>

      {/* Autoplay progress: a quiet cue that also visualises the 5.5s cadence. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5"
      >
        {isPlaying ? (
          <div
            key={`${activeIndex}-${isPlaying}`}
            className="hero-progress h-full origin-left"
            style={{
              backgroundColor: activeSlide.accent,
              animationDuration: `${AUTOPLAY_MS}ms`,
            }}
          />
        ) : null}
      </div>
    </section>
  );
};
