import React from "react";
import { Container, Button, Badge, SectionHeading } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar Preview */}
      <header className="border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Container size="xl" className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/15 border border-border-accent flex items-center justify-center">
              <span className="font-bold text-accent text-lg">S</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                Studio<span className="text-accent">Space</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-foreground-subtle hidden sm:inline">
                Marketplace
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="accent" size="sm" dot>
              Phase 1: UI Foundation
            </Badge>
          </div>
        </Container>
      </header>

      {/* Hero Showcase Section */}
      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl" className="space-y-16">
          {/* Brand Intro & Heading */}
          <div className="space-y-4 max-w-3xl">
            <Badge variant="outline" size="sm">
              Design System & Architectural Foundation
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Premium Creative Studio Rental Marketplace
            </h1>
            <p className="text-base sm:text-lg text-foreground-muted leading-relaxed">
              StudioSpace provides film directors, photographers, producers, and creators with
              seamless access to verified production stages and creative spaces.
            </p>
          </div>

          {/* Design Tokens & Theme Palettes */}
          <section className="space-y-6">
            <SectionHeading
              badge="Design Tokens"
              title="Color Palette & Surface Hierarchy"
              subtitle="Cohesive dark aesthetic with vibrant teal/cyan accents and subtle luminous borders."
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border-medium flex flex-col justify-between h-28">
                <span className="text-xs text-foreground-muted font-mono">#090A0F</span>
                <span className="text-sm font-semibold text-foreground">Primary BG</span>
              </div>
              <div className="p-4 rounded-xl bg-background-secondary border border-border-medium flex flex-col justify-between h-28">
                <span className="text-xs text-foreground-muted font-mono">#0F1017</span>
                <span className="text-sm font-semibold text-foreground">Secondary BG</span>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border-medium flex flex-col justify-between h-28">
                <span className="text-xs text-foreground-muted font-mono">#14161F</span>
                <span className="text-sm font-semibold text-foreground">Surface Card</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-elevated border border-border-medium flex flex-col justify-between h-28">
                <span className="text-xs text-foreground-muted font-mono">#1A1C27</span>
                <span className="text-sm font-semibold text-foreground">Elevated Surface</span>
              </div>
              <div className="p-4 rounded-xl bg-accent text-[#090A0F] flex flex-col justify-between h-28 shadow-[0_0_20px_var(--color-accent-glow)]">
                <span className="text-xs text-[#090A0F]/80 font-mono">#00D2C4</span>
                <span className="text-sm font-bold">Cyan Accent</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-hover border border-border-accent flex flex-col justify-between h-28">
                <span className="text-xs text-accent font-mono">RGBA</span>
                <span className="text-sm font-semibold text-foreground">Accent Border</span>
              </div>
            </div>
          </section>

          {/* Reusable Component Showcase */}
          <section className="space-y-6">
            <SectionHeading
              badge="Components"
              title="Foundational UI Components"
              subtitle="Fully typed, accessible, lightweight primitives with responsive sizing and visible focus states."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button Primitive Variants */}
              <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Button Primitive</h3>
                  <p className="text-sm text-foreground-muted">
                    Supports multiple variants, sizes, loading states, and accessible focus rings.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary" size="md">
                    Primary Action
                  </Button>
                  <Button variant="secondary" size="md">
                    Secondary
                  </Button>
                  <Button variant="outline" size="md">
                    Outline
                  </Button>
                  <Button variant="ghost" size="md">
                    Ghost
                  </Button>
                </div>

                <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-3 items-center">
                  <Button variant="primary" size="sm">
                    Small
                  </Button>
                  <Button variant="primary" size="md">
                    Medium
                  </Button>
                  <Button variant="primary" size="lg">
                    Large
                  </Button>
                  <Button variant="secondary" size="sm" isLoading>
                    Loading
                  </Button>
                </div>
              </div>

              {/* Badge & Card Primitive Variants */}
              <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Badge & Card Surface</h3>
                  <p className="text-sm text-foreground-muted">
                    Semantic status indicators and cinematic dark cards with subtle luminous borders.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                  <Badge variant="accent" dot>
                    Verified Studio
                  </Badge>
                  <Badge variant="default">Photography</Badge>
                  <Badge variant="outline">Soundstage</Badge>
                  <Badge variant="success" dot>
                    Instant Book
                  </Badge>
                  <Badge variant="warning">Popular</Badge>
                </div>

                <div className="pt-2 border-t border-border-subtle">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle hover:border-border-accent transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                        Surface Demonstration
                      </span>
                      <span className="text-xs text-foreground-muted font-mono">0.08 Subtle Border</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground-secondary">
                      Cards respond with smooth transitions, subtle hover border luminescence, and contrast-compliant typography.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Architectural Readiness Notice */}
          <section className="p-6 sm:p-8 rounded-2xl bg-surface-elevated/50 border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                Architecture Status
              </span>
              <h3 className="text-lg font-bold text-foreground">
                Phase 1 Complete — Ready for Next Instruction
              </h3>
              <p className="text-sm text-foreground-muted">
                Design system, tokens, and foundational components are fully compiled and verified.
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Phase 2 Locked
            </Button>
          </section>
        </Container>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border-subtle py-8 text-center text-xs text-foreground-subtle">
        <Container size="xl">
          <p>© 2026 StudioSpace. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}
