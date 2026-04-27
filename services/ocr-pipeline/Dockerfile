# OCR pipeline worker — multi-stage build.
#
# Stage 1 (builder): full Debian + cairo/pango/jpeg/gif/rsvg native deps so
# node-canvas builds. We copy the entire monorepo workspace to honour
# pnpm workspace links, build, then prune to a deployable subtree via
# `pnpm deploy`.
#
# Stage 2 (runtime): slim Debian with only the runtime native libs (no
# headers, no compiler) and the deployed subtree. Node 20 LTS.

# ───────────────────────── builder ─────────────────────────
FROM node:20-bookworm AS builder

# canvas (and sharp, if we add it later) need these native libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    pkg-config \
    python3 \
  && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# Copy lockfile + workspace manifest first for better layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
COPY services ./services
COPY tools ./tools

# Install all workspace deps (we need workspace:* links resolved before build)
RUN pnpm install --frozen-lockfile

# Build the OCR worker + its workspace deps
RUN pnpm --filter @familia/service-ocr-pipeline... build

# Produce a self-contained deploy directory with only what the worker needs
RUN pnpm --filter @familia/service-ocr-pipeline deploy --prod --legacy /deploy

# ───────────────────────── runtime ─────────────────────────
FROM node:20-bookworm-slim AS runtime

# Runtime native libs only (no -dev packages, no compiler)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    librsvg2-2 \
    libpixman-1-0 \
    ca-certificates \
    tini \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pull only the deploy bundle from the builder
COPY --from=builder /deploy /app

# Run as non-root
RUN groupadd -r familia && useradd -r -g familia -s /bin/false familia \
  && chown -R familia:familia /app
USER familia

ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps"

# tini PID 1 → clean signal handling for SIGTERM during pod eviction
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
