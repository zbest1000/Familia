/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 'standalone' produces a self-contained Node server in .next/standalone
  // with only the runtime deps it actually uses. The Dockerfile copies
  // that subtree (instead of node_modules) for a much smaller runtime image.
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
  // ESLint runs separately via `pnpm lint` (with the workspace import resolver
  // properly configured). Skipping during `next build` keeps Next from
  // re-running ESLint with its own resolver, which can't see workspace links.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // We import workspace packages directly (TS source) — Next must transpile them.
  transpilePackages: [
    "@familia/copy",
    "@familia/domain",
    "@familia/sdk",
    "@familia/tokens",
    "@familia/ui-web",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
