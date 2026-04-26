# syntax=docker/dockerfile:1.7
# FAMILIA web (Next.js) container. Mostly used in prod; locally we just `pnpm dev`.

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @familia/web... build

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable
COPY --from=build /repo /repo
WORKDIR /repo/apps/web
EXPOSE 3001
USER node
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3001"]
