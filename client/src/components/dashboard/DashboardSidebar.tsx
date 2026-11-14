"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import type { UserProfile } from "@/lib/user";

interface DashboardSidebarProps {
  user: UserProfile | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  href: string;
  exact?: boolean;
  icon: (props: { className?: string }) => React.JSX.Element;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Overview",
    href: "/dashboard",
    exact: true,
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "My Bookings",
    href: "/dashboard/bookings",
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: "Saved Studios",
    href: "/dashboard/saved",
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    name: "My Profile",
    href: "/dashboard/profile",
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export function DashboardSidebar({
  user,
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/signin");
    } finally {
      setSigningOut(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return {
          label: "ADMIN",
          classes: "border-purple-500/40 bg-purple-500/10 text-purple-300",
        };
      case "host":
        return {
          label: "HOST",
          classes: "border-[#C2F800]/40 bg-[#C2F800]/10 text-[#C2F800]",
        };
      default:
        return {
          label: "CLIENT",
          classes: "border-sky-500/40 bg-sky-500/10 text-sky-300",
        };
    }
  };

  const badgeInfo = getRoleBadge(user?.role);
  const initials = (user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-surface-elevated/90 backdrop-blur-xl border-r border-border-medium p-4 text-foreground">
      {/* Top Header & Navigation */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-accent bg-gradient-to-br from-[#C2F800]/25 to-[#C2F800]/5 shadow-[0_0_18px_rgba(194,248,0,0.25)]">
              <span className="text-lg font-extrabold tracking-tighter text-[#C2F800]">
                S
              </span>
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">
                Studio<span className="text-[#C2F800]">Space</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                Client Portal
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Mini Card */}
        <div className="rounded-xl border border-border-subtle bg-surface/70 p-3 shadow-inner">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="h-10 w-10 rounded-full border border-border-medium object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C2F800]/15 border border-[#C2F800]/30 font-bold text-[#C2F800] text-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name || "Client"}
                </p>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold tracking-wider border ${badgeInfo.classes}`}
                >
                  {badgeInfo.label}
                </span>
              </div>
              <p className="truncate text-[11px] text-foreground-muted">
                {user?.email || "Signed In"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Dashboard Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#C2F800] text-black font-semibold shadow-[0_0_18px_rgba(194,248,0,0.2)]"
                    : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-5 w-5 transition-colors ${
                      isActive
                        ? "text-black"
                        : "text-foreground-muted group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-black text-[#C2F800]"
                        : "bg-surface text-foreground-muted"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-3 pt-6 border-t border-border-subtle">
        {/* Marketplace Link */}
        <Link
          href="/studios"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4 text-foreground-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>Explore Studios</span>
          <span className="ml-auto text-[10px] text-foreground-muted">↗</span>
        </Link>

        {/* Home Link */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4 text-foreground-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>StudioSpace Home</span>
        </Link>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer slide-in */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
