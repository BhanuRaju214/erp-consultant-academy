import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows a verification build (e.g. NEXT_DIST_DIR=.next-verify) while `next dev` is using .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // PGlite ships WASM + data files that must be loaded from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
