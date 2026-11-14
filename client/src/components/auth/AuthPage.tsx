"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Container } from "@/components/ui";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { authClient } from "@/lib/authClient";

type AuthMode = "signin" | "signup";

interface AuthPageProps {
  mode: AuthMode;
  nextPath?: string;
  hasOAuthError?: boolean;
}

export function AuthPageFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      aria-label="Loading authentication page"
      aria-busy="true"
    >
      <div className="h-56 w-full max-w-md animate-pulse rounded-2xl border border-border-subtle bg-surface-elevated" />
    </div>
  );
}

const inputClassName =
  "w-full rounded-lg border border-border-subtle bg-background-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export function AuthPage({
  mode,
  nextPath,
  hasOAuthError = false,
}: AuthPageProps) {
  const router = useRouter();
  const isSignUp = mode === "signup";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    hasOAuthError
      ? "Google sign-in was not completed. Please try again."
      : null
  );

  const getPostAuthPath = () => {
    const requestedPath = new URLSearchParams(window.location.search).get(
      "next"
    );
    if (!requestedPath) return "/";

    try {
      const destination = new URL(requestedPath, window.location.origin);
      if (destination.origin !== window.location.origin) return "/";
      return `${destination.pathname}${destination.search}${destination.hash}`;
    } catch {
      return "/";
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleLoading) return;

    setError(null);
    setIsGoogleLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${getPostAuthPath()}`,
        errorCallbackURL: window.location.href,
      });

      if (result.error) {
        setError(result.error.message || "Unable to continue with Google.");
      }
    } catch {
      setError("Unable to continue with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (isSignUp) {
        const name = String(formData.get("name") ?? "").trim();
        const confirmPassword = String(
          formData.get("confirmPassword") ?? ""
        );

        if (!name || !email || !password || !confirmPassword) {
          setError("Please complete all required fields.");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const result = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message || "Unable to create your account.");
          return;
        }
      } else {
        if (!email || !password) {
          setError("Please enter your email and password.");
          return;
        }

        const result = await authClient.signIn.email({ email, password });

        if (result.error) {
          setError(result.error.message || "Unable to sign in.");
          return;
        }
      }

      router.replace(getPostAuthPath());
      router.refresh();
    } catch {
      setError(
        isSignUp
          ? "Unable to create your account. Please try again."
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Navbar />
      <main className="flex flex-1 items-center py-12 sm:py-16">
        <Container size="sm">
          <section className="mx-auto w-full max-w-md rounded-2xl border border-border-medium bg-surface-elevated p-6 shadow-2xl sm:p-8">
            <div className="mb-7 space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-sm leading-relaxed text-foreground-muted">
                {isSignUp
                  ? "Sign up to get started with StudioSpace."
                  : "Sign in to continue to StudioSpace."}
              </p>
              {nextPath && (
                <p className="text-sm text-foreground-secondary" role="status">
                  Sign in to continue to your requested page.
                </p>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label
                      className="text-sm font-medium text-foreground-secondary"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      className={inputClassName}
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-foreground-secondary"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className={inputClassName}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-foreground-secondary"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className={inputClassName}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    minLength={isSignUp ? 8 : undefined}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-1.5">
                    <label
                      className="text-sm font-medium text-foreground-secondary"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <input
                      className={inputClassName}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                )}

                {error && (
                  <p
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <Button
                  className="w-full"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || isGoogleLoading}
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <span
                    className="h-px flex-1 bg-border-subtle"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-foreground-muted">
                    Or
                  </span>
                  <span
                    className="h-px flex-1 bg-border-subtle"
                    aria-hidden="true"
                  />
                </div>

                <Button
                  className="w-full"
                  variant="secondary"
                  type="button"
                  isLoading={isGoogleLoading}
                  disabled={isSubmitting || isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  leftIcon={
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z"
                      />
                      <path
                        fill="#1976D2"
                        d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"
                      />
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                <p className="pt-2 text-center text-sm text-foreground-muted">
                  {isSignUp ? "Already have an account?" : "New to StudioSpace?"}{" "}
                  <Link
                    className="font-semibold text-accent transition-colors hover:text-accent-hover"
                    href={isSignUp ? "/signin" : "/signup"}
                  >
                    {isSignUp ? "Sign In" : "Create an account"}
                  </Link>
                </p>
            </form>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
