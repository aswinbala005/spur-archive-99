# Use Node 20 Alpine for small size
FROM node:20-alpine AS base
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

# 2. Runner Stage (Production)
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
USER fastify

# Copy built artifacts and node_modules from builder
# We copy from the specific apps/backend context in builder
COPY --from=builder --chown=fastify:nodejs /app/apps/backend/dist ./dist
# We need to be careful: pnpm might hoist modules to root.
# If we copy /app/node_modules from builder (root), we get all deps.
COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/apps/backend/package.json ./

# Expose Port
EXPOSE 3000

# Start Command
CMD ["node", "dist/src/index.js"]
