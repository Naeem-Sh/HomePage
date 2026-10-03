# ==============================================================================
# Multi-Stage Production Dockerfile for Portal Shiraz / Homelab Dashboard
# Fully Self-Hosted, Air-Gapped Intranet Production-Grade Container
# ==============================================================================

# Stage 1: Build Frontend and Server Bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Install system build dependencies
RUN apk add --no-cache libc6-compat

# Copy package manifests first for efficient Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (devDependencies needed for Vite & TypeScript build)
RUN if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

# Copy source code and configuration files
COPY . .

# Build Vite frontend assets and bundle the Express production server
RUN npm run build

# Prune devDependencies to keep runtime dependencies lean
RUN npm prune --omit=dev

# ==============================================================================
# Stage 2: Minimal Air-Gapped Production Runtime
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment variables and timezone
ENV NODE_ENV=production \
    PORT=4500 \
    TZ=Asia/Tehran \
    DATA_DIR=/app/data

# Install tini init process, wget for internal health check, and tzdata for local time
RUN apk add --no-cache tini wget tzdata && \
    cp /usr/share/zoneinfo/Asia/Tehran /etc/localtime && \
    echo "Asia/Tehran" > /etc/timezone

# Create application data and uploads directories
RUN mkdir -p /app/data /app/data/uploads /app/data/backups

# Copy production dependencies and compiled bundles from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Ensure non-root node user ownership of application and data directories
RUN chown -R node:node /app

# Expose default HTTP port
EXPOSE 4500

# Container healthcheck ensuring internal server responds on /healthz (zero external networking)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:4500/healthz || exit 1

# Switch to standard non-root node user for security
USER node

# Use tini as PID 1 to handle POSIX signals (SIGTERM/SIGINT) and zombie process reaping
ENTRYPOINT ["/sbin/tini", "--"]

# Run the standalone bundled Express production server
CMD ["node", "dist/server.cjs"]
