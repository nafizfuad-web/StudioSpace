import React from "react";
import { Container, SectionHeading } from "@/components/ui";

interface Step {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    step: "01",
    title: "Discover & Filter Stages",
    description:
      "Filter by specific creative activity, ceiling heights, electrical power (Cam-lock/220V), soundproofing, and daylight orientation.",
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
        />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Direct Booking & Escrow Protection",
    description:
      "Book instantly or send treatments directly to verified hosts. Your funds remain held in secure escrow until your production shoot completes.",
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Show Up & Produce Your Vision",
    description:
      "Receive automated gate codes, Wi-Fi credentials, and host contact details. Walk in, set up your cameras, and bring your vision to life.",
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <Container size="xl" className="space-y-16">
        <SectionHeading
          badge="Seamless Process"
          title="Scouting to Wrap Time in 3 Simple Steps"
          subtitle="Designed specifically for the fast-paced workflows of film crews, commercial photographers, and creative directors."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="relative p-8 rounded-2xl bg-surface border border-border-subtle hover:border-border-accent transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_8px_30px_-6px_var(--color-accent-glow)]"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 border border-border-accent flex items-center justify-center transition-transform group-hover:scale-110">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black font-mono text-foreground-subtle/30 group-hover:text-accent/30 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-border-medium">
                  <svg
                    className="w-6 h-6 text-foreground-subtle/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
