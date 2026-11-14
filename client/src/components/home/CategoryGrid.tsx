import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading, Badge } from "@/components/ui";

interface CategoryItem {
  id: string;
  name: string;
  count: string;
  description: string;
  imageUrl: string;
  badge?: string;
}

const categories: CategoryItem[] = [
  {
    id: "photo-studios",
    name: "Photo Studios & Cyc Walls",
    count: "2,400+ spaces",
    description: "Infinity cycs, strobe power, and seamless paper backdrops.",
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    badge: "Most Popular",
  },
  {
    id: "film-soundstages",
    name: "Soundstages & Film Stages",
    count: "1,150+ spaces",
    description: "Acoustically treated, high grid clearance, and cam-lock power.",
    imageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    badge: "Production Ready",
  },
  {
    id: "daylight-lofts",
    name: "Daylight Lofts & Mansions",
    count: "1,850+ spaces",
    description: "Floor-to-ceiling windows and abundant natural ambient light.",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "podcast-studios",
    name: "Podcast & Broadcast Rooms",
    count: "890+ spaces",
    description: "Multi-cam 4K setups, Shure mics, and soundproof booths.",
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rooftops-openair",
    name: "Rooftops & Skyline Decks",
    count: "720+ spaces",
    description: "Unobstructed city skyline panoramas and golden hour angles.",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "industrial-warehouses",
    name: "Industrial Warehouses",
    count: "1,320+ spaces",
    description: "Raw concrete, steel beams, and heavy vehicular drive-in access.",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
];

export const CategoryGrid: React.FC = () => {
  return (
    <section id="categories" className="py-16 md:py-24 bg-background">
      <Container size="xl" className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Categories"
            title="Explore Studios by Creative Purpose"
            subtitle="Book tailored stages equipped with the exact power, acoustics, lighting grids, and backdrops your project demands."
          />
          <Link
            href="/studios"
            className="text-sm font-semibold text-accent hover:text-accent-light flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <span>Browse all studios</span>
            <svg
              className="w-4 h-4"
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
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href="#explore"
              className="group relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-border-accent transition-all duration-300 hover:shadow-[0_12px_30px_-8px_var(--color-accent-glow)] flex flex-col h-[280px]"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Gradient Overlays for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-image-overlay via-image-overlay/60 to-transparent" />
              </div>

              {/* Card Content Overlay */}
              <div className="relative z-10 flex flex-col justify-between h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground-secondary/90 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-border-subtle">
                    {cat.count}
                  </span>
                  {cat.badge && (
                    <Badge variant="accent" size="sm">
                      {cat.badge}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-accent-light transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    <svg
                      className="w-5 h-5 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
