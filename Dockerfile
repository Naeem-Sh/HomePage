# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# --- Production Image ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled frontend and bundled server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create volumes for persistent data and uploads
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app

USER node

EXPOSE 3000

VOLUME ["/app/data", "/app/uploads"]

CMD ["npm", "start"]
