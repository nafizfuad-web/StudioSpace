/**
 * Resolve the StudioSpace API base URL.
 *
 * `NEXT_PUBLIC_API_URL` always wins. Without it, browser requests target port
 * 5000 on the same hostname the app was opened from, so loopback and LAN URLs
 * do not accidentally call the viewer's own machine. Server-side fetches have
 * no `window`, so they fall back to localhost.
 */
const DEFAULT_API_PORT = "5000";

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function formatHostname(hostname: string): string {
  // IPv6 literals in URLs must stay bracketed (`[::1]`).
  if (hostname.includes(":") && !hostname.startsWith("[")) {
    return `[${hostname}]`;
  }

  return hostname;
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return trimTrailingSlashes(configured);

  if (typeof window !== "undefined") {
    const hostname = formatHostname(window.location.hostname);
    return `${window.location.protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_URL = getApiBaseUrl();
