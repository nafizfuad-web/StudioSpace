import React from "react";
import { Container, Button, Badge } from "@/components/ui";

export const HostCTA: React.FC = () => {
  return (
    <section id="host" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Accent Glow */}
      <div
        className="absolute top-1/2 right-1/4 w-[500px] h-[350px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container size="xl">
        <div className="relative rounded-3xl bg-gradient-to-br from-surface-elevated via-surface to-[#0e1017] border border-border-medium p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm" dot>
                  Host on StudioSpace
                </Badge>
                <span className="text-xs font-mono uppercase tracking-widest text-foreground-subtle">
                  Zero Upfront Costs
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Turn Your Unused Studio Hours into Substantial Revenue.
              </h2>

              <p className="text-base sm:text-lg text-foreground-muted leading-relaxed">
                Join over 4,000 creative studio owners, loft hosts, and warehouse managers. List your space in under 10 minutes and get booked by verified photographers, brands, and film directors.
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-foreground-secondary">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>$1,000,000 Host Damage Protection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>Instant payouts 24h after wrap</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>Set your own rules & crew limits</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>Verified production IDs & insurance</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button variant="primary" size="lg" href="#host">
                  List Your Space for Free
                </Button>
                <Button variant="secondary" size="lg" href="#host">
                  Calculate Potential Earnings
                </Button>
              </div>
            </div>

            {/* Right Earnings Highlight Card */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-2xl bg-[#090a0f]/90 border border-border-accent shadow-2xl backdrop-blur-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                    Estimated Host Earnings
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                    $4,850<span className="text-base font-normal text-foreground-muted"> / mo</span>
                  </div>
                  <p className="text-xs text-foreground-muted">
                    Based on 4 bookings per week at $160/hr in major metropolitan markets.
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border-subtle text-xs text-foreground-secondary">
                  <div className="flex justify-between py-1">
                    <span className="text-foreground-muted">Average Booking Duration</span>
                    <span className="font-semibold text-foreground">7.5 hours</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-foreground-muted">Host Service Fee</span>
                    <span className="font-semibold text-emerald-400">Lowest in industry (3%)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-foreground-muted">Payout Security</span>
                    <span className="font-semibold text-accent">Stripe Direct Deposit</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border-subtle text-xs text-foreground-muted text-center">
                  ⚡ Over <strong className="text-foreground">85% of newly listed spaces</strong> receive their first booking inquiry within 72 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
