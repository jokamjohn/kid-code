# ---- Dev ----
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Source is mounted as a volume at runtime
EXPOSE 3030

CMD ["npm", "run", "start:dev"]

# ---- Builder ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Production ----
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Cloud Run injects PORT automatically
EXPOSE 8080

CMD ["node", "dist/main"]
