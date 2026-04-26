# syntax=docker/dockerfile:1.7
# Multi-stage build for the FAMILIA API service.
# pnpm + workspace-aware deploy: only ship what the API needs.

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /repo
# Copy workspace metadata for efficient layer caching.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @familia/api... build

# Produce a standalone deploy folder with hoisted runtime deps.
RUN pnpm --filter @familia/api deploy --prod /deploy

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl tini && rm -rf /var/lib/apt/lists/*
COPY --from=build /deploy ./
EXPOSE 3000
USER node
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:3000/health/live || exit 1
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","dist/main.js"]
