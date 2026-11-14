import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { StudioSearch } from "@/components/search/StudioSearch";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search Creative Studios — StudioSpace",
  description:
    "Browse every published StudioSpace listing. Filter creative studios by production type, city, date, hourly price, capacity, and facilities.",
};

function SearchPageFallback() {
  return (
    <>
      <section className="border-b border-border-subtle bg-background-secondary/50">
        <Container size="2xl" className="py-8 md:py-10">
          <div className="h-3 w-32 animate-pulse rounded-full bg-surface-elevated" />
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-xl space-y-3">
              <div className="h-5 w-36 animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-surface-elevated" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-surface-elevated" />
            </div>
            <div className="h-20 w-full animate-pulse rounded-2xl bg-surface lg:w-64" />
          </div>
          <div className="mt-6 h-[92px] w-full animate-pulse rounded-2xl bg-surface" />
        </Container>
      </section>

      <Container size="2xl" className="py-8 md:py-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_360px]">
          <div className="hidden h-[620px] animate-pulse rounded-2xl bg-surface lg:block" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl bg-surface"
              />
            ))}
          </div>
          <div className="hidden h-[620px] animate-pulse rounded-2xl bg-surface xl:block" />
        </div>
      </Container>
    </>
  );
}

export default function StudiosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-accent/30 selection:text-foreground">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<SearchPageFallback />}>
          <StudioSearch />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
