# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for Homelab Portal (LinxDash)

# Stage 1: Build Frontend and Bundle Server
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for compilation
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Production Minimal Runner
FROM node:22-alpine AS runner

LABEL org.opencontainers.image.title="Homelab Dashboard & Service Launcher"
LABEL org.opencontainers.image.description="Modern, lightweight, privacy-focused dashboard and service launcher for homelabs"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled frontend assets & bundled server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Pre-create data directories and assign ownership to non-root 'node' user
RUN mkdir -p /app/data /app/data/uploads /app/data/backups && \
    chown -R node:node /app

# Declare persistent volume so data survives container deletion and image upgrades
VOLUME ["/app/data"]

# Switch to non-root user for container security
USER node

# Expose web service port
EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application directly with Node for proper SIGTERM/SIGINT signal handling
CMD ["node", "dist/server.cjs"]


