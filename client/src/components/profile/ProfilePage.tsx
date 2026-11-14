"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button, Container } from "@/components/ui";
import { authClient } from "@/lib/authClient";

export function ProfilePage() {
  const router = useRouter();
  const session = authClient.useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (!session.isPending && !session.error && !user) {
      router.replace("/signin?next=%2Fprofile");
    }
  }, [router, session.error, session.isPending, user]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Navbar />
      <main className="flex-1 py-12 sm:py-16">
        <Container size="md">
          <section className="mx-auto max-w-2xl rounded-2xl border border-border-medium bg-surface-elevated p-6 shadow-2xl sm:p-8">
            <div className="mb-7 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Your Profile
              </h1>
              <p className="text-sm text-foreground-muted">
                Account information from your authenticated session.
              </p>
            </div>

            {session.isPending ? (
              <div
                className="h-24 animate-pulse rounded-xl bg-surface"
                aria-label="Loading profile"
              />
            ) : session.error ? (
              <div className="space-y-4" role="alert">
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  Unable to load your profile. Check your connection and try
                  again.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => void session.refetch()}
                >
                  Try Again
                </Button>
              </div>
            ) : user ? (
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {user.image ? (
                  // OAuth avatars can use provider-hosted domains, so avoid
                  // broadening the app-wide remote image allowlist.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="h-20 w-20 rounded-full border border-border-medium object-cover"
                    src={user.image}
                    alt={`${user.name || "User"} profile`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-border-accent bg-accent-muted text-2xl font-bold text-accent"
                    aria-hidden="true"
                  >
                    {(user.name?.trim().charAt(0) ||
                      user.email?.trim().charAt(0) ||
                      "U").toUpperCase()}
                  </div>
                )}

                <dl className="min-w-0 flex-1 space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Name
                    </dt>
                    <dd className="mt-1 break-words text-base font-medium text-foreground">
                      {user.name || "Name not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Email
                    </dt>
                    <dd className="mt-1 break-all text-sm text-foreground-secondary">
                      {user.email}
                    </dd>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center rounded-xl bg-[#C2F800] px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-[#b0e200]"
                    >
                      Open Client Dashboard →
                    </Link>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="space-y-4" role="status">
                <p className="text-sm text-foreground-secondary">
                  Sign in to view your profile.
                </p>
                <Link
                  className="inline-flex rounded-lg font-semibold text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  href="/signin?next=%2Fprofile"
                >
                  Sign In
                </Link>
              </div>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
