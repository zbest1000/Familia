# syntax=docker/dockerfile:1.7
# Web app — Next 14 with output: 'standalone'.
#
# Stage 1 (builder): full pnpm + workspace install, then `next build`
# produces .next/standalone/ which is a self-contained Node server with
# only the runtime deps Next/React actually used (no dev deps, no
# unused workspace packages).
#
# Stage 2 (runtime): tiny node-slim image with the standalone subtree.

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# ───────────────────────── builder ─────────────────────────
FROM base AS build
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages ./packages
COPY services ./services
COPY tools ./tools

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy web source after install so source changes don't bust the deps layer
COPY apps/web ./apps/web

# Build workspace packages the web depends on, then web itself
RUN pnpm --filter @familia/web... build

# ───────────────────────── runtime ─────────────────────────
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tini \
  && rm -rf /var/lib/apt/lists/*

# Standalone output bundles a minimal node_modules tree alongside server.js.
# In a monorepo, the standalone subtree is rooted at .next/standalone/
# and contains apps/web/server.js + the trimmed node_modules.
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
# apps/web/public/ doesn't exist yet — when it does, add:
#   COPY --from=build /repo/apps/web/public ./apps/web/public

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0

EXPOSE 3001
USER node

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:3001/ || exit 1

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","apps/web/server.js"]
