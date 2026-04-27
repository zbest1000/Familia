# syntax=docker/dockerfile:1.7
# API service — multi-stage build.
#
# Stage 1 (builder): Node + pnpm, install all workspace deps so workspace:*
# links resolve, run prisma generate (which downloads native query engines),
# build the API and its workspace dependencies. Then `pnpm deploy` produces
# a self-contained subtree with only what the API needs at runtime.
#
# Stage 2 (runtime): node:20-bookworm-slim with the deploy bundle plus
# OpenSSL for prisma's runtime engines. Migrations run as a separate
# K8s Job (deploy/k8s/migrate-job.yaml), not at boot — the container
# boots straight into the Nest server.

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# ───────────────────────── builder ─────────────────────────
FROM base AS build
WORKDIR /repo

# Workspace metadata layer (cached unless lockfile or workspace shape changes)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages ./packages
COPY services ./services
COPY tools ./tools

# Install with frozen lockfile so the build is reproducible
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy API source after deps so changes here don't bust the install layer
COPY apps/api ./apps/api

# Generate prisma client + native engines for the build platform
RUN pnpm --filter @familia/api prisma:generate

# Build API and its workspace deps
RUN pnpm --filter @familia/api... build

# Produce a self-contained subtree with only prod deps
RUN pnpm --filter @familia/api deploy --prod /deploy

# Re-run prisma generate inside the deploy folder so the engines end up
# at /deploy/node_modules/.prisma/client/. The post-deploy generate is
# best-effort: if the workspace already has the client built it's a no-op.
RUN cd /deploy && npx --yes prisma@5.22.0 generate --schema=prisma/schema.prisma 2>/dev/null || true

# ───────────────────────── runtime ─────────────────────────
FROM base AS runtime
WORKDIR /app

# OpenSSL for prisma engines, curl for healthcheck, tini for clean signal
# handling on pod eviction
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    tini \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /deploy ./
# Prisma schema + migrations ship so the migration Job can apply them
COPY --from=build /repo/apps/api/prisma ./prisma

ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--enable-source-maps"

EXPOSE 3000
USER node

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:3000/health/live || exit 1

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","dist/main.js"]
