# syntax=docker/dockerfile:1.7
# Notifier worker — multi-stage. Pure JS, no native deps.

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

RUN pnpm --filter @familia/service-notifier... build

RUN pnpm --filter @familia/service-notifier deploy --prod /deploy

# ───────────────────────── runtime ─────────────────────────
FROM base AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tini \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /deploy ./

ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps"

USER node

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","dist/index.js"]
