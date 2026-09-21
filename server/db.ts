import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import AdmZip from 'adm-zip';
import * as XLSX from 'xlsx';
import { DatabaseSchema, User, Category, Application, SystemSettings, AuditLog, BackupItem, ActivityStats } from './types';

/**
 * Resolves the persistent data storage directory:
 * 1. Explicit DATA_DIR environment variable (e.g. DATA_DIR=/opt/homelab-data or /var/lib/homelab-data)
 * 2. Local configuration file: .datadir or data-dir.conf
 * 3. Default fallback: ./data in the current working directory
 */
function resolveDataDir(): string {
  if (process.env.DATA_DIR && process.env.DATA_DIR.trim()) {
    return path.resolve(process.env.DATA_DIR.trim());
  }

  const configFiles = [
    path.join(process.cwd(), '.datadir'),
    path.join(process.cwd(), 'data-dir.conf')
  ];

  for (const cf of configFiles) {
    if (fs.existsSync(cf)) {
      try {
        const line = fs.readFileSync(cf, 'utf-8').trim().split('\n')[0].trim();
        if (line && !line.startsWith('#')) {
          return path.resolve(line);
        }
      } catch {
        // ignore error and try next
      }
    }
  }

  return path.join(process.cwd(), 'data');
}

const DATA_DIR = resolveDataDir();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads');
const BACKUPS_DIR = process.env.BACKUPS_DIR || path.join(DATA_DIR, 'backups');
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'database.json');
const VISITS_FILE = process.env.VISITS_FILE || path.join(DATA_DIR, 'visits.json');

// Ensure target directories exist safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.error(`[Storage Warning] Failed to initialize storage directory at ${DATA_DIR}:`, dirErr);
}

// Auto-migration: If DATA_DIR is an external persistent path and is fresh,
// seamlessly migrate data & uploads from the local project ./data folder!
const localProjectDataDir = path.join(process.cwd(), 'data');
if (path.resolve(DATA_DIR) !== path.resolve(localProjectDataDir)) {
  try {
    const localDbFile = path.join(localProjectDataDir, 'database.json');
    if (!fs.existsSync(DB_FILE) && fs.existsSync(localDbFile)) {
      console.info(`[Storage Migration] Auto-migrating existing database from ${localDbFile} -> ${DB_FILE}`);
      fs.copyFileSync(localDbFile, DB_FILE);
    }

    const localUploadsDir = path.join(localProjectDataDir, 'uploads');
    if (fs.existsSync(localUploadsDir)) {
      const copyRecursive = (src: string, dest: string) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else if (!fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      copyRecursive(localUploadsDir, UPLOADS_DIR);
    }
  } catch (migErr) {
    console.error('[Storage Migration Warning] Could not auto-migrate local data:', migErr);
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateVersionHash(): string {
  return crypto.randomBytes(8).toString('hex');
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-infra',
    name: 'زیرساخت و سرورها',
    icon: 'Server',
    sortOrder: 1,
    description: 'مجازی‌سازی، هاست‌ها و پلتفرم‌های کانتینری داکر'
  },
  {
    id: 'cat-monitoring',
    name: 'مانیتورینگ و وضعیت',
    icon: 'Activity',
    sortOrder: 2,
    description: 'تله‌متری سیستم، تحلیل مصرف منابع و هشدارهای سرور'
  },
  {
    id: 'cat-storage',
    name: 'ذخیره‌سازی و اسناد',
    icon: 'HardDrive',
    sortOrder: 3,
    description: 'فضای ابری، پوشه‌های اشتراکی شبکه و فایل‌ها'
  },
  {
    id: 'cat-media',
    name: 'رسانه و مدیا',
    icon: 'Film',
    sortOrder: 4,
    description: 'سرویس‌های استریم مدیا، موزیک و پشتیبان‌گیری عکس'
  },
  {
    id: 'cat-security',
    name: 'شبکه و امنیت',
    icon: 'Shield',
    sortOrder: 5,
    description: 'مدیریت DNS، گذرگاه‌های VPN و امنیت شبکه'
  },
  {
    id: 'cat-dev',
    name: 'ابزارهای توسعه و کد',
    icon: 'Terminal',
    sortOrder: 6,
    description: 'مخازن سورس کد، ادیتورهای ابری و ابزارهای خط فرمان'
  }
];

const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: 'app-proxmox',
    name: 'Proxmox VE',
    description: 'Virtualization management and cluster control',
    url: 'https://pve.local:8006',
    categoryId: 'cat-infra',
    icon: 'proxmox',
    isPublic: true,
    isEnabled: true,
    sortOrder: 1,
    accentColor: '#E57000',
    openInNewTab: true,
    tags: ['virtualization', 'pve', 'cluster']
  },
  {
    id: 'app-portainer',
    name: 'Portainer',
    description: 'Container management and Docker Compose stacks',
    url: 'http://docker.local:9000',
    categoryId: 'cat-infra',
    icon: 'portainer',
    isPublic: true,
    isEnabled: true,
    sortOrder: 2,
    accentColor: '#13BEF9',
    openInNewTab: true,
    tags: ['docker', 'containers']
  },
  {
    id: 'app-docker',
    name: 'Docker Engine',
    description: 'Container daemon and application runtimes',
    url: 'http://localhost:2375',
    categoryId: 'cat-infra',
    icon: 'docker',
    isPublic: true,
    isEnabled: true,
    sortOrder: 3,
    accentColor: '#2496ED',
    openInNewTab: true,
    tags: ['containers', 'daemon']
  },
  {
    id: 'app-grafana',
    name: 'Grafana',
    description: 'Operational dashboards and observability metrics',
    url: 'http://grafana.local:3000',
    categoryId: 'cat-monitoring',
    icon: 'grafana',
    isPublic: true,
    isEnabled: true,
    sortOrder: 1,
    accentColor: '#F46800',
    openInNewTab: true,
    tags: ['monitoring', 'metrics', 'dashboards']
  },
  {
    id: 'app-prometheus',
    name: 'Prometheus',
    description: 'Time-series monitoring and alerting toolkit',
    url: 'http://prometheus.local:9090',
    categoryId: 'cat-monitoring',
    icon: 'prometheus',
    isPublic: true,
    isEnabled: true,
    sortOrder: 2,
    accentColor: '#E6522C',
    openInNewTab: true,
    tags: ['metrics', 'telemetry']
  },
  {
    id: 'app-uptime-kuma',
    name: 'Uptime Kuma',
    description: 'Self-hosted service monitoring and status pages',
    url: 'http://status.local:3001',
    categoryId: 'cat-monitoring',
    icon: 'uptime-kuma',
    isPublic: true,
    isEnabled: true,
    sortOrder: 3,
    accentColor: '#5CDD8B',
    openInNewTab: true,
    tags: ['status', 'uptime', 'health']
  },
  {
    id: 'app-nextcloud',
    name: 'Nextcloud Hub',
    description: 'Collaborative file sync, docs, and calendar',
    url: 'https://cloud.local',
    categoryId: 'cat-storage',
    icon: 'nextcloud',
    isPublic: true,
    isEnabled: true,
    sortOrder: 1,
    accentColor: '#0082C9',
    openInNewTab: true,
    tags: ['storage', 'files', 'cloud']
  },
  {
    id: 'app-truenas',
    name: 'TrueNAS Scale',
    description: 'ZFS enterprise storage and network datasets',
    url: 'https://truenas.local',
    categoryId: 'cat-storage',
    icon: 'truenas',
    isPublic: true,
    isEnabled: true,
    sortOrder: 2,
    accentColor: '#0095D5',
    openInNewTab: true,
    tags: ['nas', 'storage', 'zfs']
  },
  {
    id: 'app-unc-share',
    name: 'Engineering Documents',
    description: 'LAN file repository and architecture manuals',
    url: '\\\\storage\\shared\\documents\\manual.pdf',
    categoryId: 'cat-storage',
    icon: 'FileText',
    isPublic: true,
    isEnabled: true,
    sortOrder: 3,
    accentColor: '#6366F1',
    openInNewTab: false,
    tags: ['unc', 'smb', 'share', 'pdf']
  },
  {
    id: 'app-plex',
    name: 'Plex Media Server',
    description: 'Personal media library, transcoding, and streaming center',
    url: 'http://plex.local:32400/web',
    categoryId: 'cat-media',
    icon: 'plex',
    isPublic: true,
    isEnabled: true,
    sortOrder: 1,
    accentColor: '#E5A00D',
    openInNewTab: true,
    tags: ['media', 'streaming', 'plex', 'movies']
  },
  {
    id: 'app-jellyfin',
    name: 'Jellyfin',
    description: 'Open source media server for movies, shows, and music',
    url: 'http://jellyfin.local:8096',
    categoryId: 'cat-media',
    icon: 'jellyfin',
    isPublic: true,
    isEnabled: true,
    sortOrder: 2,
    accentColor: '#AA5CC3',
    openInNewTab: true,
    tags: ['media', 'streaming', 'video']
  },
  {
    id: 'app-immich',
    name: 'Immich',
    description: 'Self-hosted high performance photo & video backup',
    url: 'http://photos.local:2283',
    categoryId: 'cat-media',
    icon: 'immich',
    isPublic: true,
    isEnabled: true,
    sortOrder: 3,
    accentColor: '#4255FF',
    openInNewTab: true,
    tags: ['photos', 'backup', 'ai']
  },
  {
    id: 'app-adguard',
    name: 'AdGuard Home',
    description: 'Network-wide privacy protection and encrypted DNS resolver',
    url: 'http://adguard.local:80',
    categoryId: 'cat-security',
    icon: 'adguard',
    isPublic: true,
    isEnabled: true,
    sortOrder: 1,
    accentColor: '#68BC71',
    openInNewTab: true,
    tags: ['dns', 'adblock', 'privacy', 'security']
  },
  {
    id: 'app-home-assistant',
    name: 'Home Assistant',
    description: 'Home automation, sensor automations, and device bridge',
    url: 'http://homeassistant.local:8123',
    categoryId: 'cat-security',
    icon: 'home-assistant',
    isPublic: true,
    isEnabled: true,
    sortOrder: 2,
    accentColor: '#03A9F4',
    openInNewTab: true,
    tags: ['iot', 'smarthome']
  },
  {
    id: 'app-pihole',
    name: 'Pi-hole DNS',
    description: 'Network-wide ad-blocking and local DNS resolution',
    url: 'http://pihole.local/admin',
    categoryId: 'cat-security',
    icon: 'pihole',
    isPublic: true,
    isEnabled: true,
    sortOrder: 3,
    accentColor: '#F60D1A',
    openInNewTab: true,
    tags: ['dns', 'adblock', 'security']
  },
  {
    id: 'app-vaultwarden',
    name: 'Vaultwarden',
    description: 'Lightweight Bitwarden password vault sync service',
    url: 'https://vault.local',
    categoryId: 'cat-security',
    icon: 'vaultwarden',
    isPublic: false, // Private by default!
    isEnabled: true,
    sortOrder: 3,
    accentColor: '#175DDC',
    openInNewTab: true,
    tags: ['passwords', 'security', 'private'],
    allowedRoles: ['admin']
  },
  {
    id: 'app-wireguard',
    name: 'WireGuard Gateway',
    description: 'Fast, modern, encrypted VPN tunnel mesh',
    url: 'http://wireguard.local:51821',
    categoryId: 'cat-security',
    icon: 'wireguard',
    isPublic: false, // Private by default!
    isEnabled: true,
    sortOrder: 4,
    accentColor: '#88171A',
    openInNewTab: true,
    tags: ['vpn', 'networking', 'private'],
    allowedRoles: ['admin']
  },
  {
    id: 'app-gitea',
    name: 'Gitea / Forgejo',
    description: 'Git code hosting, continuous integration, and packages',
    url: 'http://git.local:3000',
    categoryId: 'cat-dev',
    icon: 'gitea',
    isPublic: true,
    isEnabled: true,
    sortOrder: 1,
    accentColor: '#609926',
    openInNewTab: true,
    tags: ['git', 'code', 'cicd']
  },
  {
    id: 'app-vscode',
    name: 'VS Code Server',
    description: 'Browser-accessible IDE and remote Linux terminal',
    url: 'http://code.local:8080',
    categoryId: 'cat-dev',
    icon: 'vscode',
    isPublic: false, // Private by default!
    isEnabled: true,
    sortOrder: 2,
    accentColor: '#007ACC',
    openInNewTab: true,
    tags: ['ide', 'editor', 'private'],
    allowedRoles: ['admin']
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  title: 'Linux Services Hub',
  subtitle: 'Self-Hosted Network Resources & Applications',
  logoUrl: null,
  defaultTheme: 'light',
  clockType: 'analog',
  showDate: true,
  showSeconds: true,
  gridColumns: 4,
  publicSearch: true,
  customFooterText: 'Developed by : N.Shaaeri',
  showTelemetryBar: true,
  telemetryPosition: 'top',
  configVersion: generateVersionHash()
};

class DatabaseService {
  private schema: DatabaseSchema;
  private sessions = new Map<string, { lastSeen: number }>();
  private dailyVisits: Record<string, number> = {};

  constructor() {
    this.schema = this.loadDatabase();
    this.loadVisits();
    this.ensureDefaultUsers();
  }

  private loadVisits() {
    try {
      if (fs.existsSync(VISITS_FILE)) {
        const raw = fs.readFileSync(VISITS_FILE, 'utf-8');
        this.dailyVisits = JSON.parse(raw);
      }
    } catch {
      this.dailyVisits = {};
    }
  }

  private saveVisits() {
    try {
      fs.writeFileSync(VISITS_FILE, JSON.stringify(this.dailyVisits, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to save visits:', e);
    }
  }

  public trackVisit(clientId = 'default'): ActivityStats {
    const today = new Date().toISOString().slice(0, 10);
    const now = Date.now();

    const prev = this.sessions.get(clientId);
    // If not seen within last 15 minutes, increment today's visits
    if (!prev || now - prev.lastSeen > 15 * 60 * 1000) {
      this.dailyVisits[today] = (this.dailyVisits[today] || 0) + 1;
      this.saveVisits();
    }
    this.sessions.set(clientId, { lastSeen: now });

    // Clean stale sessions older than 30 mins
    for (const [key, val] of this.sessions.entries()) {
      if (now - val.lastSeen > 30 * 60 * 1000) {
        this.sessions.delete(key);
      }
    }

    const activeCount = Array.from(this.sessions.values()).filter(
      (s) => now - s.lastSeen <= 15 * 60 * 1000
    ).length;

    return {
      activeUsersCount: Math.max(1, activeCount),
      todayVisits: this.dailyVisits[today] || 1
    };
  }

  public getActivityStats(): ActivityStats {
    const today = new Date().toISOString().slice(0, 10);
    const now = Date.now();
    const activeCount = Array.from(this.sessions.values()).filter(
      (s) => now - s.lastSeen <= 15 * 60 * 1000
    ).length;

    return {
      activeUsersCount: Math.max(1, activeCount),
      todayVisits: this.dailyVisits[today] || 1
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Keep an automatic .bak copy of last known good database file
        try {
          fs.writeFileSync(`${DB_FILE}.bak`, raw, 'utf-8');
        } catch {
          // ignore
        }
        return {
          users: parsed.users || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          applications: parsed.applications || DEFAULT_APPLICATIONS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          auditLogs: parsed.auditLogs || []
        };
      }
    } catch (e) {
      console.error('Error loading database file, checking backup file:', e);
    }

    // Try fallback to .bak if primary was corrupted or accidentally replaced with empty file
    try {
      const bakFile = `${DB_FILE}.bak`;
      if (fs.existsSync(bakFile)) {
        const rawBak = fs.readFileSync(bakFile, 'utf-8');
        const parsedBak = JSON.parse(rawBak);
        console.info('Successfully recovered database from .bak snapshot');
        return {
          users: parsedBak.users || [],
          categories: parsedBak.categories || DEFAULT_CATEGORIES,
          applications: parsedBak.applications || DEFAULT_APPLICATIONS,
          settings: { ...DEFAULT_SETTINGS, ...(parsedBak.settings || {}) },
          auditLogs: parsedBak.auditLogs || []
        };
      }
    } catch (bakErr) {
      console.error('Backup recovery error:', bakErr);
    }

    const initial: DatabaseSchema = {
      users: [],
      categories: DEFAULT_CATEGORIES,
      applications: DEFAULT_APPLICATIONS,
      settings: DEFAULT_SETTINGS,
      auditLogs: []
    };

    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(data: DatabaseSchema = this.schema) {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, jsonStr, 'utf-8');
      fs.renameSync(tempPath, DB_FILE);

      // Keep a redundant safety copy so an accidental file overwrite or crash never loses data
      try {
        fs.writeFileSync(`${DB_FILE}.bak`, jsonStr, 'utf-8');
      } catch {
        // non-blocking
      }
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  private ensureDefaultUsers() {
    const salt = bcrypt.genSaltSync(10);
    const envUser = (process.env.INITIAL_ADMIN_USER && process.env.INITIAL_ADMIN_USER.trim()) || 'admin';
    const envPass = process.env.INITIAL_ADMIN_PASSWORD || '123';

    // 1. Remove duplicate users with same username (case-insensitive)
    const uniqueUsers: User[] = [];
    const seen = new Set<string>();

    for (const u of this.schema.users) {
      const lower = u.username.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueUsers.push(u);
      }
    }
    this.schema.users = uniqueUsers;

    // 2. Ensure admin account exists with role: 'admin' and active status
    const adminUser = this.schema.users.find(u => u.username.toLowerCase() === envUser.toLowerCase());
    const shouldForceReset = process.env.RESET_ADMIN_PASSWORD === 'true';

    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.isActive = true;
      // Preserve existing password saved in database.json unless user has no password or explicit reset is requested
      if (!adminUser.passwordHash || shouldForceReset) {
        adminUser.passwordHash = bcrypt.hashSync(envPass, salt);
        if (shouldForceReset) {
          console.info(`[Auth] Admin password was reset via RESET_ADMIN_PASSWORD env variable.`);
        }
      }
    } else {
      this.schema.users.push({
        id: generateId(),
        username: envUser,
        passwordHash: bcrypt.hashSync(envPass, salt),
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }

    // 3. Completely purge any legacy IT staff users & roles
    this.schema.users = this.schema.users.filter(u => u.role !== ('it_staff' as any) && u.username.toLowerCase() !== 'itstaff');

    // 4. Ensure all applications have valid dashboards property (public and admin only)
    if (Array.isArray(this.schema.applications)) {
      this.schema.applications.forEach(app => {
        if (!Array.isArray(app.dashboards) || app.dashboards.length === 0) {
          app.dashboards = app.isPublic ? ['public', 'admin'] : ['admin'];
        } else {
          app.dashboards = app.dashboards.filter(d => d !== ('it_staff' as any)) as any;
          if (app.dashboards.length === 0) {
            app.dashboards = ['admin'];
          }
        }
        if (app.allowedRoles) {
          app.allowedRoles = app.allowedRoles.filter(r => r !== ('it_staff' as any)) as any;
        }
      });
    }

    this.saveDatabase();
  }

  private bumpVersion() {
    this.schema.settings.configVersion = generateVersionHash();
  }

  // --- Setup & Auth ---
  public hasAdmin(): boolean {
    return this.schema.users.some(u => u.role === 'admin' && u.isActive);
  }

  public getUsers(): User[] {
    return this.schema.users;
  }

  public getUserById(id: string): User | undefined {
    return this.schema.users.find(u => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.schema.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    this.schema.users.push(newUser);
    this.bumpVersion();
    this.saveDatabase();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.schema.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.schema.users[index] = { ...this.schema.users[index], ...updates };
    this.bumpVersion();
    this.saveDatabase();
    return this.schema.users[index];
  }

  public deleteUser(id: string): boolean {
    const initialCount = this.schema.users.length;
    this.schema.users = this.schema.users.filter(u => u.id !== id);
    if (this.schema.users.length !== initialCount) {
      this.bumpVersion();
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return [...this.schema.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.schema.categories.find(c => c.id === id);
  }

  public createCategory(data: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...data,
      id: generateId()
    };
    this.schema.categories.push(newCat);
    this.bumpVersion();
    this.saveDatabase();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.schema.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.schema.categories[idx] = { ...this.schema.categories[idx], ...updates };
    this.bumpVersion();
    this.saveDatabase();
    return this.schema.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const target = this.schema.categories.find(c => c.id === id);
    if (!target) return false;

    // Check if any applications are assigned to this category
    const orphanApps = this.schema.applications.filter(a => a.categoryId === id);
    if (orphanApps.length > 0) {
      // Find or create the 'Unmanaged' category at the end of the list
      let unmanaged = this.schema.categories.find(
        c => c.id === 'cat-unmanaged' || c.name.toLowerCase() === 'unmanaged'
      );
      if (!unmanaged) {
        const maxOrder = this.schema.categories.reduce((max, c) => Math.max(max, c.sortOrder || 0), 0);
        unmanaged = {
          id: 'cat-unmanaged',
          name: 'Unmanaged',
          icon: 'FolderArchive',
          sortOrder: Math.max(9999, maxOrder + 100),
          description: 'Unmanaged services from deleted categories'
        };
        this.schema.categories.push(unmanaged);
      }

      // Reassign all orphaned applications to the Unmanaged category
      orphanApps.forEach(app => {
        app.categoryId = unmanaged!.id;
      });
    }

    // Remove the category
    this.schema.categories = this.schema.categories.filter(c => c.id !== id);
    this.bumpVersion();
    this.saveDatabase();
    return true;
  }

  public reorderCategories(orderedIds: string[]): Category[] {
    orderedIds.forEach((id, index) => {
      const cat = this.schema.categories.find(c => c.id === id);
      if (cat) {
        cat.sortOrder = index + 1;
      }
    });
    this.bumpVersion();
    this.saveDatabase();
    return this.getCategories();
  }

  // --- Applications ---
  public getApplications(): Application[] {
    return [...this.schema.applications].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPublicApplications(): Application[] {
    return this.schema.applications
      .filter(a => {
        if (!a.isEnabled) return false;
        if (a.dashboards && Array.isArray(a.dashboards)) {
          return a.dashboards.includes('public');
        }
        return a.isPublic;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getApplicationsForUser(user: User): Application[] {
    if (user.role === 'admin') {
      return this.getApplications();
    }
    // Non-admin user (fallback)
    return this.schema.applications.filter(a => {
      if (!a.isEnabled) return false;
      if (a.dashboards && Array.isArray(a.dashboards)) {
        if (a.dashboards.includes('public')) return true;
      } else if (a.isPublic) {
        return true;
      }
      if (user.allowedCategoryIds && user.allowedCategoryIds.includes(a.categoryId)) return true;
      return false;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getApplicationById(id: string): Application | undefined {
    return this.schema.applications.find(a => a.id === id);
  }

  public createApplication(data: Omit<Application, 'id'>): Application {
    const newApp: Application = {
      ...data,
      id: generateId()
    };
    this.schema.applications.push(newApp);
    this.bumpVersion();
    this.saveDatabase();
    return newApp;
  }

  public updateApplication(id: string, updates: Partial<Application>): Application | null {
    const idx = this.schema.applications.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.schema.applications[idx] = { ...this.schema.applications[idx], ...updates };
    this.bumpVersion();
    this.saveDatabase();
    return this.schema.applications[idx];
  }

  public deleteApplication(id: string): boolean {
    const initialLen = this.schema.applications.length;
    this.schema.applications = this.schema.applications.filter(a => a.id !== id);
    if (this.schema.applications.length !== initialLen) {
      this.bumpVersion();
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public reorderApplications(orderedIds: string[]): Application[] {
    orderedIds.forEach((id, index) => {
      const app = this.schema.applications.find(a => a.id === id);
      if (app) {
        app.sortOrder = index + 1;
      }
    });
    this.bumpVersion();
    this.saveDatabase();
    return this.getApplications();
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return { ...this.schema.settings };
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.schema.settings = { ...this.schema.settings, ...updates };
    this.bumpVersion();
    this.saveDatabase();
    return this.schema.settings;
  }

  // --- Audit Logs ---
  public logAudit(user: string, action: string, details?: string, ip?: string) {
    const log: AuditLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      user,
      action,
      details,
      ip
    };
    this.schema.auditLogs.unshift(log);
    // Keep max 200 logs (trim older logs from the end)
    while (this.schema.auditLogs.length > 200) {
      this.schema.auditLogs.pop();
    }
    this.saveDatabase();
  }

  public getAuditLogs(): AuditLog[] {
    return this.schema.auditLogs;
  }

  public clearAuditLogs(): void {
    this.schema.auditLogs = [];
    this.saveDatabase();
  }

  // --- ZIP Backup & Restore System (Max 20 Backups) ---
  public listZipBackups(): BackupItem[] {
    if (!fs.existsSync(BACKUPS_DIR)) return [];
    const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.zip'));

    const items: BackupItem[] = [];
    for (const file of files) {
      const filePath = path.join(BACKUPS_DIR, file);
      try {
        const stat = fs.statSync(filePath);
        const id = file.replace(/\.zip$/, '');

        let stats = {
          applicationsCount: 0,
          categoriesCount: 0,
          usersCount: 0,
          uploadsCount: 0
        };
        let createdAt = stat.mtime.toISOString();

        try {
          const zip = new AdmZip(filePath);
          const manifestEntry = zip.getEntry('manifest.json');
          if (manifestEntry) {
            const m = JSON.parse(manifestEntry.getData().toString('utf-8'));
            if (m.stats) stats = m.stats;
            if (m.createdAt) createdAt = m.createdAt;
          } else {
            const dbEntry = zip.getEntry('database.json');
            if (dbEntry) {
              const dbParsed = JSON.parse(dbEntry.getData().toString('utf-8'));
              stats.applicationsCount = dbParsed.applications?.length || 0;
              stats.categoriesCount = dbParsed.categories?.length || 0;
              stats.usersCount = dbParsed.users?.length || 0;
            }
          }
        } catch (e) {
          console.warn('Failed to parse zip manifest for:', file, e);
        }

        items.push({
          id,
          filename: file,
          createdAt,
          sizeBytes: stat.size,
          stats
        });
      } catch (e) {
        console.warn('Error reading backup file stat:', file, e);
      }
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.slice(0, 20);
  }

  public pruneBackupsToLimit(limit = 20) {
    if (!fs.existsSync(BACKUPS_DIR)) return;
    const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.zip'));
    if (files.length <= limit) return;

    const fileDetails = files.map((file) => {
      const filePath = path.join(BACKUPS_DIR, file);
      const stat = fs.statSync(filePath);
      return { file, filePath, mtime: stat.mtime.getTime() };
    });

    fileDetails.sort((a, b) => b.mtime - a.mtime);
    const toDelete = fileDetails.slice(limit);
    for (const item of toDelete) {
      try {
        fs.unlinkSync(item.filePath);
      } catch (e) {
        console.warn('Failed to remove excess backup:', item.filePath, e);
      }
    }
  }

  public createZipBackup(): BackupItem {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().replace(/[:.]/g, '-');
    const id = `Backup-Homepage-${dateStr}`;
    const filename = `${id}.zip`;
    const filePath = path.join(BACKUPS_DIR, filename);

    const zip = new AdmZip();

    // 1. database.json
    const dbContent = JSON.stringify(this.schema, null, 2);
    zip.addFile('database.json', Buffer.from(dbContent, 'utf-8'));

    // 2. Individual data models for transparency and modular extraction
    zip.addFile('applications.json', Buffer.from(JSON.stringify(this.schema.applications, null, 2), 'utf-8'));
    zip.addFile('categories.json', Buffer.from(JSON.stringify(this.schema.categories, null, 2), 'utf-8'));
    zip.addFile('users.json', Buffer.from(JSON.stringify(this.schema.users, null, 2), 'utf-8'));
    zip.addFile('settings.json', Buffer.from(JSON.stringify(this.schema.settings, null, 2), 'utf-8'));
    zip.addFile('audit-logs.json', Buffer.from(JSON.stringify(this.schema.auditLogs, null, 2), 'utf-8'));

    // 3. Complete formatted Excel Workbook (.xlsx) inside ZIP package for maximum portability
    try {
      const wb = XLSX.utils.book_new();

      const appsRows = this.schema.applications.map((app, idx) => {
        const cat = this.schema.categories.find(c => c.id === app.categoryId);
        return {
          'ردیف': idx + 1,
          'شناسه برنامه': app.id,
          'نام برنامه': app.name,
          'دسته‌بندی': cat ? cat.name : (app.categoryId || 'عمومی'),
          'شناسه دسته‌بندی': app.categoryId || '',
          'آدرس اینترنتی (URL)': app.url,
          'توضیحات': app.description || '',
          'آیکون': app.icon || 'globe',
          'دسترسی عمومی': app.isPublic ? 'بله' : 'خیر',
          'وضعیت فعال': app.isEnabled !== false ? 'بله' : 'خیر',
          'باز شدن در تب جدید': app.openInNewTab !== false ? 'بله' : 'خیر',
          'ترتیب نمایش': app.sortOrder ?? idx + 1,
          'رنگ برجسته': app.accentColor || '',
          'آدرس فایل پیوست (fileUrl)': app.fileUrl || '',
          'نام فایل پیوست (fileName)': app.fileName || '',
          'برچسب‌ها': Array.isArray(app.tags) ? app.tags.join(', ') : '',
          'داشبوردها': Array.isArray(app.dashboards) ? app.dashboards.join(', ') : 'public, admin'
        };
      });
      const wsApps = XLSX.utils.json_to_sheet(appsRows);
      XLSX.utils.book_append_sheet(wb, wsApps, 'برنامه‌ها (Applications)');

      const catRows = this.schema.categories.map((cat, idx) => ({
        'ردیف': idx + 1,
        'شناسه دسته‌بندی': cat.id,
        'نام دسته‌بندی': cat.name,
        'آیکون': cat.icon,
        'ترتیب نمایش': cat.sortOrder ?? idx + 1,
        'توضیحات': cat.description || ''
      }));
      const wsCats = XLSX.utils.json_to_sheet(catRows);
      XLSX.utils.book_append_sheet(wb, wsCats, 'دسته‌بندی‌ها (Categories)');

      const s = this.schema.settings;
      const settingsRows = [
        { 'پارامتر': 'عنوان سرور و هوم‌لب', 'کلید': 'title', 'مقدار': s.title || '' },
        { 'پارامتر': 'زیرعنوان', 'کلید': 'subtitle', 'مقدار': s.subtitle || '' },
        { 'پارامتر': 'حالت پیش‌فرض تم (light/dark)', 'کلید': 'defaultTheme', 'مقدار': s.defaultTheme || 'dark' },
        { 'پارامتر': 'نوع ساعت (analog/digital/both/none)', 'کلید': 'clockType', 'مقدار': s.clockType || 'both' },
        { 'پارامتر': 'نمایش تاریخ', 'کلید': 'showDate', 'مقدار': s.showDate ? 'true' : 'false' },
        { 'پارامتر': 'نمایش ثانیه‌شمار', 'کلید': 'showSeconds', 'مقدار': s.showSeconds ? 'true' : 'false' },
        { 'پارامتر': 'تعداد ستون‌ها در دسکتاپ (2 تا 8)', 'کلید': 'gridColumns', 'مقدار': String(s.gridColumns || 4) },
        { 'پارامتر': 'جستجوی عمومی', 'کلید': 'publicSearch', 'مقدار': s.publicSearch !== false ? 'true' : 'false' },
        { 'پارامتر': 'متن پاورقی سفارشی', 'کلید': 'customFooterText', 'مقدار': s.customFooterText || '' },
        { 'پارامتر': 'آدرس لوگو', 'کلید': 'logoUrl', 'مقدار': s.logoUrl || '' },
        { 'پارامتر': 'آدرس تصویر پس‌زمینه', 'کلید': 'backgroundUrl', 'مقدار': s.backgroundUrl || '' },
        { 'پارامتر': 'مات بودن پس‌زمینه', 'کلید': 'backgroundBlur', 'مقدار': s.backgroundBlur ? 'true' : 'false' },
        { 'پارامتر': 'شفافیت لایه تیره پس‌زمینه (0 تا 90)', 'کلید': 'backgroundOverlayOpacity', 'مقدار': String(s.backgroundOverlayOpacity ?? 40) },
        { 'پارامتر': 'نمایش نوار تله‌متری', 'کلید': 'showTelemetryBar', 'مقدار': s.showTelemetryBar !== false ? 'true' : 'false' },
        { 'پارامتر': 'موقعیت نوار تله‌متری (top/bottom)', 'کلید': 'telemetryPosition', 'مقدار': s.telemetryPosition || 'top' }
      ];
      const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
      XLSX.utils.book_append_sheet(wb, wsSettings, 'تنظیمات (Settings)');

      const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      zip.addFile('homelab-data.xlsx', xlsxBuffer);
    } catch (e) {
      console.warn('Could not add Excel file to backup zip:', e);
    }

    // 4. Uploads directory (all icons, logos, backgrounds, and attached documents)
    let uploadsCount = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      const addDirRecursive = (dirPath: string, zipRelativePath: string) => {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const fullPath = path.join(dirPath, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            addDirRecursive(fullPath, `${zipRelativePath}/${item}`);
          } else if (stat.isFile()) {
            zip.addLocalFile(fullPath, zipRelativePath);
            uploadsCount++;
          }
        }
      };
      addDirRecursive(UPLOADS_DIR, 'uploads');
    }

    const stats = {
      applicationsCount: this.schema.applications.length,
      categoriesCount: this.schema.categories.length,
      usersCount: this.schema.users.length,
      uploadsCount
    };

    const manifest = {
      id,
      version: '2.0.1',
      createdAt: timestamp.toISOString(),
      stats
    };
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));

    zip.writeZip(filePath);
    this.pruneBackupsToLimit(20);

    const stat = fs.statSync(filePath);
    return {
      id,
      filename,
      createdAt: timestamp.toISOString(),
      sizeBytes: stat.size,
      stats
    };
  }

  public getBackupZipPath(id: string): string | null {
    const filename = id.endsWith('.zip') ? id : `${id}.zip`;
    const filePath = path.join(BACKUPS_DIR, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  public restoreZipBackup(id: string): { success: boolean; stats: any } {
    const filePath = this.getBackupZipPath(id);
    if (!filePath) {
      throw new Error('Backup file not found');
    }
    const buffer = fs.readFileSync(filePath);
    return this.restoreFromZipBuffer(buffer);
  }

  public restoreFromZipBuffer(buffer: Buffer): { success: boolean; stats: any } {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    let dbEntry = zipEntries.find((e) => e.entryName === 'database.json' || e.entryName.endsWith('/database.json'));
    if (dbEntry) {
      const raw = dbEntry.getData().toString('utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.applications)) this.schema.applications = parsed.applications;
        if (Array.isArray(parsed.categories)) this.schema.categories = parsed.categories;
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          // Preserve current admin password hash if restoring older users list
          const currentAdmin = this.schema.users.find(u => u.role === 'admin');
          if (currentAdmin && !parsed.users.some((u: any) => u.id === currentAdmin.id)) {
            this.schema.users = [currentAdmin, ...parsed.users];
          } else {
            this.schema.users = parsed.users;
          }
        }
        if (parsed.settings) this.schema.settings = { ...this.schema.settings, ...parsed.settings };
        if (Array.isArray(parsed.auditLogs)) this.schema.auditLogs = parsed.auditLogs;
      }
    } else {
      const appEntry = zipEntries.find((e) => e.entryName === 'applications.json' || e.entryName.endsWith('/applications.json'));
      if (appEntry) this.schema.applications = JSON.parse(appEntry.getData().toString('utf-8'));

      const catEntry = zipEntries.find((e) => e.entryName === 'categories.json' || e.entryName.endsWith('/categories.json'));
      if (catEntry) this.schema.categories = JSON.parse(catEntry.getData().toString('utf-8'));

      const userEntry = zipEntries.find((e) => e.entryName === 'users.json' || e.entryName.endsWith('/users.json'));
      if (userEntry) this.schema.users = JSON.parse(userEntry.getData().toString('utf-8'));

      const setEntry = zipEntries.find((e) => e.entryName === 'settings.json' || e.entryName.endsWith('/settings.json'));
      if (setEntry) this.schema.settings = { ...this.schema.settings, ...JSON.parse(setEntry.getData().toString('utf-8')) };
    }

    // Restore uploads (all icons, logos, backgrounds, documents)
    let uploadsCount = 0;
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      const normalizedName = entry.entryName.replace(/\\/g, '/');
      let relPath = '';

      if (normalizedName.startsWith('uploads/')) {
        relPath = normalizedName.replace(/^uploads\//, '');
      } else if (normalizedName.includes('/uploads/')) {
        relPath = normalizedName.split('/uploads/')[1];
      } else if (normalizedName.startsWith('icons/')) {
        relPath = `icons/${normalizedName.replace(/^icons\//, '')}`;
      }

      if (relPath) {
        const destPath = path.join(UPLOADS_DIR, relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        uploadsCount++;
      }
    }

    this.bumpVersion();
    this.saveDatabase();

    const stats = {
      applicationsCount: this.schema.applications.length,
      categoriesCount: this.schema.categories.length,
      usersCount: this.schema.users.length,
      uploadsCount
    };

    return { success: true, stats };
  }

  public resetDatabase(wipeUploads = false): { success: boolean; message: string } {
    this.schema.applications = [];
    this.schema.categories = [];
    this.schema.settings = {
      ...DEFAULT_SETTINGS,
      configVersion: generateVersionHash()
    };

    if (wipeUploads && fs.existsSync(UPLOADS_DIR)) {
      try {
        const removeDirContents = (dir: string) => {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const curPath = path.join(dir, file);
            if (fs.statSync(curPath).isDirectory()) {
              removeDirContents(curPath);
              try { fs.rmdirSync(curPath); } catch {}
            } else {
              try { fs.unlinkSync(curPath); } catch {}
            }
          }
        };
        removeDirContents(UPLOADS_DIR);
        const iconsDir = path.join(UPLOADS_DIR, 'icons');
        if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
      } catch (e) {
        console.warn('Error wiping uploads directory:', e);
      }
    }

    this.bumpVersion();
    this.saveDatabase();
    return { success: true, message: 'داده‌ها با موفقیت پاک شدند و سیستم بازنشانی شد' };
  }

  public deleteZipBackup(id: string): boolean {
    const filePath = this.getBackupZipPath(id);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  public exportBackup() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: { ...this.schema.settings },
      categories: this.schema.categories,
      applications: this.schema.applications
    };
  }

  public importBackup(payload: { categories?: Category[]; applications?: Application[]; settings?: Partial<SystemSettings> }): boolean {
    if (!payload || typeof payload !== 'object') return false;

    if (Array.isArray(payload.categories)) {
      this.schema.categories = payload.categories;
    }
    if (Array.isArray(payload.applications)) {
      this.schema.applications = payload.applications;
    }
    if (payload.settings && typeof payload.settings === 'object') {
      this.schema.settings = { ...this.schema.settings, ...payload.settings };
    }

    this.bumpVersion();
    this.saveDatabase();
    return true;
  }

  public getPaths() {
    const isExternal = path.resolve(DATA_DIR) !== path.resolve(process.cwd(), 'data');
    return {
      dataDir: DATA_DIR,
      uploadsDir: UPLOADS_DIR,
      backupsDir: BACKUPS_DIR,
      dbFile: DB_FILE,
      isExternalDataDir: isExternal
    };
  }
}

export const db = new DatabaseService();
