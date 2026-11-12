import React from "react";
import { Container, SectionHeading, Badge } from "@/components/ui";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  project: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: "test-1",
    quote:
      "StudioSpace transformed our commercial production workflow. Being able to verify 3-phase cam-lock power and ceiling height before arriving on set saved our crew hours of scouting.",
    author: "Elena Rostova",
    role: "Commercial Director",
    project: "Global Automotive Spot",
    rating: 5,
  },
  {
    id: "test-2",
    quote:
      "We booked a 4,000 sq ft daylight loft in SoHo with only 48 hours notice. The host was incredible, gate access was instant, and the natural lighting elevated our entire fashion editorial.",
    author: "Marcus Vance",
    role: "Fashion & Editorial Photographer",
    project: "Vogue Runway Shoot",
    rating: 5,
  },
  {
    id: "test-3",
    quote:
      "The $1M insurance guarantee gave our client complete confidence to book a massive industrial warehouse for our music video. No hidden fees and flawless direct host communication.",
    author: "Darius Sterling",
    role: "Lead Video Producer",
    project: "Warner Music Group",
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background-secondary/60 border-t border-border-subtle">
      <Container size="xl" className="space-y-12">
        <SectionHeading
          badge="Creator Stories"
          title="Trusted by Filmmakers, Photographers & Agencies"
          subtitle="From independent photography sessions to international commercial campaigns."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl bg-surface border border-border-subtle hover:border-border-accent transition-all duration-300 flex flex-col justify-between space-y-6 group hover:shadow-[0_8px_25px_-6px_var(--color-accent-glow)]"
            >
              <div className="space-y-4">
                {/* Rating Stars & Project Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-sm tracking-widest">
                    {"★".repeat(item.rating)}
                  </div>
                  <Badge variant="accent" size="sm">
                    Verified Shoot
                  </Badge>
                </div>

                <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-elevated border border-border-medium flex items-center justify-center font-bold text-accent">
                  {item.author[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {item.author}
                  </div>
                  <div className="text-xs text-foreground-muted">
                    {item.role} •{" "}
                    <span className="text-foreground-secondary font-medium">
                      {item.project}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
