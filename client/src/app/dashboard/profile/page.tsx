"use client";

import React, { useEffect, useState } from "react";
import {
  fetchUserProfile,
  submitHostApplication,
  type UserProfile,
} from "@/lib/user";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Application form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setApplyMessage(null);

    const res = await submitHostApplication(notes);
    setSubmitting(false);

    if (res.success) {
      setApplyMessage({
        type: "success",
        text: res.message,
      });
      setShowApplyModal(false);
      setNotes("");
      await loadProfile();
    } else {
      setApplyMessage({
        type: "error",
        text: res.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-surface border border-border-subtle" />
        <div className="h-48 rounded-2xl bg-surface border border-border-subtle" />
      </div>
    );
  }

  const role = profile?.role || "renter";
  const hostApp = profile?.hostApplication;
  const initials = (
    profile?.name?.charAt(0) ||
    profile?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Profile &amp; Account
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manage your personal information, credentials, and studio host status.
        </p>
      </div>

      {applyMessage && (
        <div
          className={`rounded-xl p-4 text-xs font-medium border ${
            applyMessage.type === "success"
              ? "border-[#C2F800]/40 bg-[#C2F800]/10 text-[#C2F800]"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          }`}
        >
          {applyMessage.text}
        </div>
      )}

      {/* Personal Info Card */}
      <div className="rounded-2xl border border-border-medium bg-surface-elevated p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Personal Information
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Your public and account credentials.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {profile?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name || "User avatar"}
              className="h-20 w-20 rounded-2xl border-2 border-border-medium object-cover shadow-md"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#C2F800]/40 bg-[#C2F800]/15 text-2xl font-black text-[#C2F800] shadow-md">
              {initials}
            </div>
          )}

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">
                {profile?.name || "Client Name"}
              </h3>
              <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-300">
                {role.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-foreground-muted">{profile?.email}</p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Email Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-6">
          <div className="rounded-xl border border-border-subtle bg-surface/70 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
              Account Role
            </span>
            <p className="mt-1 text-sm font-bold capitalize text-foreground">
              {role}
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              {role === "host"
                ? "Can publish and manage studio listings."
                : role === "admin"
                ? "Full administrative platform access."
                : "Can browse, search, save, and book creative studios."}
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface/70 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
              Authentication Method
            </span>
            <p className="mt-1 text-sm font-bold text-foreground">
              Email / Google Secure Auth
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Protected by StudioSpace session tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Studio Owner / Host Status Card */}
      <div className="rounded-2xl border border-border-medium bg-surface-elevated p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Studio Owner Privileges
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">
              Rent out your own studios to artists, photographers, and audio engineers.
            </p>
          </div>

          {role === "host" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C2F800]/40 bg-[#C2F800]/10 px-3 py-1 text-xs font-bold text-[#C2F800]">
              <span className="h-2 w-2 rounded-full bg-[#C2F800]" />
              Verified Studio Owner
            </span>
          ) : role === "admin" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Administrator
            </span>
          ) : hostApp?.status === "pending" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Application Pending Review
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-1 text-xs font-bold text-zinc-300">
              Renter Account
            </span>
          )}
        </div>

        {/* Dynamic Host State Content */}
        {role === "host" ? (
          <div className="mt-6 rounded-xl border border-[#C2F800]/30 bg-[#C2F800]/5 p-5">
            <h3 className="text-sm font-bold text-[#C2F800]">
              You are an Approved Studio Host
            </h3>
            <p className="mt-1 text-xs text-foreground-secondary">
              Your account has full Host authorization. You can create studio listings, accept incoming booking requests, set custom pricing, and manage your availability.
            </p>
          </div>
        ) : role === "admin" ? (
          <div className="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
            <h3 className="text-sm font-bold text-purple-300">
              Platform Administrator
            </h3>
            <p className="mt-1 text-xs text-foreground-secondary">
              You have platform administrative permissions, including reviewing owner applications and managing all listings.
            </p>
          </div>
        ) : hostApp?.status === "pending" ? (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-300">
                  Host Application in Review
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Your owner application was received on{" "}
                  <span className="font-medium text-foreground">
                    {new Date(hostApp.createdAt).toLocaleDateString()}
                  </span>
                  . A StudioSpace administrator will evaluate your submission. Once approved, your account will instantly unlock Host capabilities.
                </p>
              </div>
            </div>
          </div>
        ) : hostApp?.status === "rejected" ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <h3 className="text-sm font-bold text-red-400">
                Previous Application Not Approved
              </h3>
              <p className="mt-1 text-xs text-foreground-secondary">
                {hostApp.rejectionReason ||
                  "Your previous application was not approved by the administrator. You may re-apply with updated studio details."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-5 py-2.5 text-xs font-bold text-black shadow-md transition hover:bg-[#b0e200]"
            >
              Submit New Application
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Every StudioSpace user begins with the Renter role. To list your own studio space, submit a quick application for Administrator verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-border-subtle bg-surface p-3 space-y-1">
                <span className="font-bold text-foreground">1. Apply Online</span>
                <p className="text-[11px] text-foreground-muted">
                  Submit your details and information about your studio space.
                </p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface p-3 space-y-1">
                <span className="font-bold text-foreground">2. Admin Review</span>
                <p className="text-[11px] text-foreground-muted">
                  StudioSpace administrators verify your creative listing.
                </p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface p-3 space-y-1">
                <span className="font-bold text-foreground">3. Start Earning</span>
                <p className="text-[11px] text-foreground-muted">
                  Host access is activated to create listings and receive bookings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_18px_rgba(194,248,0,0.25)] transition hover:bg-[#b0e200]"
            >
              Apply to Become a Studio Owner
            </button>
          </div>
        )}
      </div>

      {/* Host Application Modal */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border-medium bg-surface-elevated p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <h3 className="text-lg font-bold text-foreground">
                Apply for Studio Host Privileges
              </h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="rounded-lg p-1 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="host-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted"
                >
                  Tell us about your studio / creative space (optional)
                </label>
                <textarea
                  id="host-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Type of studio (audio recording, photography, podcast), city/location, equipment highlights..."
                  className="mt-2 w-full rounded-xl border border-border-medium bg-surface p-3 text-xs text-foreground placeholder:text-foreground-muted focus:border-[#C2F800] focus:outline-none focus:ring-1 focus:ring-[#C2F800]"
                />
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-3 text-[11px] text-foreground-muted">
                ℹ️ By submitting this application, you request promotion from Renter to Host role. An administrator will review your application.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  disabled={submitting}
                  className="rounded-xl border border-border-medium bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-5 py-2 text-xs font-bold text-black shadow-md hover:bg-[#b0e200] disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
