"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function SettingsPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  // Client notification toggles (persisted in local state)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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

  const user = session.data?.user;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Configure your notification preferences, display theme, and account security.
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-border-medium bg-surface-elevated p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Email &amp; Notification Preferences
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Choose which notifications you wish to receive about your bookings.
        </p>

        <form onSubmit={handleSaveNotifications} className="mt-6 space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4 cursor-pointer hover:border-border-medium transition">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">
                Booking Confirmations &amp; Updates
              </span>
              <p className="text-xs text-foreground-muted">
                Receive emails when a host accepts, declines, or alters your studio reservation.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-border-medium text-[#C2F800] focus:ring-[#C2F800]"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4 cursor-pointer hover:border-border-medium transition">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">
                Upcoming Session Reminders
              </span>
              <p className="text-xs text-foreground-muted">
                Receive reminders 24 hours prior to scheduled studio booking sessions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="h-4 w-4 rounded border-border-medium text-[#C2F800] focus:ring-[#C2F800]"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4 cursor-pointer hover:border-border-medium transition">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground">
                New Studios &amp; Creator Promotions
              </span>
              <p className="text-xs text-foreground-muted">
                Occasional product updates, new studio spotlights, and creator community news.
              </p>
            </div>
            <input
              type="checkbox"
              checked={promoAlerts}
              onChange={(e) => setPromoAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-border-medium text-[#C2F800] focus:ring-[#C2F800]"
            />
          </label>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-[#C2F800]">
                ✓ Notification preferences saved!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-[#b0e200]"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Theme */}
      <div className="rounded-2xl border border-border-medium bg-surface-elevated p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Appearance &amp; Display Theme
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Customize the color scheme of your StudioSpace workspace.
        </p>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-foreground">
              Color Theme
            </span>
            <p className="text-xs text-foreground-muted">
              Toggle between dark and light appearance modes.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Security & Active Session */}
      <div className="rounded-2xl border border-border-medium bg-surface-elevated p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Security &amp; Active Session
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Your current session credentials.
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4 text-xs">
            <div>
              <span className="font-semibold text-foreground block">
                Signed In As
              </span>
              <span className="text-foreground-muted">
                {user?.email || "Authenticated user"}
              </span>
            </div>
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Active Session
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4 text-xs">
            <div>
              <span className="font-semibold text-foreground block">
                Authentication Protection
              </span>
              <span className="text-foreground-muted">
                Email / Password &amp; Google OAuth (GitHub authentication disabled)
              </span>
            </div>
            <span className="text-foreground-muted">OAuth 2.0 / HTTPOnly</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-red-400">
          Account Actions
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Sign out of your StudioSpace account on this device.
        </p>

        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Sign Out of Session
            </p>
            <p className="text-[11px] text-foreground-muted">
              Ends your authenticated session securely.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition"
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
