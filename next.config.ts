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
  // After `npm run media:upload-visuals`, lesson images are served from the public R2 bucket.
  async redirects() {
    const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
    if (process.env.VISUALS_ON_R2 !== "true" || !base) return [];
    return [{ source: "/visuals/:path*", destination: `${base}/visuals/:path*`, permanent: false }];
  },
};

export default nextConfig;
