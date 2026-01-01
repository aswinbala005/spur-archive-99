# Use Node 20 Slim (Debian-based) for glibc compatibility with onnxruntime
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Builder Stage
FROM base AS builder
WORKDIR /app

# Copy Monorepo Configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy Backend Source
COPY apps/backend ./apps/backend

# Install Dependencies (Frozen Lockfile for speed/safety)
RUN pnpm install --frozen-lockfile

# Build the Backend
WORKDIR /app/apps/backend
RUN pnpm build

# Deploy the backend to a specific directory (this purely isolates the backend + prod deps)
RUN pnpm deploy --filter=backend --prod --legacy /app/deployed

# 2. Runner Stage (Production)
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 fastify
USER fastify

# Copy the DEPLOYED application (which includes flat node_modules and built dist)
COPY --from=builder --chown=fastify:nodejs /app/deployed ./

# Expose Port
EXPOSE 3000

# Start Command
CMD ["node", "dist/src/index.js"]
