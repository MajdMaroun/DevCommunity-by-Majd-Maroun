import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the development indicator in the corner.
  devIndicators: false,

  // Allow access to the development server from this local network address.
  allowedDevOrigins: ["192.168.1.8"],

  // Keep Turbopack using the current project directory.
  turbopack: {
    root: process.cwd(),
  },

  // Cache Components = Partial Prerendering in Next.js 16.
  // The static shell of each page is sent instantly; anything that reads the session,
  // the database or the URL must sit inside <Suspense> and streams in afterwards.
  // Turn this on only together with the page changes, because `next build` fails
  // on pages that still use `export const dynamic = "force-dynamic"`.
  cacheComponents: true,

  // Configure Next.js image optimization.
  images: {
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;