import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  allowedDevOrigins: ["192.168.1.8"],

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;