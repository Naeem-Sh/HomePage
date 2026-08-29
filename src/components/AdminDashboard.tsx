import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  AppWindow,
  Users,
  Palette,
  Settings as SettingsIcon,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  ExternalLink,
  Search,
  Lock,
  Globe,
  Sparkles,
  Server,
  Activity,
  HardDrive,
  RefreshCw,
  Copy,
  Check,
  FileCode2,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sliders,
  ScrollText,
  FileText
} from 'lucide-react';
import {
  Application,
  Category,
  User,
  SystemSettings,
  SystemStats,
  SystemInfo,
  AuditLog,
  TestResult,
  ThemeMode,
  UploadedBackground
} from '../types';
import { api, setStoredToken } from '../lib/api';
import { AppIcon } from './AppIcon';
import { IconPickerModal } from './IconPickerModal';
import { ThemeToggle } from './ThemeToggle';
import { HostTelemetryBar } from './HostTelemetryBar';
import { DashboardSwitcher } from './DashboardSwitcher';

interface AdminDashboardProps {
  currentUser: { id: string; username: string; role: string };
  onLogout: () => void;
  onNavigateHome: () => void;
  theme: ThemeMode;
  onThemeToggle: (theme: ThemeMode) => void;
}

type AdminTab = 'overview' | 'applications' | 'users' | 'appearance' | 'logs' | 'system' | 'tests';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateHome,
  theme,
  onThemeToggle
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Default Settings fallback
  const DEFAULT_SETTINGS: SystemSettings = {
    title: 'Linux Dash',
    subtitle: 'Self-Hosted Command Center',
    logoUrl: null,
    backgroundUrl: null,
    uploadedBackgrounds: [],
    backgroundBlur: false,
    backgroundOverlayOpacity: 0,
    defaultTheme: 'dark',
    clockType: 'analog',
    showDate: true,
    showSeconds: true,
    gridColumns: 4,
    publicSearch: false,
    customFooterText: 'Host: Linux Server',
    showTelemetryBar: true,
    telemetryPosition: 'top',
    configVersion: '1.0.0'
  };

  // Data States
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals & Form States
  const [editingApp, setEditingApp] = useState<Partial<Application> | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(Partial<User> & { password?: string }) | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // Tests State
  const [testResults, setTestResults] = useState<{ success: boolean; tests: TestResult[] } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Logo file ref, background file ref & backup ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Filter query in applications list
  const [appSearch, setAppSearch] = useState('');
  const [appDashboardFilter, setAppDashboardFilter] = useState<'all' | 'public' | 'admin'>('all');

  // Audit Logs Tab States
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.getAdminOverview(),
        api.getAdminApplications(),
        api.getAdminCategories(),
        api.getAdminUsers()
      ]);

      const [overviewRes, appsRes, catsRes, usersRes] = results;

      if (overviewRes.status === 'fulfilled') {
        setStats(overviewRes.value.stats);
        setSystemInfo(overviewRes.value.system);
        setSettings(overviewRes.value.settings);
        setAuditLogs(overviewRes.value.recentLogs);
      }
      if (appsRes.status === 'fulfilled') {
        setApplications(appsRes.value);
      }
      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value);
      }
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value);
      }

      // Check if critical errors occurred
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason?.message || 'Error loading section');

      if (errors.length > 0 && overviewRes.status === 'rejected') {
        setError(errors[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administration data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Application Handlers ---
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editingApp.name || !editingApp.url) {
      setError('Please fill in Application Name and Destination URL/Path');
      return;
    }

    const appPayload = {
      ...editingApp,
      categoryId: editingApp.categoryId || categories[0]?.id || 'cat-general'
    };

    try {
      if (editingApp.id) {
        await api.updateApplication(editingApp.id, appPayload);
        showNotification(`Application "${editingApp.name}" updated successfully`);
      } else {
        await api.createApplication(appPayload);
        showNotification(`Application "${editingApp.name}" created successfully`);
      }
      setIsAppModalOpen(false);
      setEditingApp(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save application');
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete application "${name}"?`)) return;
    try {
      await api.deleteApplication(id);
      showNotification(`Application "${name}" deleted`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
    }
  };

  const handleMoveApp = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= applications.length) return;

    const newApps = [...applications];
    const temp = newApps[index];
    newApps[index] = newApps[targetIndex];
    newApps[targetIndex] = temp;

    setApplications(newApps);
    try {
      await api.reorderApplications(newApps.map((a) => a.id));
      showNotification('Applications reordered');
    } catch (err: any) {
      setError(err.message || 'Failed to reorder applications');
      loadData();
    }
  };

  // --- User Handlers ---
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.username) return;

    try {
      if (editingUser.id) {
        await api.updateUser(editingUser.id, editingUser);
        showNotification(`User "${editingUser.username}" updated`);
      } else {
        if (!editingUser.password) {
          setError('Password is required for new user');
          return;
        }
        await api.createUser(editingUser as any);
        showNotification(`User "${editingUser.username}" created`);
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await api.deleteUser(id);
      showNotification(`User "${username}" deleted`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  // --- Settings & Logo Handlers ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      showNotification('Homepage settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadLogo(file);
      if (res.success) {
        setSettings((prev) => (prev ? { ...prev, logoUrl: res.logoUrl } : null));
        showNotification('Homepage logo uploaded successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await api.deleteLogo();
      setSettings((prev) => (prev ? { ...prev, logoUrl: null } : null));
      showNotification('Logo removed');
    } catch (err: any) {
      setError(err.message || 'Failed to remove logo');
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadBackground(file);
      if (res.success) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                backgroundUrl: res.backgroundUrl,
                uploadedBackgrounds: res.uploadedBackgrounds
              }
            : null
        );
        showNotification('Public background picture uploaded and set as active!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload background picture');
    } finally {
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const handleSelectUploadedBg = async (url: string) => {
    try {
      const updatedSettings = await api.selectBackground(url);
      setSettings(updatedSettings);
      showNotification('Active public background updated');
    } catch (err: any) {
      setError(err.message || 'Failed to select background');
    }
  };

  const handleDeleteUploadedBg = async (id: string, name: string) => {
    if (!window.confirm(`Delete wallpaper "${name}" from upload library?`)) return;
    try {
      const res = await api.deleteUploadedBackground(id);
      if (res.success) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                backgroundUrl: res.backgroundUrl,
                uploadedBackgrounds: res.uploadedBackgrounds
              }
            : null
        );
        showNotification('Wallpaper removed from upload library');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete wallpaper');
    }
  };

  const handleDeleteBackground = async () => {
    try {
      await api.deleteBackground();
      setSettings((prev) => (prev ? { ...prev, backgroundUrl: null } : null));
      showNotification('Background picture reset to default mesh theme');
    } catch (err: any) {
      setError(err.message || 'Failed to remove background picture');
    }
  };

  // --- Backup & Restore ---
  const handleExportBackup = async () => {
    try {
      const backup = await api.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linxdash-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Backup exported successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to export backup');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importBackup(json);
        showNotification('Configuration backup restored successfully!');
        loadData();
      } catch (err: any) {
        setError('Invalid backup file format or corrupt JSON');
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  // --- Automated Test Runner ---
  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await api.runTests();
      setTestResults(results);
      if (results.success) {
        showNotification('All automated verification tests passed cleanly!');
      } else {
        setError('Some automated tests failed. Review results below.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute test suite');
    } finally {
      setIsRunningTests(false);
    }
  };

  // --- Audit Logs Handlers ---
  const handleClearAuditLogs = async () => {
    if (!window.confirm('Are you sure you want to permanently clear all audit history and access logs?')) return;
    setIsClearingLogs(true);
    try {
      await api.clearAuditLogs();
      setAuditLogs([]);
      showNotification('Audit logs cleared successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to clear audit logs');
    } finally {
      setIsClearingLogs(false);
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesAction = logActionFilter === 'all' || log.action === logActionFilter;
    const q = logSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.ip && log.ip.toLowerCase().includes(q));
    return matchesAction && matchesSearch;
  });

  const uniqueLogActions = Array.from(new Set(auditLogs.map((l) => l.action))).sort();

  const filteredApps = applications.filter((app) => {
    const matchesDashboard =
      appDashboardFilter === 'all' ||
      (app.dashboards && app.dashboards.includes(appDashboardFilter as any)) ||
      (appDashboardFilter === 'public' && app.isPublic) ||
      (appDashboardFilter === 'admin');
    const q = appSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.url.toLowerCase().includes(q) ||
      (app.tags && app.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesDashboard && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/50 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20 text-white shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-tight">
              <span>Admin Control Panel</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Signed
              </span>
              <span>as <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser.username}</span> (Administrator)</span>
            </p>
          </div>
        </div>

        {/* Center: 1-Click Dashboard Switcher */}
        <div className="flex items-center justify-center">
          <DashboardSwitcher
            currentDashboard="admin"
            currentUser={currentUser}
            onNavigatePublic={onNavigateHome}
            onNavigateAdmin={() => {}}
            onOpenLogin={() => {}}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{currentUser.username}</span>
            <span className="text-[10px] uppercase font-mono px-1 bg-indigo-200/50 dark:bg-indigo-900/50 rounded">
              {currentUser.role}
            </span>
          </div>

          <button
            id="admin-logout-button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Host Telemetry Bar */}
      {systemInfo && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-4">
          <HostTelemetryBar systemInfo={systemInfo} />
        </div>
      )}

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-8 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 backdrop-blur-md space-y-1 shadow-xs">
            {[
              { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
              { id: 'applications', label: 'Applications', icon: AppWindow, count: applications.length },
              { id: 'users', label: 'Users & Roles', icon: Users, count: users.length },
              { id: 'appearance', label: 'Appearance & Logo', icon: Palette },
              { id: 'logs', label: 'Audit & Access Logs', icon: ScrollText, count: auditLogs.length },
              { id: 'system', label: 'System & Backup', icon: SettingsIcon },
              { id: 'tests', label: 'Automated Tests', icon: ShieldAlert }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Linux Dash Command Center</p>
            <p className="text-[11px]">Config Version: <span className="font-mono">{settings?.configVersion?.slice(0, 8) || 'v1.0.0'}</span></p>
          </div>
        </aside>

        {/* Tab Body */}
        <main className="flex-1 min-w-0">
          {/* Notifications */}
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                &times;
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-600">
                &times;
              </button>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Buttons</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {applications.length}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {applications.filter(a => a.isEnabled !== false).length} active
                    </span>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Grid Layout</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {settings.gridColumns || 4}
                    </span>
                    <span className="text-xs text-slate-400">Desktop Columns</span>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Uploaded Wallpapers</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {settings.uploadedBackgrounds?.length || 0} / 10
                    </span>
                    <span className="text-xs text-slate-400">Server slots</span>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin Accounts</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {users.length}
                    </span>
                    <span className="text-xs text-slate-400">Administrators</span>
                  </div>
                </div>
              </div>

              {/* System Telemetry & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Diagnostics */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Host Environment & Runtime</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Operational
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">Node Runtime</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {systemInfo?.nodeVersion || 'v22.x'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">Platform Arch</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {systemInfo?.platform} ({systemInfo?.arch})
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">Heap Memory</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {systemInfo?.heapUsedMB || 0} MB
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">Process Uptime</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {Math.floor((systemInfo?.uptimeSeconds || 0) / 60)} mins
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 sm:col-span-2">
                      <span className="text-slate-400">Persistence Target</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                        ./data/database.json
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Quick Actions</h3>
                  <button
                    onClick={() => {
                      setEditingApp({
                        name: '',
                        description: '',
                        url: 'https://',
                        categoryId: categories[0]?.id || 'cat-infra',
                        icon: 'terminal',
                        isPublic: true,
                        isEnabled: true,
                        sortOrder: applications.length + 1,
                        accentColor: '#3B82F6',
                        openInNewTab: true,
                        tags: []
                      });
                      setIsAppModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Application
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('tests');
                      handleRunTests();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-500" />
                      Run Security Tests
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleExportBackup}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-purple-500" />
                      Export JSON Backup
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Recent Activity & Audit Trail</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Log Viewer</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="pb-2 font-medium">Timestamp</th>
                        <th className="pb-2 font-medium">User</th>
                        <th className="pb-2 font-medium">Action</th>
                        <th className="pb-2 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="text-slate-700 dark:text-slate-300">
                          <td className="py-2 text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 font-semibold text-blue-600 dark:text-blue-400">{log.user}</td>
                          <td className="py-2 text-slate-900 dark:text-slate-100">{log.action}</td>
                          <td className="py-2 text-slate-500 dark:text-slate-400 truncate max-w-xs">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Application Directory & Quick Launchers */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                    <AppWindow className="w-4 h-4 text-indigo-500" />
                    <span>Live Applications Directory & Launchers</span>
                    <span className="text-xs text-slate-400 font-normal">({applications.length} Total)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {applications.slice(0, 9).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 p-1.5 shadow-xs"
                          style={{ borderColor: `${app.accentColor || '#6366F1'}40` }}
                        >
                          <AppIcon icon={app.icon} accentColor={app.accentColor || '#6366F1'} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{app.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{app.url}</p>
                        </div>
                      </div>
                      <a
                        href={app.url}
                        target={app.openInNewTab ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 shrink-0 transition-colors"
                        title="Launch Application"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {/* Header bar with filters and Add Button */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter applications..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    id="app-dashboard-filter"
                    value={appDashboardFilter}
                    onChange={(e) => setAppDashboardFilter(e.target.value as any)}
                    className="py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Dashboards</option>
                    <option value="public">Public Homepage</option>
                    <option value="it_staff">IT Staff Portal</option>
                    <option value="admin">Admin Panel</option>
                  </select>
                </div>

                <button
                  id="add-application-button"
                  onClick={() => {
                    setEditingApp({
                      name: '',
                      description: '',
                      url: 'https://',
                      categoryId: categories[0]?.id || 'cat-infra',
                      icon: 'terminal',
                      isPublic: true,
                      dashboards: ['public', 'it_staff', 'admin'],
                      isEnabled: true,
                      sortOrder: applications.length + 1,
                      accentColor: '#3B82F6',
                      openInNewTab: true,
                      tags: []
                    });
                    setIsAppModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Application</span>
                </button>
              </div>

              {/* Applications Table / Cards */}
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="p-3.5 font-medium">Order</th>
                        <th className="p-3.5 font-medium">Application Button</th>
                        <th className="p-3.5 font-medium">Destination URL / Path</th>
                        <th className="p-3.5 font-medium">Status</th>
                        <th className="p-3.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredApps.map((app, idx) => {
                        return (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            {/* Order Buttons */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => handleMoveApp(idx, 'up')}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  disabled={idx === filteredApps.length - 1}
                                  onClick={() => handleMoveApp(idx, 'down')}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <span className="font-mono text-slate-400 text-[10px] ml-1">#{app.sortOrder}</span>
                              </div>
                            </td>

                            {/* App Info */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center border shrink-0"
                                  style={{ borderColor: app.accentColor }}
                                >
                                  <AppIcon icon={app.icon} accentColor={app.accentColor} className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{app.name}</p>
                                  {app.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                      {app.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* URL */}
                            <td className="p-3.5 max-w-xs truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {app.url}
                            </td>

                            {/* Status */}
                            <td className="p-3.5 whitespace-nowrap">
                              <button
                                onClick={async () => {
                                  await api.updateApplication(app.id, { isEnabled: !app.isEnabled });
                                  loadData();
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                                  app.isEnabled
                                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {app.isEnabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 whitespace-nowrap text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingApp(app);
                                  setIsAppModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Application"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app.id, app.name)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Delete Application"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">User Access & Roles</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage administrators and private authenticated users.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser({ username: '', role: 'private_user', isActive: true, password: '' });
                    setIsUserModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>

              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="p-3.5 font-medium">Username</th>
                      <th className="p-3.5 font-medium">Role</th>
                      <th className="p-3.5 font-medium">Status</th>
                      <th className="p-3.5 font-medium">Created Date</th>
                      <th className="p-3.5 font-medium">Last Login</th>
                      <th className="p-3.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                            {u.username[0].toUpperCase()}
                          </span>
                          {u.username}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                                : u.role === 'it_staff'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                            }`}
                          >
                            {u.role === 'it_staff' ? 'IT Staff' : u.role === 'admin' ? 'Admin' : 'Private User'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              u.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            disabled={currentUser.id === u.id}
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. APPEARANCE TAB */}
          {activeTab === 'appearance' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Logo Management */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Homepage Logo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a custom transparent PNG, SVG, or WebP logo for the homepage header.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
                  <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center p-3 shadow-inner shrink-0">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Server className="w-10 h-10 text-indigo-500" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/svg+xml,image/webp,image/jpeg"
                      className="hidden"
                      id="admin-logo-file-input"
                    />
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Upload Logo Image
                      </button>
                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteLogo}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended: 128x128px or higher PNG/SVG with transparent background.
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Background Picture / Wallpaper Management */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>Public Background Picture & Wallpaper</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Change the public homepage background image. Upload a high-res wallpaper or select a curated preset.
                    </p>
                  </div>
                </div>

                {/* Current Background Preview Box */}
                <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-950/20 h-44 flex items-center justify-center">
                  {settings.backgroundUrl ? (
                    <>
                      <img
                        src={settings.backgroundUrl}
                        alt="Background Preview"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                          settings.backgroundBlur ? 'blur-xs scale-105' : ''
                        }`}
                      />
                      <div
                        className="absolute inset-0 bg-slate-950 transition-opacity"
                        style={{ opacity: (settings.backgroundOverlayOpacity ?? 30) / 100 }}
                      />
                      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-xs flex items-center gap-3">
                        <span className="font-semibold">Active Background Picture</span>
                        <button
                          type="button"
                          onClick={handleDeleteBackground}
                          className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 p-4">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Default Ambient Mesh Theme (No custom background image selected)
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Backgrounds Library (Max 10 Images) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span>Uploaded Custom Wallpaper Library</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Admin can upload up to 10 background images to the server and select any as the active public dashboard wallpaper.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold ${
                        (settings.uploadedBackgrounds?.length || 0) >= 10
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {settings.uploadedBackgrounds?.length || 0} / 10 Uploaded
                      </span>

                      <input
                        type="file"
                        ref={bgInputRef}
                        onChange={handleBackgroundUpload}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        id="admin-bg-file-input"
                      />

                      <button
                        type="button"
                        onClick={() => bgInputRef.current?.click()}
                        disabled={(settings.uploadedBackgrounds?.length || 0) >= 10}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Wallpaper ({(settings.uploadedBackgrounds?.length || 0)}/10)</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Backgrounds Grid */}
                  {settings.uploadedBackgrounds && settings.uploadedBackgrounds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5">
                      {settings.uploadedBackgrounds.map((bg, idx) => {
                        const isActive = settings.backgroundUrl === bg.url;
                        const sizeKb = bg.sizeBytes ? Math.round(bg.sizeBytes / 1024) : 0;
                        const displayName = bg.originalName || bg.filename || `Wallpaper Slot ${idx + 1}`;
                        return (
                          <div
                            key={bg.id || idx}
                            className={`group relative rounded-xl overflow-hidden border transition-all duration-200 flex flex-col bg-white dark:bg-slate-900 ${
                              isActive
                                ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md shadow-blue-500/20'
                                : 'border-slate-200 dark:border-white/10 hover:border-blue-400'
                            }`}
                          >
                            <div className="relative h-28 w-full bg-slate-950/30 overflow-hidden">
                              <img
                                src={bg.url}
                                alt={displayName}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              {isActive && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Active</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteUploadedBg(bg.id, displayName)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete from Library"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={displayName}>
                                  {displayName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {sizeKb > 0 ? `${sizeKb} KB &bull; ` : ''}Slot {idx + 1}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSelectUploadedBg(bg.url)}
                                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                  isActive
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <Check className="w-3 h-3 text-blue-500" />
                                    <span>Active Wallpaper</span>
                                  </>
                                ) : (
                                  <span>Set as Active Wallpaper</span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        No custom background pictures uploaded yet (0 / 10 slots used).
                      </p>
                      <button
                        type="button"
                        onClick={() => bgInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload First Wallpaper</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Reset or Clear Wallpaper Button */}
                {settings.backgroundUrl && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Currently using active wallpaper: <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-xs">{settings.backgroundUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const updated = await api.updateSettings({ ...settings, backgroundUrl: null });
                          setSettings(updated);
                          showNotification('Wallpaper cleared. Dashboard reverted to solid theme background.');
                        } catch (err: any) {
                          setError(err.message || 'Failed to clear wallpaper');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      Clear Active Wallpaper (Use Solid Background)
                    </button>
                  </div>
                )}

                  {/* Direct Background URL Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Direct Background Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/wallpaper.jpg"
                        value={settings.backgroundUrl || ''}
                        onChange={(e) => setSettings({ ...settings, backgroundUrl: e.target.value || null })}
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const updated = await api.updateSettings({ ...settings, backgroundUrl: settings.backgroundUrl });
                            setSettings(updated);
                            showNotification('Direct wallpaper URL applied successfully');
                          } catch (err: any) {
                            setError(err.message || 'Failed to apply wallpaper URL');
                          }
                        }}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Apply URL
                      </button>
                    </div>
                  </div>

                  {/* Background Blur & Dimming Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.backgroundBlur)}
                          onChange={(e) => setSettings({ ...settings, backgroundBlur: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Apply Soft Background Blur Effect</span>
                      </label>
                      <p className="text-[11px] text-slate-400 pl-5">
                        Adds a gentle Gaussian blur to the wallpaper to maximize text & card legibility.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Background Dimming Overlay</span>
                        <span className="font-mono text-indigo-500 font-bold">{settings.backgroundOverlayOpacity ?? 30}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={settings.backgroundOverlayOpacity ?? 30}
                        onChange={(e) => setSettings({ ...settings, backgroundOverlayOpacity: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400">
                        Darkens the wallpaper for high contrast with light and dark elements.
                      </p>
                    </div>
                  </div>
                </div>

              {/* Title & Subtitle */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Header Branding</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Homepage Title
                    </label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Homepage Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.subtitle}
                      onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Clock & Layout */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Clock & Grid Layout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Clock Display Mode
                    </label>
                    <select
                      value={settings.clockType}
                      onChange={(e) => setSettings({ ...settings, clockType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="analog">Analog Clock Only</option>
                      <option value="digital">Digital Clock Only</option>
                      <option value="both">Both (Analog + Digital)</option>
                      <option value="none">Disabled (No Clock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Theme
                    </label>
                    <select
                      value={settings.defaultTheme}
                      onChange={(e) => setSettings({ ...settings, defaultTheme: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="light">Light Mode (Default)</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Grid Columns (Public Dashboard Buttons)
                    </label>
                    <select
                      value={settings.gridColumns || 4}
                      onChange={(e) => setSettings({ ...settings, gridColumns: Number(e.target.value) as any })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                      <option value={4}>4 Columns (Default)</option>
                      <option value={5}>5 Columns</option>
                      <option value={6}>6 Columns</option>
                      <option value={7}>7 Columns</option>
                      <option value={8}>8 Columns (Wide / Ultra-dense)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showSeconds}
                      onChange={(e) => setSettings({ ...settings, showSeconds: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Show Seconds Hand / Readout</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDate}
                      onChange={(e) => setSettings({ ...settings, showDate: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Display Date in Header</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showTelemetryBar !== false}
                      onChange={(e) => setSettings({ ...settings, showTelemetryBar: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Show Host Telemetry Bar (CPU, RAM, Storage, Uptime)</span>
                  </label>
                </div>

                {settings.showTelemetryBar !== false && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Telemetry Bar Position:
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="radio"
                          name="telemetryPosition"
                          value="top"
                          checked={settings.telemetryPosition !== 'bottom'}
                          onChange={() => setSettings({ ...settings, telemetryPosition: 'top' })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Top (Below Header)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="radio"
                          name="telemetryPosition"
                          value="bottom"
                          checked={settings.telemetryPosition === 'bottom'}
                          onChange={() => setSettings({ ...settings, telemetryPosition: 'bottom' })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Bottom (Above Footer)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Save Appearance & Wallpaper Changes
                </button>
              </div>
            </form>
          )}

          {/* 6. AUDIT & ACCESS LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Top controls and filter toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search user, action, IP, details..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <select
                    value={logActionFilter}
                    onChange={(e) => setLogActionFilter(e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="all">All Event Actions ({auditLogs.length})</option>
                    {uniqueLogActions.map((action) => (
                      <option key={action} value={action}>
                        {action} ({auditLogs.filter((l) => l.action === action).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const logs = await api.getAuditLogs();
                        setAuditLogs(logs);
                        showNotification('Audit log feed refreshed');
                      } catch (err: any) {
                        setError(err.message || 'Failed to refresh logs');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleClearAuditLogs}
                    disabled={isClearingLogs || auditLogs.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isClearingLogs ? 'Clearing...' : 'Clear Audit History'}</span>
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="px-4 py-3 font-semibold">Timestamp</th>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Event Action</th>
                        <th className="px-4 py-3 font-semibold">Event Details</th>
                        <th className="px-4 py-3 font-semibold">Client IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                            <div className="max-w-xs mx-auto space-y-2">
                              <ScrollText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                              <p className="font-semibold text-slate-600 dark:text-slate-400">No audit records found</p>
                              <p className="text-[11px] text-slate-400">
                                Administrative changes, authentication attempts, and exports will appear here.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAuditLogs.map((log) => {
                          const isWarning = log.action.includes('FAIL') || log.action.includes('REMOVED') || log.action.includes('DELETED');
                          const isSuccess = log.action.includes('LOGIN') || log.action.includes('CREATED') || log.action.includes('EXPORTED');
                          return (
                            <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                                  {log.user}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight ${
                                    isWarning
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                      : isSuccess
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-md break-words">
                                {log.details}
                              </td>
                              <td className="px-4 py-3 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                                {log.ip || '127.0.0.1'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredAuditLogs.length > 0 && (
                  <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Showing {filteredAuditLogs.length} of {auditLogs.length} audit entries</span>
                    <span className="font-mono text-[10px]">Retention: Auto-appended to JSON storage</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. SYSTEM & BACKUP TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Backup & Restore */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Backup & Disaster Recovery</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Export your complete dashboard configuration, applications, categories, and settings as JSON.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Export Backup</h4>
                    <p className="text-[11px] text-slate-500">
                      Download sanitized JSON configuration without user passwords.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Backup JSON</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Restore Backup</h4>
                    <p className="text-[11px] text-slate-500">
                      Upload previously exported backup to restore apps and layouts.
                    </p>
                    <input
                      type="file"
                      ref={importFileRef}
                      onChange={handleImportBackup}
                      accept=".json,application/json"
                      className="hidden"
                      id="admin-import-file-input"
                    />
                    <button
                      onClick={() => importFileRef.current?.click()}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Select JSON Backup File</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Docker & Reverse Proxy Guides */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                  <FileCode2 className="w-4 h-4 text-blue-500" />
                  <span>Docker & Reverse Proxy Deployment Reference</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Docker Run:</span>
                    <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto select-all">
                      docker run -d -p 3000:3000 -v /opt/linxdash/data:/app/data --name linxdash --restart unless-stopped linxdash:latest
                    </pre>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Nginx Reverse Proxy Config:</span>
                    <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto select-all">
{`location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. AUTOMATED TESTS TAB */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Automated Verification Suite
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Runs internal test assertions on auth isolation, SVG XSS sanitation, password hashing, and ETag caching.
                  </p>
                </div>
                <button
                  id="run-tests-button"
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                  <span>{isRunningTests ? 'Running Assertions...' : 'Execute Test Suite'}</span>
                </button>
              </div>

              {testResults && (
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      testResults.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {testResults.success ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">
                          {testResults.success ? 'All Test Assertions Passed' : 'Test Suite Failures Detected'}
                        </h4>
                        <p className="text-xs opacity-80">
                          {testResults.tests.length} tests executed against live backend runtime
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {testResults.tests.map((t, idx) => (
                      <div key={idx} className="p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {t.passed ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{t.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">{t.message}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            t.passed
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {t.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- EDIT / ADD APPLICATION MODAL --- */}
      {isAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingApp.id ? 'Edit Application' : 'Add New Application'}
              </h3>
              <button
                onClick={() => setIsAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingApp.name || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  placeholder="e.g. Grafana, Nextcloud"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination URL / UNC Share / File Path *
                </label>
                <input
                  type="text"
                  required
                  value={editingApp.url || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, url: e.target.value })}
                  placeholder="https://... or \\server\shared\folder or /local/path"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editingApp.description || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  placeholder="e.g. Monitoring & metrics dashboard"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Icon Selector Button */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Icon
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border p-1.5 flex items-center justify-center shrink-0"
                    style={{ borderColor: editingApp.accentColor }}
                  >
                    <AppIcon
                      icon={editingApp.icon || 'terminal'}
                      accentColor={editingApp.accentColor}
                      className="w-6 h-6"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsIconPickerOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Choose from 50+ Linux Icons or Upload</span>
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#E57000'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingApp({ ...editingApp, accentColor: color })}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          editingApp.accentColor === color ? 'scale-125 ring-2 ring-blue-500' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                  <input
                    type="color"
                    value={editingApp.accentColor || '#3B82F6'}
                    onChange={(e) => setEditingApp({ ...editingApp, accentColor: e.target.value })}
                    className="w-7 h-7 rounded-lg border cursor-pointer p-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Options & Status */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingApp.isEnabled !== false}
                    onChange={(e) => setEditingApp({ ...editingApp, isEnabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Enable Button on Public Dashboard (Uncheck to temporarily hide)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingApp.openInNewTab !== false}
                    onChange={(e) => setEditingApp({ ...editingApp, openInNewTab: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Open in new browser tab when clicked
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT / ADD USER MODAL --- */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
              {editingUser.id ? 'Edit User' : 'Create User'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={editingUser.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {editingUser.id ? 'New Password (Leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser.id}
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select
                  value={editingUser.role || 'private_user'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="private_user">Private User (Standard Services View)</option>
                  <option value="admin">Administrator (Full Access Control Panel)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="user-active-checkbox"
                  checked={editingUser.isActive !== false}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="user-active-checkbox" className="font-semibold text-slate-700 dark:text-slate-300">
                  Account Active & Allowed to Sign In
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ICON PICKER MODAL --- */}
      {isIconPickerOpen && editingApp && (
        <IconPickerModal
          currentIcon={editingApp.icon || 'terminal'}
          onSelectIcon={(newIcon) => setEditingApp({ ...editingApp, icon: newIcon })}
          onClose={() => setIsIconPickerOpen(false)}
        />
      )}
    </div>
  );
};
