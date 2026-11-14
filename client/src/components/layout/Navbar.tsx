"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { authClient } from "@/lib/authClient";

const NAV_LINKS = [
  { label: "Explore", href: "/studios" },
  { label: "Categories", href: "/#categories" },
  { label: "List Your Space", href: "/#host" },
] as const;

function getDisplayName(user: {
  name?: string | null;
  email?: string | null;
}): string {
  const name = user.name?.trim();
  if (name) return name;

  const emailName = user.email?.split("@")[0]?.trim();
  return emailName || "Account";
}

function getInitials(user: { name?: string | null; email?: string | null }): string {
  const source = user.name?.trim() || user.email?.split("@")[0]?.trim() || "U";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const session = authClient.useSession();
  const user = session.data?.user ?? null;

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile drawer when the desktop breakpoint is reached.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleResize = () => {
      if (window.matchMedia("(min-width: 48rem)").matches) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close the account dropdown on outside click or Escape.
  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        accountButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setAuthError(null);

    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
    } catch {
      setAuthError("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const displayName = user ? getDisplayName(user) : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/85 backdrop-blur-xl transition-colors duration-200 supports-[backdrop-filter]:bg-background/75">
      <Container
        size="xl"
        className="flex h-16 items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4"
      >
        {/* Brand */}
        <Link
          href="/"
          aria-label="StudioSpace home"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background md:justify-self-start"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-accent bg-gradient-to-br from-accent/20 to-accent/5 shadow-[0_0_18px_var(--color-accent-glow)] transition-transform duration-200 group-hover:scale-105">
            <span className="text-lg font-extrabold tracking-tighter text-accent">
              S
            </span>
          </span>
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            Studio<span className="text-accent">Space</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-1 md:flex md:justify-self-center"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors duration-200 hover:bg-surface/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 md:justify-self-end">
          <ThemeToggle />

          <span
            className="hidden h-5 w-px bg-border-subtle md:block"
            aria-hidden="true"
          />

          <div className="hidden md:block">
            {session.isPending ? (
              <div
                className="h-9 w-24 animate-pulse rounded-lg border border-border-subtle bg-surface/70"
                aria-hidden="true"
              />
            ) : user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  ref={accountButtonRef}
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen((isOpen) => !isOpen);
                    setAuthError(null);
                  }}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                  aria-controls="account-menu"
                  className="flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-surface/60 py-1 pl-1 pr-2.5 text-sm font-medium text-foreground-secondary transition-colors duration-200 hover:border-border-medium hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold uppercase tracking-wide text-accent">
                    {getInitials(user)}
                  </span>
                  <span className="hidden max-w-[9rem] truncate lg:block">
                    {displayName}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      accountMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {accountMenuOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border-medium bg-surface p-1.5 shadow-2xl shadow-black/20"
                  >
                    <div className="border-b border-border-subtle px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {displayName}
                      </p>
                      {user.email && (
                        <p className="mt-0.5 truncate text-xs text-foreground-muted">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </button>

                    {authError && (
                      <p
                        role="alert"
                        className="px-3 pb-2 pt-1 text-xs text-red-500"
                      >
                        {authError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                href="/signin"
                className="h-9 rounded-lg px-4"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface/60 text-foreground-secondary transition-colors duration-200 hover:border-border-medium hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {mobileMenuOpen ? (
              <svg
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border-subtle bg-background/95 backdrop-blur-xl md:hidden"
        >
          <Container size="xl" className="py-4">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors duration-200 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 space-y-3 border-t border-border-subtle pt-3">
              {session.isPending ? (
                <div
                  className="h-10 animate-pulse rounded-lg border border-border-subtle bg-surface/70"
                  aria-hidden="true"
                />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold uppercase tracking-wide text-accent">
                      {getInitials(user)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {displayName}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-foreground-muted">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Profile
                  </Link>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleSignOut}
                    isLoading={isSigningOut}
                    className="w-full justify-center"
                  >
                    Sign out
                  </Button>

                  {authError && (
                    <p role="alert" className="text-xs text-red-500">
                      {authError}
                    </p>
                  )}
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  href="/signin"
                  onClick={closeMobileMenu}
                  className="w-full justify-center"
                >
                  Sign In
                </Button>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};
