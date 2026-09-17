export type UserRole = 'admin';
export type DashboardTarget = 'public' | 'admin';

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
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  allowedCategoryIds?: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or built-in icon ID
  sortOrder: number;
  description?: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  url: string;
  categoryId: string;
  icon: string; // built-in ID like 'grafana' or '/uploads/icons/xxx.svg' or lucide name
  isPublic: boolean;
  isEnabled: boolean;
  sortOrder: number;
  accentColor?: string; // hex or tailwind color name
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
  uploadedBackgrounds?: UploadedBackground[]; // Up to 10 admin-uploaded backgrounds
  backgroundBlur?: boolean;
  backgroundOverlayOpacity?: number;
  defaultTheme: 'light' | 'dark';
  clockType: 'analog' | 'digital' | 'both' | 'none';
  showDate: boolean;
  showSeconds: boolean;
  gridColumns: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  publicSearch?: boolean;
  customFooterText?: string;
  showTelemetryBar?: boolean;
  telemetryPosition?: 'top' | 'bottom';
  configVersion: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
  ip?: string;
}

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  applications: Application[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
}

export interface PublicConfigResponse {
  categories: Category[];
  applications: Application[];
  settings: Omit<SystemSettings, 'configVersion'> & { configVersion: string };
  isSetupComplete: boolean;
  configVersion: string;
}
