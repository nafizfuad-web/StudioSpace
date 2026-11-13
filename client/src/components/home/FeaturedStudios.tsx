"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Container, SectionHeading, Badge, Button } from "@/components/ui";

interface Studio {
  id: string;
  title: string;
  category: string;
  location: string;
  pricePerHour: number;
  rating: number;
  reviewsCount: number;
  sqFt: number;
  capacity: number;
  imageUrl: string;
  badge?: string;
  instantBook?: boolean;
}

const studios: Studio[] = [
  {
    id: "studio-1",
    title: "Apex Daylight Infinity Cyclorama Studio",
    category: "Photo & Cyc",
    location: "Downtown Arts District, Los Angeles",
    pricePerHour: 145,
    rating: 4.98,
    reviewsCount: 112,
    sqFt: 3500,
    capacity: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    badge: "Superhost",
    instantBook: true,
  },
  {
    id: "studio-2",
    title: "The Industrial Brick Warehouse & Soundstage",
    category: "Soundstages",
    location: "Greenpoint, Brooklyn, NY",
    pricePerHour: 220,
    rating: 4.95,
    reviewsCount: 88,
    sqFt: 5200,
    capacity: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    badge: "Rare Find",
    instantBook: true,
  },
  {
    id: "studio-3",
    title: "Skyline Penthouse & Glass Daylight Loft",
    category: "Lofts",
    location: "SoHo, Manhattan, NY",
    pricePerHour: 195,
    rating: 4.99,
    reviewsCount: 146,
    sqFt: 2800,
    capacity: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    badge: "Top Rated",
    instantBook: false,
  },
  {
    id: "studio-4",
    title: "Neon Sound & Acoustic Production Stage",
    category: "Soundstages",
    location: "West Hollywood, Los Angeles",
    pricePerHour: 175,
    rating: 4.92,
    reviewsCount: 64,
    sqFt: 4000,
    capacity: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    badge: "Audio Ready",
    instantBook: true,
  },
  {
    id: "studio-5",
    title: "The Minimalist Concrete Film Pavilion",
    category: "Warehouses",
    location: "Culver City, Los Angeles",
    pricePerHour: 310,
    rating: 5.0,
    reviewsCount: 42,
    sqFt: 7500,
    capacity: 70,
    imageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    badge: "Drive-In Ready",
    instantBook: false,
  },
  {
    id: "studio-6",
    title: "360° Skyline Rooftop & Sunset Deck",
    category: "Lofts",
    location: "Shoreditch, London, UK",
    pricePerHour: 160,
    rating: 4.96,
    reviewsCount: 95,
    sqFt: 3100,
    capacity: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    badge: "Golden Hour",
    instantBook: true,
  },
];

const filterTabs = ["All Studios", "Photo & Cyc", "Soundstages", "Lofts", "Warehouses"];

export const FeaturedStudios: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All Studios");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStudios =
    activeTab === "All Studios"
      ? studios
      : studios.filter((s) => s.category.toLowerCase().includes(activeTab.toLowerCase().slice(0, 4)));

  return (
    <section id="explore" className="py-16 md:py-24 bg-background-secondary/60 border-y border-border-subtle">
      <Container size="xl" className="space-y-10">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <SectionHeading
            badge="Curated Studios"
            title="Production-Ready Spaces Ready to Book"
            subtitle="Inspected for lighting capabilities, power hookups, acoustic isolation, and crew comfort."
          />

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-accent text-accent-contrast shadow-[0_0_15px_var(--color-accent-glow)]"
                    : "bg-surface border border-border-subtle text-foreground-muted hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredStudios.map((studio) => (
            <div
              key={studio.id}
              className="group rounded-2xl bg-surface border border-border-subtle hover:border-border-accent transition-all duration-300 overflow-hidden flex flex-col hover:shadow-[0_12px_32px_-8px_var(--color-accent-glow)]"
            >
              {/* Image Container with Badges */}
              <div className="relative h-60 w-full overflow-hidden bg-surface-elevated">
                <Image
                  src={studio.imageUrl}
                  alt={studio.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-image-overlay via-transparent to-image-overlay/30" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {studio.badge && (
                    <Badge variant="accent" size="sm">
                      {studio.badge}
                    </Badge>
                  )}
                  {studio.instantBook && (
                    <Badge variant="success" size="sm" dot>
                      Instant Book
                    </Badge>
                  )}
                </div>

                {/* Favorite Heart Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(studio.id);
                  }}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-image-overlay/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:scale-110 active:scale-95 transition-all"
                  aria-label="Add to favorites"
                >
                  <svg
                    className={`h-4 w-4 transition-colors ${
                      favorites[studio.id]
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-white"
                    }`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Bottom Meta Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-1 font-medium bg-image-overlay/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    <span className="text-amber-400">★</span>
                    <strong className="text-white">{studio.rating}</strong>
                    <span className="text-white/70">({studio.reviewsCount})</span>
                  </span>
                  <span className="font-mono text-white/90 bg-image-overlay/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    {studio.sqFt} sq ft • max {studio.capacity}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {studio.location}
                  </span>
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {studio.title}
                  </h3>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-foreground tracking-tight">
                      ${studio.pricePerHour}
                    </span>
                    <span className="text-xs text-foreground-muted">/ hr</span>
                  </div>

                  <Button variant="secondary" size="sm" href="#explore">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="pt-4 text-center">
          <Button variant="outline" size="lg" href="#explore" className="px-8">
            Browse All 10,000+ Studios
          </Button>
        </div>
      </Container>
    </section>
  );
};
