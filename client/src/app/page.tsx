import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedStudios } from "@/components/home/FeaturedStudios";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ValueProps } from "@/components/home/ValueProps";
import { HostCTA } from "@/components/home/HostCTA";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-accent/30 selection:text-white">
      {/* 5.A Navigation Bar */}
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* 5.B Hero Section with Search Filter */}
        <Hero />

        {/* 5.C Category Exploration */}
        <CategoryGrid />

        {/* 5.D Featured Creative Studios */}
        <FeaturedStudios />

        {/* 5.E How It Works */}
        <HowItWorks />

        {/* 5.F Market Standards & Value Props */}
        <ValueProps />

        {/* 5.G Host Acquisition Call to Action */}
        <HostCTA />

        {/* 5.H Community Testimonials */}
        <Testimonials />
      </main>

      {/* 5.I Comprehensive Marketplace Footer */}
      <Footer />
    </div>
  );
}
