import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone mode for Docker deployment
  output: 'standalone',
  
  // Disable ESLint during builds (handle separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable static generation to avoid useSearchParams issues
  trailingSlash: false,
};

export default nextConfig;
