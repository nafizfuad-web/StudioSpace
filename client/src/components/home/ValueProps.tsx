import React from "react";
import { Container, SectionHeading } from "@/components/ui";

interface ValueItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const values: ValueItem[] = [
  {
    title: "Strictly Verified Technical Specs",
    description:
      "All listings display verified electrical amperage, 3-phase cam-locks, ceiling clearance heights, and sound-isolation ratings.",
    icon: (
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Transparent Hourly Rates",
    description:
      "Clear upfront pricing with no hidden location manager markups or surprise utility fees. What you see is what you pay.",
    icon: (
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "$1M Property & Liability Coverage",
    description:
      "Shoot with peace of mind. Every confirmed booking is backed by top-tier commercial property and third-party liability insurance.",
    icon: (
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M shield M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Dedicated Location Concierge",
    description:
      "Need multi-location permits, street closure advice, or specialized equipment staging? Our production desk supports you 24/7.",
    icon: (
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    title: "Weather & Rescheduling Guarantee",
    description:
      "Unfavorable rooftop rain or outdoor cloud cover? Reschedule your shoot date with participating hosts at zero extra cost.",
    icon: (
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
  },
  {
    title: "Direct Host Messaging & Scouting",
    description:
      "Coordinate directly with studio managers. Request quick 15-minute technical scouts or equipment drop-offs prior to call time.",
    icon: (
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
];

export const ValueProps: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background-secondary/70 border-t border-border-subtle">
      <Container size="xl" className="space-y-12">
        <SectionHeading
          badge="Marketplace Standards"
          title="Engineered for Professional Production Standards"
          subtitle="We eliminate the friction and uncertainty of traditional commercial studio booking."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((val) => (
            <div
              key={val.title}
              className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-border-accent transition-all duration-300 space-y-3 group hover:shadow-[0_8px_24px_-6px_var(--color-accent-glow)]"
            >
              <div className="h-10 w-10 rounded-xl bg-accent/10 border border-border-accent flex items-center justify-center transition-transform group-hover:scale-110">
                {val.icon}
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                {val.title}
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
