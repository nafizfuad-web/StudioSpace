import { Container } from "@/components/ui";

export function StudioDetailsSkeleton() {
  return (
    <Container
      size="xl"
      className="py-8 md:py-12"
      role="status"
      aria-live="polite"
      aria-label="Loading studio details"
    >
      <span className="sr-only">Loading studio details…</span>

      <div className="h-4 w-32 animate-pulse rounded-full bg-surface-elevated" />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-6 w-40 animate-pulse rounded-full bg-surface-elevated" />
            </div>
            <div className="space-y-3">
              <div className="h-9 w-4/5 animate-pulse rounded-lg bg-surface-elevated" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-elevated" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="aspect-[4/3] w-full animate-pulse rounded-2xl border border-border-subtle bg-surface-elevated" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`gallery-thumb-${index}`}
                  className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-surface-elevated"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-6">
            <div className="h-5 w-40 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-4 w-full animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-elevated" />
          </div>

          <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6">
            <div className="h-5 w-48 animate-pulse rounded-full bg-surface-elevated" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`feature-${index}`}
                  className="h-10 animate-pulse rounded-xl bg-surface-elevated"
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-5 rounded-2xl border border-border-medium bg-surface p-6">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-elevated" />
            <div className="space-y-3 border-t border-border-subtle pt-5">
              <div className="h-4 w-full animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-4 w-full animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-surface-elevated" />
            </div>
            <div className="h-16 animate-pulse rounded-xl bg-surface-elevated" />
          </div>

          <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6">
            <div className="h-3 w-28 animate-pulse rounded-full bg-surface-elevated" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-surface-elevated" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded-full bg-surface-elevated" />
                <div className="h-3 w-40 animate-pulse rounded-full bg-surface-elevated" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
