import type { NextConfig } from "next";

const nextConfig: NextConfig = {
devIndicators: false,

allowedDevOrigins: ["192.168.1.8"],

turbopack: {
root: process.cwd(),
},

cacheComponents: true,

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
{
protocol: "https",
hostname: "bkhdjnfjdtmueuyvamzo.supabase.co",
pathname: "/storage/v1/object/public/Avatars/**",
},
],
},
};

export default nextConfig;
