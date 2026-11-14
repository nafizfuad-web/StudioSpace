import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Container } from "@/components/ui";
import {
  fetchStudio,
  formatFeatureName,
  formatFullAddress,
  formatLocation,
  getCategoryLabel,
  type StudioBookingContext,
  type StudioHost,
} from "@/lib/studios";
import { StudioGallery } from "./StudioGallery";

interface StudioDetailsProps {
  params: Promise<{ id: string }>;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(
    0,
    1
  )}`.toUpperCase();
}

function formatHostSince(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function HostCard({ host }: { host: StudioHost | null }) {
  const hostName = host?.name ?? "StudioSpace Host";
  const hostSince = formatHostSince(host?.joinedAt);

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
        Host information
      </h2>

      <div className="mt-4 flex items-center gap-3">
        {host?.avatar ? (
          <Image
            src={host.avatar}
            alt={`${hostName} profile photo`}
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 shrink-0 rounded-full border border-border-accent object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent/15 text-sm font-bold uppercase tracking-wide text-accent">
            {getInitials(hostName)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {hostName}
          </p>
          <p className="text-xs text-foreground-muted">
            {host
              ? "Verified StudioSpace host"
              : "Host profile is being completed"}
          </p>
        </div>
      </div>

      {hostSince && (
        <p className="mt-4 border-t border-border-subtle pt-4 text-xs text-foreground-muted">
          Hosting on StudioSpace since {hostSince}
        </p>
      )}
    </section>
  );
}

function BookingCard({ terms }: { terms: StudioBookingContext }) {
  const sessionLength = terms.maximumHours
    ? `${terms.minimumHours}\u2013${terms.maximumHours} hours`
    : `${terms.minimumHours}+ hours`;
  const advanceNotice =
    terms.leadTimeDays <= 0
      ? "Same-day booking"
      : `${terms.leadTimeDays} day${
          terms.leadTimeDays === 1 ? "" : "s"
        } advance notice`;

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
        Booking details
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-foreground-muted">Session length</dt>
          <dd className="text-right font-medium text-foreground">
            {sessionLength}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-foreground-muted">Advance notice</dt>
          <dd className="text-right font-medium text-foreground">
            {advanceNotice}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-foreground-muted">Deposit</dt>
          <dd className="text-right font-medium text-foreground">
            {terms.depositPercentage > 0
              ? `${terms.depositPercentage}% at booking`
              : "No deposit required"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-foreground-muted">Availability</dt>
          <dd className="max-w-[60%] text-right font-medium text-foreground">
            {terms.availability}
          </dd>
        </div>
        <div className="border-t border-border-subtle pt-3">
          <dt className="text-foreground-muted">Cancellation</dt>
          <dd className="mt-1 text-xs leading-relaxed text-foreground-secondary">
            {terms.cancellationPolicy}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-elevated/60 px-3 py-2.5">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs leading-relaxed text-foreground-secondary">
          {terms.instantBook
            ? "Instant book is available for this studio."
            : "The host reviews each booking request before confirming."}
        </p>
      </div>
    </section>
  );
}

export async function StudioDetails({ params }: StudioDetailsProps) {
  const { id } = await params;
  const result = await fetchStudio(id);

  if (!result) {
    notFound();
  }

  const { studio, host } = result;
  const features = (studio.features ?? [])
    .map(formatFeatureName)
    .filter(Boolean);
  const price = studio.pricePerHour.toLocaleString("en-US");

  return (
    <Container size="xl" className="py-8 md:py-12">
      <Link
        href="/studios"
        className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-foreground-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to studios
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" size="sm" dot>
                {getCategoryLabel(studio.category)}
              </Badge>
              <Badge variant="outline" size="sm">
                {formatLocation(studio.location)}
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {studio.title}
              </h1>
              <p className="flex items-start gap-2 text-sm text-foreground-muted">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{formatFullAddress(studio.location)}</span>
              </p>
            </div>
          </header>

          <StudioGallery studio={studio} />

          <section className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              About this studio
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground-secondary">
              {studio.description}
            </p>
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Features and facilities
            </h2>

            {features.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-elevated/60 px-3 py-2.5 text-sm text-foreground-secondary"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                This host has not listed specific features yet. Contact them for
                equipment, power, and facility details.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-border-medium bg-surface p-6 shadow-xl">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                ${price}
              </span>
              <span className="text-sm text-foreground-muted">/ hour</span>
            </div>

            <div className="mt-5 space-y-3 border-t border-border-subtle pt-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground-muted">Category</span>
                <span className="text-right font-medium text-foreground">
                  {getCategoryLabel(studio.category)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground-muted">Capacity</span>
                <span className="text-right font-medium text-foreground">
                  Up to {studio.capacity} guests
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground-muted">Location</span>
                <span className="text-right font-medium text-foreground">
                  {formatLocation(studio.location)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border-accent bg-accent-muted px-3 py-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-xs leading-relaxed text-foreground-secondary">
                Every booking includes StudioSpace payment protection and host
                verification.
              </p>
            </div>
          </section>

          {studio.booking && <BookingCard terms={studio.booking} />}

          <HostCard host={host} />
        </aside>
      </div>
    </Container>
  );
}
