import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, User, Category, Application, SystemSettings, AuditLog } from './types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
    name: 'Infrastructure & Cloud',
    icon: 'Server',
    sortOrder: 1,
    description: 'Core virtualization, servers, and container platforms'
  },
  {
    id: 'cat-monitoring',
    name: 'Monitoring & Metrics',
    icon: 'Activity',
    sortOrder: 2,
    description: 'System telemetry, network metrics, and alert dashboards'
  },
  {
    id: 'cat-storage',
    name: 'Storage & Documents',
    icon: 'HardDrive',
    sortOrder: 3,
    description: 'Cloud storage, network shares, backup and documents'
  },
  {
    id: 'cat-media',
    name: 'Media & Automation',
    icon: 'Film',
    sortOrder: 4,
    description: 'Streaming, audio, personal photos, and download automation'
  },
  {
    id: 'cat-security',
    name: 'Networking & Security',
    icon: 'Shield',
    sortOrder: 5,
    description: 'DNS ad-blocking, VPN gateways, and credential managers'
  },
  {
    id: 'cat-dev',
    name: 'Development & Tools',
    icon: 'Terminal',
    sortOrder: 6,
    description: 'Code repositories, IDEs, and workflow automation'
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
    allowedRoles: ['admin', 'private_user']
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
  customFooterText: 'Powered by Linux & Open Source',
  showTelemetryBar: true,
  telemetryPosition: 'top',
  configVersion: generateVersionHash()
};

class DatabaseService {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = this.loadDatabase();
    this.ensureDefaultUsers();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          applications: parsed.applications || DEFAULT_APPLICATIONS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          auditLogs: parsed.auditLogs || []
        };
      }
    } catch (e) {
      console.error('Error loading database file, initializing defaults:', e);
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
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  private ensureDefaultUsers() {
    const salt = bcrypt.genSaltSync(10);
    const envUser = (process.env.INITIAL_ADMIN_USER && process.env.INITIAL_ADMIN_USER.trim()) || 'admin';
    const envPass = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';

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
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.isActive = true;
      adminUser.passwordHash = bcrypt.hashSync(envPass, salt);
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
    // Private user
    return this.schema.applications.filter(a => {
      if (!a.isEnabled) return false;
      if (a.dashboards && Array.isArray(a.dashboards)) {
        if (a.dashboards.includes('public')) return true;
      } else if (a.isPublic) {
        return true;
      }
      if (a.allowedRoles && a.allowedRoles.includes('private_user')) return true;
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
    // Keep max 500 logs
    if (this.schema.auditLogs.length > 500) {
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

  // --- Import / Export ---
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

    if (Array.isArray(payload.categories) && payload.categories.length > 0) {
      this.schema.categories = payload.categories;
    }
    if (Array.isArray(payload.applications) && payload.applications.length > 0) {
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
    return {
      dataDir: DATA_DIR,
      uploadsDir: UPLOADS_DIR,
      dbFile: DB_FILE
    };
  }
}

export const db = new DatabaseService();
