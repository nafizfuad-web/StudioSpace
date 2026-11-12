"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container, Button, Badge } from "@/components/ui";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/85 backdrop-blur-md transition-all">
      <Container size="xl" className="h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-border-accent flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_20px_var(--color-accent-glow)]">
            <span className="font-extrabold text-accent text-xl tracking-tighter">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1">
              Studio<span className="text-accent">Space</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-foreground-subtle -mt-1 font-medium">
              Creative Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground-secondary"
          aria-label="Main Navigation"
        >
          <Link
            href="#explore"
            className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 py-0.5"
          >
            Explore Spaces
          </Link>
          <Link
            href="#categories"
            className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 py-0.5"
          >
            Categories
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 py-0.5"
          >
            How It Works
          </Link>
          <Link
            href="#host"
            className="flex items-center gap-2 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 py-0.5"
          >
            <span>List Your Space</span>
            <Badge variant="accent" size="sm">
              Host
            </Badge>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" href="#signin">
            Sign In
          </Button>
          <Button variant="primary" size="sm" href="#explore">
            Get Started
          </Button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </Container>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-medium bg-background-secondary/95 backdrop-blur-xl px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 text-base font-medium">
            <Link
              href="#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
            >
              Explore Spaces
            </Link>
            <Link
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
            >
              Categories
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#host"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated flex items-center justify-between"
            >
              <span>List Your Space</span>
              <Badge variant="accent" size="sm">
                Host
              </Badge>
            </Link>
          </nav>
          <div className="pt-4 border-t border-border-subtle flex flex-col gap-3">
            <Button
              variant="outline"
              size="md"
              href="#signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full justify-center"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              href="#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full justify-center"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
