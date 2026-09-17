import {
  PublicConfig,
  AuthResponse,
  Application,
  Category,
  User,
  SystemSettings,
  SystemStats,
  SystemInfo,
  AuditLog,
  TestResult,
  BackupItem,
  ActivityStats
} from '../types';

const TOKEN_KEY = 'linxdash_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let errorMsg = `خطای ارتباط با سرور (${response.status})`;
    if (isJson) {
      try {
        const json = await response.json();
        errorMsg = json.error || json.message || errorMsg;
      } catch {
        // fallback
      }
    } else {
      const rawText = await response.text();
      if (rawText.includes('<!doctype') || rawText.includes('<!DOCTYPE')) {
        errorMsg = `مسیر سرور در دسترس نیست یا سرور در حال بارگذاری است (${response.status})`;
      } else if (rawText.trim().length > 0 && rawText.length < 200) {
        errorMsg = rawText.trim();
      }
    }
    throw new Error(errorMsg);
  }

  if (!isJson) {
    const rawText = await response.text();
    if (rawText.includes('<!doctype') || rawText.includes('<!DOCTYPE')) {
      throw new Error('سرور در حال بارگذاری است یا مسیر نامعتبر است. لطفاً صفحه را تازه‌سازی کنید.');
    }
    try {
      return JSON.parse(rawText) as T;
    } catch {
      throw new Error('قالب پاسخ سرور معتبر نیست.');
    }
  }

  return response.json();
}

export const api = {
  // Public
  getPublicConfig: async (configVersion?: string): Promise<PublicConfig> => {
    const headers: Record<string, string> = {};
    if (configVersion) {
      headers['If-None-Match'] = `W/"${configVersion}"`;
    }
    const res = await fetch('/api/public/config', { headers });
    if (res.status === 304) {
      throw new Error('NOT_MODIFIED');
    }
    if (!res.ok) {
      throw new Error('خطا در دریافت تنظیمات سرور');
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('سرور در حال راه‌اندازی است. لطفاً صفحه را تازه‌سازی کنید.');
    }
    return res.json();
  },

  getSetupStatus: (): Promise<{ hasAdmin: boolean }> => {
    return request('/api/auth/setup-status');
  },

  // Auth
  setupAdmin: (payload: { username: string; password: string }): Promise<AuthResponse> => {
    return request('/api/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  login: (payload: { username: string; password: string }): Promise<AuthResponse> => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMe: (): Promise<{ user: { id: string; username: string; role: string } }> => {
    return request('/api/auth/me');
  },

  getCurrentUser: async (): Promise<{ id: string; username: string; role: string }> => {
    const res = await request<{ user: { id: string; username: string; role: string } }>('/api/auth/me');
    return res.user;
  },

  getUserDashboard: (): Promise<{
    user: { id: string; username: string; role: string };
    categories: Category[];
    applications: Application[];
    settings: SystemSettings;
    configVersion: string;
  }> => {
    return request('/api/user/dashboard');
  },

  // Admin Overview
  getAdminOverview: (): Promise<{
    stats: SystemStats;
    system: SystemInfo;
    settings: SystemSettings;
    recentLogs: AuditLog[];
    activity?: ActivityStats;
  }> => {
    return request('/api/admin/overview');
  },

  // Admin Audit Logs
  getAuditLogs: (): Promise<AuditLog[]> => {
    return request('/api/admin/audit-logs');
  },

  clearAuditLogs: (): Promise<{ success: boolean; message: string }> => {
    return request('/api/admin/audit-logs', {
      method: 'DELETE'
    });
  },

  // Admin Applications
  getAdminApplications: (): Promise<Application[]> => {
    return request('/api/admin/applications');
  },

  createApplication: (app: Partial<Application>): Promise<Application> => {
    return request('/api/admin/applications', {
      method: 'POST',
      body: JSON.stringify(app)
    });
  },

  updateApplication: (id: string, app: Partial<Application>): Promise<Application> => {
    return request(`/api/admin/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(app)
    });
  },

  deleteApplication: (id: string): Promise<{ success: boolean }> => {
    return request(`/api/admin/applications/${id}`, {
      method: 'DELETE'
    });
  },

  reorderApplications: (orderedIds: string[]): Promise<Application[]> => {
    return request('/api/admin/applications/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    });
  },

  // Admin Categories
  getAdminCategories: (): Promise<Category[]> => {
    return request('/api/admin/categories');
  },

  createCategory: (cat: Partial<Category>): Promise<Category> => {
    return request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    });
  },

  updateCategory: (id: string, cat: Partial<Category>): Promise<Category> => {
    return request(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat)
    });
  },

  deleteCategory: (id: string): Promise<{ success: boolean }> => {
    return request(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });
  },

  reorderCategories: (orderedIds: string[]): Promise<Category[]> => {
    return request('/api/admin/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    });
  },

  // Admin Users
  getAdminUsers: (): Promise<User[]> => {
    return request('/api/admin/users');
  },

  createUser: (user: Partial<User> & { password: string }): Promise<User> => {
    return request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  updateUser: (id: string, updates: Partial<User> & { password?: string }): Promise<User> => {
    return request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteUser: (id: string): Promise<{ success: boolean }> => {
    return request(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin Settings
  getAdminSettings: (): Promise<SystemSettings> => {
    return request('/api/admin/settings');
  },

  updateSettings: (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    return request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // File Uploads
  uploadLogo: async (file: File): Promise<{ success: boolean; logoUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    return request('/api/admin/upload/logo', {
      method: 'POST',
      body: formData
    });
  },

  deleteLogo: (): Promise<{ success: boolean }> => {
    return request('/api/admin/upload/logo', {
      method: 'DELETE'
    });
  },

  uploadBackground: async (file: File): Promise<{ success: boolean; backgroundUrl: string; uploadedBackgrounds: any[] }> => {
    const formData = new FormData();
    formData.append('background', file);
    return request('/api/admin/upload/background', {
      method: 'POST',
      body: formData
    });
  },

  selectBackground: (backgroundUrl: string | null): Promise<SystemSettings> => {
    return request('/api/admin/backgrounds/select', {
      method: 'PUT',
      body: JSON.stringify({ backgroundUrl })
    });
  },

  deleteUploadedBackground: (id: string): Promise<{ success: boolean; backgroundUrl: string | null; uploadedBackgrounds: any[] }> => {
    return request(`/api/admin/backgrounds/${id}`, {
      method: 'DELETE'
    });
  },

  deleteBackground: (): Promise<{ success: boolean; settings?: SystemSettings }> => {
    return request('/api/admin/upload/background', {
      method: 'DELETE'
    });
  },

  uploadIcon: async (file: File): Promise<{ success: boolean; iconUrl: string }> => {
    const formData = new FormData();
    formData.append('icon', file);
    return request('/api/admin/upload/icon', {
      method: 'POST',
      body: formData
    });
  },

  uploadDocument: async (file: File): Promise<{ success: boolean; url: string; filename: string; originalName: string; size: number; mimetype: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/admin/upload/document', {
      method: 'POST',
      body: formData
    });
  },

  listDocuments: (): Promise<Array<{ filename: string; url: string; size: number; createdAt: string; ext: string }>> => {
    return request('/api/admin/documents');
  },

  deleteDocument: (filename: string): Promise<{ success: boolean; filename: string }> => {
    return request(`/api/admin/documents/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
  },

  // Backup & Restore (Full ZIP & Legacy JSON)
  listBackups: (): Promise<BackupItem[]> => {
    return request('/api/admin/backups');
  },

  createBackup: (): Promise<BackupItem> => {
    return request('/api/admin/backups', {
      method: 'POST'
    });
  },

  restoreBackup: (id: string): Promise<{ success: boolean; stats: any }> => {
    return request(`/api/admin/backups/${encodeURIComponent(id)}/restore`, {
      method: 'POST'
    });
  },

  uploadAndRestoreBackup: async (file: File): Promise<{ success: boolean; stats: any }> => {
    const formData = new FormData();
    formData.append('backupZip', file);
    return request('/api/admin/backups/upload-restore', {
      method: 'POST',
      body: formData
    });
  },

  deleteBackup: (id: string): Promise<{ success: boolean }> => {
    return request(`/api/admin/backups/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  getBackupDownloadUrl: (id: string): string => {
    const token = getStoredToken();
    return `/api/admin/backups/${encodeURIComponent(id)}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  exportBackup: async (): Promise<any> => {
    return request('/api/admin/export');
  },

  importBackup: async (backup: any): Promise<{ success: boolean; message: string }> => {
    return request('/api/admin/import', {
      method: 'POST',
      body: JSON.stringify({ backup })
    });
  },

  resetDatabase: async (options?: { wipeUploads?: boolean }): Promise<{ success: boolean; message: string }> => {
    return request('/api/admin/reset', {
      method: 'POST',
      body: JSON.stringify(options || {})
    });
  },

  // Automated Tests
  runTests: (): Promise<{ success: boolean; timestamp: string; tests: TestResult[] }> => {
    return request('/api/test/run');
  }
};
