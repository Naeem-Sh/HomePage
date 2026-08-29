# Linux Homepage & Service Launcher (LinxDash)

A modern, fast, and minimal self-hosted Linux homepage and service launcher. Built for home labs, homelabbers, Linux server administrators, and local networks.

---

## Key Features

- **Public Homepage Out-of-the-Box**: Root URL immediately renders the public homepage with zero authentication barrier. Shows only applications flagged as public.
- **Glassmorphic Modern UI**: Responsive layout with subtle frosted glass effects, accent glow on hover, high-contrast dark/light mode toggle, and smooth motion.
- **Live Analog & Digital Clock**: Configurable clock displaying real-time hours, minutes, seconds hands, and localized date.
- **50+ Built-In Linux & Homelab Icons**: Native high-definition vector icons for Docker, Proxmox, Jellyfin, Plex, Nextcloud, Home Assistant, WireGuard, Pi-hole, Grafana, Portainer, TrueNAS, and more.
- **Custom Icon & Logo Upload**: Support for uploading transparent PNG, SVG (with automatic security sanitization stripping `<script>` and `on*` vectors), WebP, and JPG logos.
- **UNC & Local Storage Helper**: Specialized handling for local `\\server\share`, `smb://`, and `file://` resources with a dedicated destination helper modal explaining browser security policies and providing 1-click path copying and terminal commands.
- **Role-Based Access Control (RBAC)**:
  - **Public**: Unauthenticated visitors only view public services.
  - **Private User**: Authenticated users view both public and authorized private services.
  - **Administrator**: Complete control over categories, applications, users, appearance, and system backups.
- **Disaster Recovery & Portability**: 1-click JSON backup export and restore directly from the browser — no manual config file editing required.
- **Production Container Ready**: Zero-fuss `Dockerfile` and `docker-compose.yml` with persistent storage volumes.
- **Built-In Automated Test Suite**: Built-in verification tests covering authentication separation, password hashing, and SVG XSS filtering.

---

## Quick Start with Docker

### Option 1: Docker Compose (Recommended)

1. Clone or copy your project files.
2. Launch the container:
   ```bash
   docker compose up -d
   ```
3. Open `http://localhost:3000` in your web browser.
4. On first load, complete the setup wizard to create your primary administrator account.

### Option 2: Docker Run

```bash
docker run -d \
  --name linxdash \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  linxdash:latest
```

---

## Reverse Proxy Configurations

### Nginx

```nginx
server {
    listen 80;
    server_name dashboard.lan;

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

### Traefik (Docker Labels)

```yaml
services:
  linxdash:
    image: linxdash:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.linxdash.rule=Host(`dashboard.homelab.local`)"
      - "traefik.http.routers.linxdash.entrypoints=websecure"
      - "traefik.http.routers.linxdash.tls.certresolver=myresolver"
```

### Caddy

```caddy
dashboard.homelab.local {
    reverse_proxy 127.0.0.1:3000
}
```

---

## Security Architecture

1. **Password Hashing**: Passwords are encrypted with `bcrypt` (10 rounds) before persistence.
2. **Rate Limiting**: Brute-force protection limits failed login attempts (5 attempts per minute per IP).
3. **SVG Sanitization**: All uploaded SVG files are sanitized to strip inline JavaScript, event listeners, and dangerous URI schemes.
4. **ETag & Caching**: Public configuration requests leverage ETags (`W/"<hash>"`) and return HTTP 304 Not Modified when configuration has not changed.
