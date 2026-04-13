# ---- Dev ----
FROM node:22-alpine AS dev

RUN corepack enable

WORKDIR /app

# Workspace manifests — build context is repo root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/

# Install only API deps
RUN pnpm install --frozen-lockfile --filter api

# Source is mounted as a volume at runtime
WORKDIR /app/api
EXPOSE 3030

CMD ["pnpm", "run", "start:dev"]

# ---- Builder ----
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/
RUN pnpm install --frozen-lockfile --filter api

COPY api/ ./api/
RUN pnpm --filter api run build

# ---- Production ----
FROM node:22-alpine AS production

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/
RUN pnpm install --frozen-lockfile --filter api --prod

COPY --from=builder /app/api/dist ./api/dist

# Cloud Run injects PORT automatically
WORKDIR /app/api
EXPOSE 8080

CMD ["node", "dist/main"]
