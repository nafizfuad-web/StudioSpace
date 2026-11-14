"use client";

import React from "react";
import Link from "next/link";
import { Container, Button, Badge } from "@/components/ui";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-background-secondary pt-16 pb-12 text-sm text-foreground-muted">
      <Container size="xl" className="space-y-12">
        {/* Top Newsletter & Brand Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-border-medium flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm" dot>
                Creator Dispatch
              </Badge>
              <span className="text-xs font-mono uppercase tracking-widest text-foreground-subtle">
                Weekly Curation
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Get notified of newly listed secret stages and exclusive discounts
            </h3>
            <p className="text-sm text-foreground-muted">
              Curated locations for photographers, cinematographers, and production teams delivered straight to your inbox.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 min-w-[320px] max-w-md"
          >
            <input
              type="email"
              placeholder="Enter your creator email..."
              aria-label="Email Address"
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-medium text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
              required
            />
            <Button variant="primary" size="md" type="submit">
              Subscribe
            </Button>
          </form>
        </div>

        {/* Multi-Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pt-4">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-accent/20 border border-border-accent flex items-center justify-center">
                <span className="font-bold text-accent text-lg">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Studio<span className="text-accent">Space</span>
              </span>
            </Link>
            <p className="text-sm text-foreground-muted max-w-sm leading-relaxed">
              The premier marketplace connecting directors, photographers, and production crews with extraordinary creative spaces worldwide.
            </p>
            <div className="flex items-center gap-4 text-xs text-foreground-subtle">
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                Live Marketplace
              </span>
              <span>•</span>
              <span>10,000+ Verified Spaces</span>
            </div>
          </div>

          {/* Explore Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Explore Studios
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/studios?category=photography"
                  className="hover:text-accent transition-colors"
                >
                  Photo Studios
                </Link>
              </li>
              <li>
                <Link
                  href="/studios?category=film"
                  className="hover:text-accent transition-colors"
                >
                  Film Soundstages
                </Link>
              </li>
              <li>
                <Link
                  href="/studios?category=photography&facilities=cyclorama"
                  className="hover:text-accent transition-colors"
                >
                  Cyclorama Stages
                </Link>
              </li>
              <li>
                <Link
                  href="/studios?category=photography&facilities=natural-light"
                  className="hover:text-accent transition-colors"
                >
                  Daylight Lofts
                </Link>
              </li>
              <li>
                <Link
                  href="/studios?category=podcast"
                  className="hover:text-accent transition-colors"
                >
                  Podcast Lounges
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hosts Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              For Hosts
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#host" className="hover:text-accent transition-colors">
                  List Your Space
                </Link>
              </li>
              <li>
                <Link href="#host" className="hover:text-accent transition-colors">
                  Host Protection Guarantee
                </Link>
              </li>
              <li>
                <Link href="#host" className="hover:text-accent transition-colors">
                  Pricing Calculator
                </Link>
              </li>
              <li>
                <Link href="#host" className="hover:text-accent transition-colors">
                  Host Community
                </Link>
              </li>
              <li>
                <Link href="#host" className="hover:text-accent transition-colors">
                  Production Insurance
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-subtle">
          <p>© 2026 StudioSpace Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All Systems Operational
            </span>
            <span>Global Escrow Protection</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
