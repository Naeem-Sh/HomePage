# Portal Shiraz (Homelab & Enterprise Dashboard)

A modern, high-performance, and air-gapped web portal designed for unified navigation, service management, and homelab/intranet application routing. Built with React 19, TypeScript, Tailwind CSS, and a lightweight standalone Express backend.

---

## 🔒 Air-Gapped & Offline Runtime Guarantee

- **Zero Outbound Runtime Network Calls:** The container operates in completely isolated intranet environments without external DNS resolution or public internet access.
- **Locally Bundled Assets:** All typography (Vazirmatn fonts), icons (Lucide React vector suite), styles, and client assets are compiled and bundled directly into static artifacts.
- **Self-Contained Probes:** Health checks (`/healthz`) query internal loopback addresses with zero third-party dependencies.

---

## ⚡ Quick Start (Single-Command Launch)

Deploy the production container with persistent storage and automatic healthchecks:

```bash
docker compose up -d --build
```

Access the web portal in your browser:
👉 **http://localhost:4500**

---

## 🔑 Default Credentials

- **Username:** `admin`
- **Password:** `123`
- **Access Point:** Click the lock icon in the top header or navigate to the admin dashboard.

---

## 🌐 Port & Network Mapping

| Port (Host:Container) | Protocol | Purpose |
| :--- | :--- | :--- |
| `4500:4500` | HTTP / TCP | Application web interface and REST API |

To change the exposed port, modify the `ports` mapping in `docker-compose.yml` or set `PORT` in your `.env` file.

---

## 💾 Persistent Storage & Volume Mapping

All dynamic configuration, databases, uploads, and backups are stored outside the container on the host filesystem:

```yaml
volumes:
  - ./data:/app/data
  - /etc/localtime:/etc/localtime:ro
```

- `./data/database.json`: Applications, categories, users, and layout configuration.
- `./data/visits.json`: Daily and active telemetry visit counters.
- `./data/uploads/`: Uploaded documents, logos, icons, and wallpapers.
- `./data/backups/`: Automated and manual ZIP database backups.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` to customize settings:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `4500` | HTTP listener port |
| `NODE_ENV` | `production` | Node runtime environment |
| `TZ` | `Asia/Tehran` | Timezone for system logs and audit trail |
| `JWT_SECRET` | `shiraz_portal_jwt_secret_token_2026` | Token signing secret for sessions |
| `INITIAL_ADMIN_USERNAME` | `admin` | Bootstrap admin username |
| `INITIAL_ADMIN_PASSWORD` | `123` | Bootstrap admin password |
| `RESET_ADMIN_PASSWORD` | `false` | Force reset admin password on restart if `true` |
| `DATA_DIR` | `/app/data` | Standardized database and assets root directory |

---

## 🛠️ Local Development (Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start development server with live reload
npm run dev

# 3. Static type check
npm run lint

# 4. Production build
npm run build

# 5. Start compiled production server
npm start
```

---

## 🩺 Health Check & Monitoring

- **Endpoint:** `GET /healthz` or `GET /api/health`
- **Response:** `200 OK` with JSON payload `{ "status": "ok", "timestamp": "..." }`
- **Docker Healthcheck:** Automatically executed every 30 seconds via internal `wget`.

---

## 📄 License

MIT License. Developed for enterprise intranet, homelab, and air-gapped organizational portal management.
