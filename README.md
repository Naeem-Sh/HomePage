# Homelab Dashboard & Service Launcher (LinxDash)

[![Docker Build](https://img.shields.io/badge/docker-ready-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/react-19.0-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/tailwind-v4.1-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A modern, high-performance, and privacy-focused self-hosted homepage and application launcher designed for homelabs, home servers, and Linux enthusiasts. 

LinxDash combines a refined glassmorphic interface with lightweight zero-database persistence, robust role-based access control (RBAC), and 60+ native homelab icons.

---

## Highlights & Features

- 🌐 **Instant Public Homepage**: Guest visitors landing on the root URL see public services immediately without an authentication wall.
- 🔒 **Role-Based Access Control (RBAC)**:
  - **Public Visitors**: Unauthenticated guests access only applications marked as public.
  - **Private Users**: Authenticated users access their personal and authorized private services.
  - **Administrators**: Full control over service registrations, category hierarchies, user management, and portal branding.
- 💾 **Persistent & Zero-Maintenance Storage**:
  - Uses an atomic file-based JSON persistence engine.
  - No external database (PostgreSQL, MongoDB, etc.) required.
  - All configurations, uploaded icons, wallpapers, and backups reside in a single persistent volume (`/app/data`), completely decoupled from container life cycles.
- 🎨 **Modern Glassmorphic UI**:
  - Balanced typography with fluid responsive layouts (Grid & List views).
  - High-contrast dark and light modes with custom accent palettes.
  - Live analog and digital clock with customizable display modes.
- 📦 **60+ Built-In Homelab Icons**:
  - Native vector icons for Proxmox, Portainer, Docker, Jellyfin, Plex, Nextcloud, Home Assistant, TrueNAS, Pi-hole, WireGuard, pfSense, AdGuard, Grafana, and more.
  - Integrated custom upload for SVGs (with automated security sanitization stripping scripts and XSS vectors), PNGs, and WebP images.
- 🗂️ **Local Share & UNC Path Helper**:
  - Dedicated smart handler for `\\server\share`, `smb://`, and `file://` targets with 1-click clipboard copying and terminal mount helpers.
- 🔄 **Disaster Recovery & Multi-Format Backups**:
  - 1-click full ZIP snapshots containing `database.json`, individual model JSONs, an Excel sheet (`homelab-data.xlsx`), and uploaded files.
  - Instant one-click restore with schema validation.
- 🐳 **Production Docker Standards**:
  - Multi-stage minimal Alpine build (`node:22-alpine`).
  - Runs as an unprivileged non-root user (`USER node`).
  - Built-in container health check.
  - Graceful shutdown signal handling (`SIGTERM` / `SIGINT`).

---

## Storage & Data Persistence (Why Data Survives Image Deletions)

In Docker, data written directly inside a container is lost when the container is deleted. To guarantee that **your data is never erased when removing, updating, or pulling new container images**, LinxDash consolidates all mutable state into a single volume mount point: `/app/data`.

```
/app/data/                    <--- Mount this directory to a Docker Volume or Host Folder
├── database.json             <--- Core state: applications, categories, users, settings, audit logs
├── visits.json               <--- Analytics and visit counters
├── uploads/                  <--- Custom icons, portal logos, custom backgrounds, and PDF guides
│   └── icons/
└── backups/                  <--- Auto and manual .ZIP snapshots
```

As long as `/app/data` is mounted to a **Docker Named Volume** or a **Host Directory Bind Mount**, you can run `docker rm`, `docker rmi`, or pull new image tags without losing a single byte.

---

## Quick Start with Docker

### Option 1: Docker Compose (Recommended)

1. Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  homelab-dashboard:
    image: homelab-dashboard:latest
    # Or build locally:
    # build: .
    container_name: homelab-dashboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATA_DIR=/app/data
      - JWT_SECRET=replace_with_a_secure_random_string_in_production
    volumes:
      # Named volume: persists your database, uploads, and backups safely
      - homelab_data:/app/data

      # Alternative: Host directory bind mount
      # - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/public/config"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s

volumes:
  homelab_data:
    driver: local
```

2. Start the container in detached mode:

```bash
docker compose up -d
```

3. Open your browser at `http://localhost:3000`. On first launch, follow the on-screen prompt or use the admin login to start adding categories and services.

---

### Option 2: Docker CLI (`docker run`)

Run LinxDash with a named volume:

```bash
# 1. Create a persistent Docker volume
docker volume create homelab_data

# 2. Run the container attached to the volume
docker run -d \
  --name homelab-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET="your-super-secret-jwt-token" \
  -v homelab_data:/app/data \
  homelab-dashboard:latest
```

*To use a local folder on your host machine instead of a named volume:*
```bash
docker run -d \
  --name homelab-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  homelab-dashboard:latest
```

---

## How to Upgrade Without Data Loss

When a new version or image is released, upgrade seamlessly with zero data loss:

```bash
# Pull the latest image
docker compose pull

# Recreate the container with existing persistent volume
docker compose up -d
```

Because your data is stored in the volume `homelab_data`, the old container and old image are discarded, and the new container starts with your existing applications, users, and uploaded files.

---

## Configuration & Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port the server binds to |
| `NODE_ENV` | `production` | Node.js execution environment (`development` / `production`) |
| `DATA_DIR` | `/app/data` | Path to persistent storage directory for data, uploads, and backups |
| `JWT_SECRET` | *(auto-generated)* | Cryptographic key used to sign and verify user session tokens |
| `INITIAL_ADMIN_USER` | `admin` | Initial admin username created if database is empty on first boot |
| `INITIAL_ADMIN_PASSWORD` | `admin` | Initial admin password created if database is empty on first boot |
| `UPLOADS_DIR` | `$DATA_DIR/uploads` | Optional custom path for uploaded images and attachments |
| `BACKUPS_DIR` | `$DATA_DIR/backups` | Optional custom path for backup archive files |

---

## Reverse Proxy Examples

### Nginx

```nginx
server {
    listen 80;
    server_name dashboard.homelab.local;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Traefik

```yaml
services:
  homelab-dashboard:
    image: homelab-dashboard:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`dashboard.homelab.local`)"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=myresolver"
      - "traefik.http.services.dashboard.loadbalancer.server.port=3000"
```

### Caddy

```caddy
dashboard.homelab.local {
    reverse_proxy 127.0.0.1:3000
}
```

---

## Local Development Setup

If you wish to contribute or run LinxDash directly from source:

```bash
# 1. Clone repository
git clone https://github.com/your-username/homelab-dashboard.git
cd homelab-dashboard

# 2. Install dependencies
npm install

# 3. Start development server (with tsx and Vite middleware)
npm run dev

# 4. Build production bundle (Vite + esbuild CJS server)
npm run build

# 5. Start production build
npm start
```

---

## Security Architecture

1. **Password Hashing**: Passwords are encrypted with `bcrypt` (10 salt rounds) before persistence.
2. **Brute-Force Mitigation**: Login endpoints enforce request throttling and rate limiting.
3. **SVG Sanitization**: All uploaded vector icons pass through an aggressive DOM sanitizer stripping `<script>`, inline event handlers (`onload`, `onerror`), and `javascript:` URIs.
4. **ETag & Caching**: Public configuration and static asset routes provide HTTP 304 caching and immutable cache-control headers.
5. **Non-Root Execution**: The container strictly executes as unprivileged user `node:node`.

---

## License

This project is licensed under the [MIT License](LICENSE).
