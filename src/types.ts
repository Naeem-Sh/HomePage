export const APP_VERSION = '2.0.1';

export type UserRole = 'admin';
export type DashboardTarget = 'public' | 'admin';
export type ThemeMode = 'light' | 'dark';
export type ClockType = 'analog' | 'digital' | 'both' | 'none';

export interface UploadedBackground {
  id: string;
  url: string;
  filename: string;
  originalName?: string;
  uploadedAt: string;
  sizeBytes?: number;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  allowedCategoryIds?: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  description?: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  url: string;
  categoryId: string;
  icon: string;
  isPublic: boolean;
  isEnabled: boolean;
  sortOrder: number;
  accentColor?: string;
  openInNewTab?: boolean;
  fileUrl?: string; // If set, button priority directly opens this file instead of web url
  fileName?: string;
  tags?: string[];
  allowedRoles?: UserRole[];
  dashboards?: DashboardTarget[]; // 'public' | 'admin'
}

export interface BackupItem {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  stats: {
    applicationsCount: number;
    categoriesCount: number;
    usersCount: number;
    uploadsCount: number;
  };
}

export interface ActivityStats {
  activeUsersCount: number;
  todayVisits: number;
}

export interface SystemSettings {
  title: string;
  subtitle: string;
  logoUrl: string | null;
  backgroundUrl?: string | null;
  uploadedBackgrounds?: UploadedBackground[]; // Up to 10 admin-uploaded background images
  backgroundBlur?: boolean;
  backgroundOverlayOpacity?: number; // 0 to 90
  defaultTheme: ThemeMode;
  clockType: ClockType;
  showDate: boolean;
  showSeconds: boolean;
  gridColumns: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  publicSearch?: boolean;
  customFooterText?: string;
  showTelemetryBar?: boolean;
  telemetryPosition?: 'top' | 'bottom';
  configVersion: string;
}

export interface PublicConfig {
  categories: Category[];
  applications: Application[];
  settings: SystemSettings;
  system?: SystemInfo;
  activity?: ActivityStats;
  isSetupComplete: boolean;
  configVersion: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

export interface SystemStats {
  totalApplications: number;
  publicApplications: number;
  privateApplications: number;
  enabledApplications: number;
  totalCategories: number;
  totalUsers: number;
  adminUsers: number;
  privateUsers: number;
  activity?: ActivityStats;
}

export interface SystemInfo {
  uptimeSeconds: number;
  hostUptimeSeconds?: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  cpuCount?: number;
  cpuModel?: string;
  cpuPercent?: number;
  heapUsedMB: number;
  rssMB: number;
  memTotalMB?: number;
  memFreeMB?: number;
  memUsedPercent?: number;
  storageTotalGB?: number;
  storageUsedGB?: number;
  storageUsedPercent?: number;
  dataDir?: string;
  dbFile?: string;
  isExternalDataDir?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
  ip?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}
