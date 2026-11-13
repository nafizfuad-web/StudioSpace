"use client";

import { useEffect } from "react";
import { Button, Container } from "@/components/ui";

export default function StudioDetailsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="md" className="py-20 sm:py-28">
      <div className="mx-auto max-w-xl rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-xl sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M12 9v3.75m0 3h.008v.008H12v-.008zM10.29 3.86L1.82 18a2.25 2.25 0 001.93 3.375h16.5A2.25 2.25 0 0022.18 18L13.71 3.86a2.25 2.25 0 00-3.42 0z"
            />
          </svg>
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          We couldn&apos;t load this studio
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          The studio service may be temporarily unavailable. Please try again,
          or head back to explore other production-ready spaces.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" size="md" onClick={() => retry()}>
            Try again
          </Button>
          <Button variant="secondary" size="md" href="/#explore">
            Back to studios
          </Button>
        </div>
      </div>
    </Container>
  );
}
