"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { fetchUserProfile, type UserProfile } from "@/lib/user";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [, startTransition] = useTransition();

  const user = session.data?.user;

  // Authentication Guard
  useEffect(() => {
    if (!session.isPending && !session.error && !user) {
      startTransition(() => {
        router.replace(`/signin?next=${encodeURIComponent(pathname || "/dashboard")}`);
      });
    }
  }, [pathname, router, session.error, session.isPending, user]);

  // Fetch full user role & host application info
  useEffect(() => {
    if (user) {
      let isMounted = true;
      fetchUserProfile().then((data) => {
        if (!isMounted) return;
        if (data) {
          setProfile(data);
        } else {
          // Fallback to session user
          setProfile({
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            role: "renter",
            avatar: user.image,
          });
        }
        setLoadingProfile(false);
      });
      return () => {
        isMounted = false;
      };
    } else if (!session.isPending) {
      setLoadingProfile(false);
    }
  }, [session.isPending, user]);

  // Loading state
  if (session.isPending || (loadingProfile && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-subtle border-t-[#C2F800]" />
          <p className="text-sm font-medium text-foreground-muted">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated fallback (handled by useEffect redirect)
  if (!user && !session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <p className="text-sm text-foreground-secondary">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Sidebar for desktop & mobile */}
      <DashboardSidebar
        user={profile}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col md:pl-64">
        {/* Top bar for mobile screens */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-subtle bg-background/85 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg border border-border-subtle p-2 text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="text-sm font-bold text-foreground">
              Studio<span className="text-[#C2F800]">Space</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">
              {profile?.role?.toUpperCase() || "CLIENT"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
