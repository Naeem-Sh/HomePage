# ==============================================================================
# Multi-Stage Production Dockerfile for Portal Shiraz / Homelab Dashboard
# Optimized for minimal image size, security, and fast build times
# ==============================================================================

# Stage 1: Build Frontend and Server Bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies if required for build
RUN apk add --no-cache libc6-compat

# Copy package manifests first for efficient layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for Vite & TypeScript build)
RUN npm install

# Copy source code and configuration files
COPY . .

# Build Vite frontend assets and bundle the Express production server
RUN npm run build

# Prune devDependencies to keep runtime dependencies lean
RUN npm prune --omit=dev

# ==============================================================================
# Stage 2: Minimal Production Runtime
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    PORT=4500 \
    DATA_DIR=/app/data

# Install curl/wget for healthcheck
RUN apk add --no-cache wget

# Create application data and uploads directories
RUN mkdir -p /app/data /app/data/uploads /app/data/backups

# Copy production dependencies and bundle from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Optional: Ensure non-root ownership if required, keeping data dir writeable
RUN chown -R node:node /app

# Expose default HTTP port
EXPOSE 4500

# Container healthcheck ensuring server responds on /api/public/config
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:4500/api/public/config || exit 1

# Switch to standard non-root node user
USER node

# Run the standalone bundled Express server
CMD ["node", "dist/server.cjs"]
