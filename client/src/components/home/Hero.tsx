import React from "react";
import { Container, Button } from "@/components/ui";
import { SearchFilter } from "./SearchFilter";

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background Cinematic Gradient Orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-accent/10 blur-[130px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 right-10 w-[350px] h-[350px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container size="xl" className="relative space-y-10">
        {/* Top Trust Badge */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border-medium shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Over 10,000+ Verified Creative Stages Worldwide
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-4xl">
            Find the Perfect Space for Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-foreground">
              Creative Project.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-2xl leading-relaxed">
            Discover inspiring photo studios, film soundstages, daylight lofts, and immersive creative production spaces available to book by the hour.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="md" href="#explore">
              Explore Featured Stages
            </Button>
            <Button variant="secondary" size="md" href="#host">
              List Your Creative Space
            </Button>
          </div>
        </div>

        {/* Cinematic Search Filter Component */}
        <div className="pt-4">
          <SearchFilter />
        </div>

        {/* Social Proof & Trust Badges Strip */}
        <div className="pt-8 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              10,000+
            </div>
            <div className="text-xs text-foreground-muted font-medium">
              Verified Production Spaces
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent tracking-tight">
              4.9 / 5.0
            </div>
            <div className="text-xs text-foreground-muted font-medium">
              Rating from 25,000+ Shoots
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              $1M USD
            </div>
            <div className="text-xs text-foreground-muted font-medium">
              Host & Production Coverage
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              100%
            </div>
            <div className="text-xs text-foreground-muted font-medium">
              Transparent Hourly Pricing
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
