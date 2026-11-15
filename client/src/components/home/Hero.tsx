import React from "react";
import { Container } from "@/components/ui";
import { HeroCarousel } from "./HeroCarousel";

const HERO_STATS: Array<{ value: string; label: string; accent?: boolean }> = [
  { value: "10,000+", label: "Verified Production Spaces" },
  { value: "4.9 / 5.0", label: "Rating from 25,000+ Shoots", accent: true },
  { value: "$1M USD", label: "Host & Production Coverage" },
  { value: "100%", label: "Transparent Hourly Pricing" },
];

export const Hero: React.FC = () => {
  return (
    <>
      {/* 5.B Cinematic four-slide hero with the marketplace search form */}
      <HeroCarousel />

      {/* Social proof & trust badges strip */}
      <div className="border-b border-border-subtle bg-background-secondary/40">
        <Container
          size="2xl"
          className="grid grid-cols-2 gap-6 py-7 text-center sm:grid-cols-4 md:py-8"
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div
                className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${
                  stat.accent ? "text-accent" : "text-foreground"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-xs font-medium text-foreground-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </Container>
      </div>
    </>
  );
};
