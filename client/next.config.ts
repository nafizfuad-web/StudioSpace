import os from "node:os";
import type { NextConfig } from "next";

/**
 * Next's dev server only trusts localhost by default. Include 127.0.0.1 and
 * the current LAN address so the network URL printed by `next dev` hydrates
 * correctly. Development-only; production ignores this list.
 */
function getDevelopmentOrigins(): string[] {
  const origins = ["127.0.0.1", "[::1]"];

  try {
    Object.values(os.networkInterfaces())
      .flat()
      .forEach((networkInterface) => {
        if (
          networkInterface?.family === "IPv4" &&
          !networkInterface.internal
        ) {
          origins.push(networkInterface.address);
        }
      });
  } catch {
    // Keep 127.0.0.1 available even if interface discovery fails.
  }

  return origins;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getDevelopmentOrigins(),
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
