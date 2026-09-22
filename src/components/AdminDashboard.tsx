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
  X,
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
  FileText,
  Folder,
  Archive,
  FileArchive,
  FolderArchive,
  PackageCheck,
  AlertCircle,
  LayoutGrid,
  List,
  Tag,
  ShieldCheck,
  Link2,
  FileSpreadsheet,
  FileJson,
  AlertTriangle,
  RotateCcw,
  Save
} from 'lucide-react';
import {
  Application,
  Category,
  User,
  SystemSettings,
  SystemStats,
  SystemInfo,
  AuditLog,
  ThemeMode,
  UploadedBackground,
  BackupItem,
  BackupInspection,
  ActivityStats,
  APP_VERSION
} from '../types';
import { api, setStoredToken } from '../lib/api';
import { toPersianDigits, formatPersianDate, formatBytes } from '../lib/utils';
import { updateFaviconAndTitle } from '../lib/favicon';
import { AppIcon } from './AppIcon';
import { IconPickerModal } from './IconPickerModal';
import { ThemeToggle } from './ThemeToggle';
import { BgThemePicker } from './BgThemePicker';
import { getStoredBgTheme, setStoredBgTheme } from '../lib/bgThemes';
import { HostTelemetryBar } from './HostTelemetryBar';
import { DashboardSwitcher } from './DashboardSwitcher';
import { AnalogClock } from './AnalogClock';
import { TelemetryDashboard } from './TelemetryDashboard';
import { AdminConsoleBackground, AdminBgStyle } from './AdminConsoleBackground';
import {
  exportToExcel,
  parseExcelFile,
  downloadExcelTemplate,
  exportToJson,
  parseJsonFile,
  ParsedBackupResult
} from '../lib/excelBackup';
import { ImportPreviewModal } from './ImportPreviewModal';

interface AdminDashboardProps {
  currentUser: { id: string; username: string; role: string };
  onLogout: () => void;
  onNavigateHome: () => void;
  theme: ThemeMode;
  onThemeToggle: (theme: ThemeMode) => void;
}

type AdminTab = 'overview' | 'applications' | 'categories' | 'users' | 'appearance' | 'logs' | 'system';

const AdminDigitalClock: React.FC = () => {
  const [timeStr, setTimeStr] = useState(() =>
    toPersianDigits(
      new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    )
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(
        toPersianDigits(
          new Date().toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        )
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs tracking-wider">{timeStr}</span>;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateHome,
  theme,
  onThemeToggle
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [bgThemeId, setBgThemeId] = useState<string>(() => getStoredBgTheme());
  const [adminBgStyle, setAdminBgStyle] = useState<AdminBgStyle>(() => {
    return (localStorage.getItem('homelab_admin_bg_style') as AdminBgStyle) || 'blueprint';
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleAdminBgStyleChange = (style: AdminBgStyle) => {
    setAdminBgStyle(style);
    localStorage.setItem('homelab_admin_bg_style', style);
  };

  const handleBgThemeChange = (newThemeId: string) => {
    setBgThemeId(newThemeId);
    setStoredBgTheme(newThemeId);
  };
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
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(Partial<User> & { password?: string }) | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerInitialTab, setIconPickerInitialTab] = useState<'builtin' | 'upload'>('builtin');
  const iconDirectInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingIconDirect, setIsUploadingIconDirect] = useState(false);
  const [isIconSectionDragOver, setIsIconSectionDragOver] = useState(false);

  // Backup & Activity States
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [backupsDir, setBackupsDir] = useState<string>('./data/backups');
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState<string | null>(null);
  const [isUploadingBackup, setIsUploadingBackup] = useState(false);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);

  // Logo file ref, background file ref & backup ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const excelImportRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const zipBackupInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    fileType: 'excel' | 'json';
    fileName: string;
    parsed: ParsedBackupResult;
  } | null>(null);
  const [isApplyingImport, setIsApplyingImport] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [wipeUploadsOnReset, setWipeUploadsOnReset] = useState(false);
  const appDocumentInputRef = useRef<HTMLInputElement>(null);
  const quickPdfInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAppDoc, setIsUploadingAppDoc] = useState(false);
  const [isQuickUploadingPdf, setIsQuickUploadingPdf] = useState(false);
  const [isDocDragOver, setIsDocDragOver] = useState(false);
  const [serverDocsModalOpen, setServerDocsModalOpen] = useState(false);
  const [serverDocsList, setServerDocsList] = useState<Array<{ filename: string; url: string; size: number; createdAt: string; ext: string }>>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [appDestType, setAppDestType] = useState<'url' | 'file'>('url');
  const [isModalUrlCopied, setIsModalUrlCopied] = useState(false);

  const openAppEditModal = (app?: Application) => {
    setIsModalUrlCopied(false);
    if (app) {
      const isFile = Boolean(app.fileUrl || (app.url && (app.url.startsWith('/uploads/') || app.url.toLowerCase().endsWith('.pdf'))));
      setAppDestType(isFile ? 'file' : 'url');
      setEditingApp({
        ...app,
        fileUrl: app.fileUrl || (isFile ? app.url : undefined),
        fileName: app.fileName || (isFile ? app.url.split('/').pop() : undefined)
      });
    } else {
      setEditingApp({
        name: '',
        description: '',
        url: '',
        categoryId: categories[0]?.id || 'cat-general',
        icon: 'terminal',
        isPublic: true,
        dashboards: ['public', 'it_staff', 'admin'],
        isEnabled: true,
        sortOrder: applications.length + 1,
        accentColor: '#3B82F6',
        openInNewTab: true
      });
      setAppDestType('url');
    }
    setIsAppModalOpen(true);
  };

  const handleDirectIconUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingIconDirect(true);
    try {
      const res = await api.uploadIcon(file);
      if (res.success && res.iconUrl) {
        setEditingApp((prev) => (prev ? { ...prev, icon: res.iconUrl } : null));
        showNotification('تصویر آیکون (PNG شفاف / JPG) با موفقیت بارگذاری و جایگزین شد');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری تصویر آیکون');
    } finally {
      setIsUploadingIconDirect(false);
      if (iconDirectInputRef.current) {
        iconDirectInputRef.current.value = '';
      }
    }
  };

  // Filter query in applications list
  const [appSearch, setAppSearch] = useState('');
  const [appDashboardFilter, setAppDashboardFilter] = useState<'all' | 'public' | 'it_staff' | 'admin'>('all');
  const [appCategoryFilter, setAppCategoryFilter] = useState<string>('all');
  const [appsViewMode, setAppsViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  const handleCopyAppUrl = async (app: Application, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = app.fileUrl || app.url;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAppId(app.id);
      setTimeout(() => setCopiedAppId(null), 2000);
      showNotification(`آدرس یا مسیر «${app.name}» کپی شد.`);
    } catch {
      // fallback
    }
  };

  const handleCopyModalUrl = async () => {
    const targetUrl = (appDestType === 'file' ? (editingApp?.fileUrl || editingApp?.url) : editingApp?.url)?.trim();
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setIsModalUrlCopied(true);
      showNotification('آدرس در حافظه موقت (کلیپ‌بورد) کپی شد.');
      setTimeout(() => setIsModalUrlCopied(false), 2200);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = targetUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setIsModalUrlCopied(true);
        showNotification('آدرس در حافظه موقت کپی شد.');
        setTimeout(() => setIsModalUrlCopied(false), 2200);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

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
        if (overviewRes.value.activity) {
          setActivityStats(overviewRes.value.activity);
        }
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

  const loadBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const res = await api.listBackups();
      setBackups(res.backups);
      if (res.backupsDir) {
        setBackupsDir(res.backupsDir);
      }
    } catch (err: any) {
      console.error('Failed to load backups:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    loadData();
    loadBackups();
  }, []);

  // Synchronize browser tab favicon and independent tab title
  useEffect(() => {
    if (settings) {
      updateFaviconAndTitle(settings.logoUrl, settings.tabTitle || 'پورتال شیراز');
    }
  }, [settings?.logoUrl, settings?.tabTitle]);

  // --- ZIP Backup Handlers ---
  const [inspectingBackup, setInspectingBackup] = useState<BackupInspection | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState<string | null>(null);
  const [inspectionFilter, setInspectionFilter] = useState<'all' | 'documents' | 'icons' | 'data'>('all');
  const [inspectionSearch, setInspectionSearch] = useState('');

  const handleInspectBackup = async (filename: string) => {
    setIsLoadingInspection(filename);
    try {
      const data = await api.inspectBackup(filename);
      setInspectingBackup(data);
      setInspectionFilter('all');
      setInspectionSearch('');
    } catch (err: any) {
      setError(err.message || 'خطا در بررسی فایل پشتیبان ZIP');
    } finally {
      setIsLoadingInspection(null);
    }
  };

  const handleCreateZipBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const res = await api.createBackup();
      const filesCount = res.stats?.uploadsCount || 0;
      const buttonDocs = res.stats?.buttonFilesCount || 0;
      const docMsg = buttonDocs > 0 ? ` و ${toPersianDigits(buttonDocs)} سند پیوست دکمه` : '';
      showNotification(`نسخه پشتیبان کامل ZIP با موفقیت ایجاد شد (${toPersianDigits(res.stats?.applicationsCount || applications.length)} دکمه، ${toPersianDigits(filesCount)} فایل/آیکون${docMsg}).`);
      await loadBackups();
    } catch (err: any) {
      setError(err.message || 'خطا در ایجاد نسخه پشتیبان ZIP');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreZipBackup = async (filename: string) => {
    if (!window.confirm(`آیا از بازگردانی نسخه «${filename}» اطمینان دارید؟ تمام داده‌ها، تنظیمات و فایل‌های فعلی با این نسخه بازنویسی می‌شوند.`)) {
      return;
    }
    setIsRestoringBackup(filename);
    try {
      await api.restoreBackup(filename);
      showNotification('نسخه پشتیبان با موفقیت بازگردانی شد! صفحه تازه‌سازی می‌شود...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'خطا در بازیابی نسخه پشتیبان');
      setIsRestoringBackup(null);
    }
  };

  const handleUploadZipBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('آیا از آپلود و بازیابی فوری این فایل پشتیبان ZIP اطمینان دارید؟ تمام داده‌های فعلی جایگزین خواهند شد.')) {
      if (zipBackupInputRef.current) zipBackupInputRef.current.value = '';
      return;
    }

    setIsUploadingBackup(true);
    try {
      await api.uploadAndRestoreBackup(file);
      showNotification('فایل پشتیبان با موفقیت آپلود و بازیابی شد! صفحه تازه‌سازی می‌شود...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود و بازیابی فایل پشتیبان ZIP');
    } finally {
      setIsUploadingBackup(false);
      if (zipBackupInputRef.current) zipBackupInputRef.current.value = '';
    }
  };

  const handleDeleteZipBackup = async (filename: string) => {
    if (!window.confirm(`آیا از حذف دائمی نسخه پشتیبان «${filename}» اطمینان دارید؟`)) return;
    try {
      await api.deleteBackup(filename);
      showNotification('نسخه پشتیبان با موفقیت حذف شد.');
      setBackups(prev => prev.filter(b => b.filename !== filename));
    } catch (err: any) {
      setError(err.message || 'خطا در حذف نسخه پشتیبان');
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetDatabase({ wipeUploads: wipeUploadsOnReset });
      if (res.success) {
        showNotification('کلیه داده‌های برنامه‌ها و دسته‌ها پاک شدند و تنظیمات ریست شد. اکنون می‌توانید با یکی از ۳ فایل اطلاعات را برگردانید.');
        setShowResetConfirmModal(false);
        await loadData();
        await loadBackups();
      } else {
        setError(res.message || 'خطا در بازنشانی پایگاه‌داده');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور جهت ریست دیتابیس');
    } finally {
      setIsResetting(false);
    }
  };

  const handleUploadAppDocument = async (fileOrEvent: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    } else if (fileOrEvent?.target?.files?.[0]) {
      file = fileOrEvent.target.files[0];
    }
    if (!file || !editingApp) return;

    setIsUploadingAppDoc(true);
    try {
      const res = await api.uploadDocument(file);
      showNotification(`فایل «${res.originalName}» با موفقیت در سرور ذخیره شد و پیوند آن تنظیم گردید.`);

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let suggestedIcon = editingApp.icon || 'FileText';
      let suggestedColor = editingApp.accentColor || '#3B82F6';

      if (['pdf'].includes(ext)) {
        suggestedIcon = 'FileText';
        suggestedColor = '#EF4444'; // PDF Crimson Red
      } else if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext)) {
        suggestedIcon = 'Image';
        suggestedColor = '#10B981';
      } else if (['mp4', 'mkv', 'webm', 'mov'].includes(ext)) {
        suggestedIcon = 'Film';
        suggestedColor = '#8B5CF6';
      } else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
        suggestedIcon = 'Music';
        suggestedColor = '#EC4899';
      } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
        suggestedIcon = 'Archive';
        suggestedColor = '#F59E0B';
      } else if (['json', 'yaml', 'yml', 'xml', 'txt', 'md'].includes(ext)) {
        suggestedIcon = 'FileCode2';
        suggestedColor = '#06B6D4';
      }

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').replace(/-/g, ' ');
      const appName = editingApp.name?.trim() ? editingApp.name : cleanName;
      const appDesc = editingApp.description?.trim()
        ? editingApp.description
        : ext === 'pdf'
        ? 'سند PDF ذخیره شده روی سرور'
        : `فایل ${ext.toUpperCase()} ذخیره شده روی سرور`;

      setEditingApp({
        ...editingApp,
        url: res.url,
        fileUrl: res.url,
        fileName: file.name,
        openInNewTab: true,
        name: appName,
        description: appDesc,
        icon: suggestedIcon,
        accentColor: suggestedColor
      });
      setAppDestType('file');
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود فایل');
    } finally {
      setIsUploadingAppDoc(false);
      setIsDocDragOver(false);
      if (appDocumentInputRef.current) appDocumentInputRef.current.value = '';
    }
  };

  const handleQuickCreatePdfApp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsQuickUploadingPdf(true);
    try {
      const res = await api.uploadDocument(file);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isPdf = ext === 'pdf';
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').replace(/-/g, ' ');

      const newAppPayload = {
        name: cleanName || 'سند PDF جدید',
        description: isPdf ? 'سند PDF ذخیره شده در سرور (باز شدن مستقیم با ۱ کلیک)' : `فایل ${ext.toUpperCase()} در سرور`,
        url: res.url,
        fileUrl: res.url,
        fileName: file.name,
        categoryId: categories[0]?.id || 'cat-infra',
        icon: isPdf ? 'FileText' : 'FileCode2',
        isPublic: true,
        dashboards: ['public', 'admin'],
        isEnabled: true,
        sortOrder: applications.length + 1,
        accentColor: isPdf ? '#EF4444' : '#3B82F6',
        openInNewTab: true,
        tags: ['pdf', 'document', 'server-file']
      };

      const created = await api.createApplication(newAppPayload as any);
      setApplications((prev) => [...prev, created]);
      showNotification(`دکمه جدید برای فایل «${cleanName}» ذخیره شد و در صفحه اصلی آماده باز شدن با ۱ کلیک است.`);
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود و ساخت دکمه PDF');
    } finally {
      setIsQuickUploadingPdf(false);
      if (quickPdfInputRef.current) quickPdfInputRef.current.value = '';
    }
  };

  const handleCreateAppFromDoc = async (doc: { filename: string; url: string; ext: string }) => {
    try {
      const isPdf = doc.ext === 'pdf';
      const cleanTitle = doc.filename
        .replace(/^doc-/, '')
        .replace(/-[a-f0-9]{8}\.[^.]+$/, '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

      const newAppPayload = {
        name: cleanTitle || 'سند سرور',
        description: isPdf ? 'سند PDF ذخیره شده در سرور (باز شدن مستقیم با ۱ کلیک)' : `فایل ${doc.ext.toUpperCase()} در سرور`,
        url: doc.url,
        fileUrl: doc.url,
        fileName: doc.filename,
        categoryId: categories[0]?.id || 'cat-infra',
        icon: isPdf ? 'FileText' : 'FileCode2',
        isPublic: true,
        dashboards: ['public', 'admin'],
        isEnabled: true,
        sortOrder: applications.length + 1,
        accentColor: isPdf ? '#EF4444' : '#3B82F6',
        openInNewTab: true,
        tags: ['pdf', 'document']
      };

      const created = await api.createApplication(newAppPayload as any);
      setApplications((prev) => [...prev, created]);
      setServerDocsModalOpen(false);
      showNotification(`دکمه جدید «${cleanTitle}» در داشبورد ایجاد گردید.`);
    } catch (err: any) {
      setError(err.message || 'خطا در ساخت دکمه');
    }
  };

  const loadServerDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await api.listDocuments();
      setServerDocsList(docs);
    } catch {
      // Ignore
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleOpenServerDocsModal = () => {
    setServerDocsModalOpen(true);
    loadServerDocs();
  };

  const handleSelectDocForApp = (doc: { filename: string; url: string; ext: string }) => {
    if (!editingApp) return;
    let suggestedIcon = editingApp.icon || 'FileText';
    if (['pdf'].includes(doc.ext)) suggestedIcon = 'FileText';
    else if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(doc.ext)) suggestedIcon = 'Image';
    else if (['mp4', 'mkv', 'webm', 'mov'].includes(doc.ext)) suggestedIcon = 'Film';
    else if (['mp3', 'wav', 'ogg', 'flac'].includes(doc.ext)) suggestedIcon = 'Music';
    else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(doc.ext)) suggestedIcon = 'Archive';
    else if (['json', 'yaml', 'yml', 'xml', 'txt', 'md'].includes(doc.ext)) suggestedIcon = 'FileCode2';

    const cleanTitle = doc.filename
      .replace(/^doc-/, '')
      .replace(/-[a-f0-9]{8}\.[^.]+$/, '')
      .replace(/_/g, ' ');

    setEditingApp({
      ...editingApp,
      url: doc.url,
      fileUrl: doc.url,
      fileName: doc.filename,
      openInNewTab: true,
      name: editingApp.name?.trim() ? editingApp.name : cleanTitle,
      icon: suggestedIcon
    });
    setAppDestType('file');
    setServerDocsModalOpen(false);
    showNotification(`فایل «${doc.filename}» برای این کارت انتخاب شد.`);
  };

  const handleDeleteServerDoc = async (filename: string) => {
    if (!window.confirm(`آیا از حذف فایل «${filename}» از سرور اطمینان دارید؟`)) return;
    try {
      await api.deleteDocument(filename);
      setServerDocsList((prev) => prev.filter((d) => d.filename !== filename));
      showNotification(`فایل «${filename}» با موفقیت حذف گردید.`);
    } catch (err: any) {
      setError(err.message || 'خطا در حذف فایل');
    }
  };

  // --- Application Handlers ---
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editingApp.name?.trim()) {
      setError('لطفاً نام دکمه را وارد نمایید');
      return;
    }

    const isFileMode = appDestType === 'file';
    const destination = (isFileMode
      ? (editingApp.fileUrl || editingApp.url)
      : editingApp.url)?.trim();

    if (!destination) {
      setError(isFileMode ? 'لطفاً فایل را آپلود یا انتخاب نمایید' : 'لطفاً آدرس اینترنتی یا مسیر شبکه را وارد نمایید');
      return;
    }

    const isDestFile = isFileMode || destination.startsWith('/uploads/') || destination.toLowerCase().endsWith('.pdf');
    const finalFileUrl = isDestFile ? destination : undefined;
    const finalFileName = isDestFile
      ? (editingApp.fileName || destination.split('/').pop())
      : undefined;

    const appPayload = {
      ...editingApp,
      name: editingApp.name.trim(),
      url: destination,
      fileUrl: finalFileUrl,
      fileName: finalFileName,
      categoryId: editingApp.categoryId || categories[0]?.id || 'cat-general'
    };

    try {
      if (editingApp.id) {
        await api.updateApplication(editingApp.id, appPayload);
        showNotification(`دکمه «${editingApp.name}» به‌روزرسانی شد`);
      } else {
        await api.createApplication(appPayload);
        showNotification(`دکمه «${editingApp.name}» ایجاد شد`);
      }
      setIsAppModalOpen(false);
      setEditingApp(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره‌سازی دکمه');
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف برنامه «${name}» اطمینان دارید؟`)) return;
    try {
      await api.deleteApplication(id);
      showNotification(`برنامه «${name}» حذف شد`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف برنامه');
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
      showNotification('ترتیب جدید برنامه‌ها ذخیره شد');
    } catch (err: any) {
      setError(err.message || 'خطا در تغییر چیدمان برنامه‌ها');
      loadData();
    }
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) {
      setError('لطفاً نام دسته‌بندی را وارد نمایید');
      return;
    }

    try {
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, editingCategory);
        showNotification(`دسته‌بندی «${editingCategory.name}» به‌روزرسانی شد`);
      } else {
        await api.createCategory({
          ...editingCategory,
          sortOrder: categories.length + 1
        });
        showNotification(`دسته‌بندی «${editingCategory.name}» با موفقیت ایجاد شد`);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره دسته‌بندی');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف دسته‌بندی «${name}» اطمینان دارید؟ برنامه‌های این دسته به دسته‌بندی عمومی منتقل می‌شوند.`)) return;
    try {
      await api.deleteCategory(id);
      showNotification(`دسته‌بندی «${name}» حذف شد`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف دسته‌بندی');
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    setCategories(newCats);
    try {
      await api.reorderCategories(newCats.map((c) => c.id));
      showNotification('ترتیب جدید اولویت دسته‌بندی‌ها ذخیره شد');
    } catch (err: any) {
      setError(err.message || 'خطا در تغییر اولویت دسته‌بندی‌ها');
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
        showNotification(`کاربر «${editingUser.username}» به‌روزرسانی شد`);
      } else {
        if (!editingUser.password) {
          setError('رمز عبور برای کاربر جدید الزامی است');
          return;
        }
        await api.createUser(editingUser as any);
        showNotification(`کاربر «${editingUser.username}» با موفقیت ایجاد شد`);
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره کاربر');
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!window.confirm(`آیا از حذف کاربر «${username}» اطمینان دارید؟`)) return;
    try {
      await api.deleteUser(id);
      showNotification(`کاربر «${username}» حذف شد`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف کاربر');
    }
  };

  // --- Settings & Logo Handlers ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      updateFaviconAndTitle(updated.logoUrl, updated.tabTitle || 'پورتال شیراز');
      showNotification('تنظیمات ظاهر، نام تب و هدر با موفقیت ذخیره شد');
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره تنظیمات');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadLogo(file);
      if (res.success) {
        setSettings((prev) => (prev ? { ...prev, logoUrl: res.logoUrl } : null));
        showNotification('لوگوی سرور با موفقیت بارگذاری شد');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری لوگو');
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await api.deleteLogo();
      setSettings((prev) => (prev ? { ...prev, logoUrl: null } : null));
      showNotification('لوگو حذف شد');
    } catch (err: any) {
      setError(err.message || 'خطا در حذف لوگو');
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
        showNotification('تصویر پس‌زمینه بارگذاری و به عنوان تصویر فعال انتخاب شد!');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری پس‌زمینه');
    } finally {
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const handleSelectUploadedBg = async (url: string) => {
    try {
      const updatedSettings = await api.selectBackground(url);
      setSettings(updatedSettings);
      showNotification('تصویر پس‌زمینه فعال داشبورد تغییر کرد');
    } catch (err: any) {
      setError(err.message || 'خطا در انتخاب پس‌زمینه');
    }
  };

  const handleDeleteUploadedBg = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف والپیپر «${name}» از کتابخانه اطمینان دارید؟`)) return;
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
        showNotification('تصویر از کتابخانه سرور حذف شد');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در حذف والپیپر');
    }
  };

  const handleDeleteBackground = async () => {
    try {
      await api.deleteBackground();
      setSettings((prev) => (prev ? { ...prev, backgroundUrl: null } : null));
      showNotification('تصویر پس‌زمینه ریست و به تم استاندارد بازگشت');
    } catch (err: any) {
      setError(err.message || 'خطا در حذف پس‌زمینه');
    }
  };

  // --- Excel & JSON Data Portability & Backup ---
  const handleExportExcel = () => {
    try {
      exportToExcel(
        { applications, categories, settings: settings || undefined },
        settings?.title ? settings.title.replace(/\s+/g, '_') : 'homelab'
      );
      showNotification(
        `خروجی اکسل با موفقیت ایجاد شد (${toPersianDigits(applications.length)} برنامه و ${toPersianDigits(categories.length)} دسته‌بندی)`
      );
    } catch (err: any) {
      setError(err.message || 'خطا در ایجاد خروجی اکسل');
    }
  };

  const handleDownloadExcelTemplate = () => {
    try {
      downloadExcelTemplate();
      showNotification('قالب آماده اکسل جهت ورود اطلاعات دانلود شد');
    } catch (err: any) {
      setError(err.message || 'خطا در دانلود قالب اکسل');
    }
  };

  const handleExportJson = () => {
    try {
      exportToJson(
        { applications, categories, settings: settings || undefined },
        settings?.title ? settings.title.replace(/\s+/g, '_') : 'homelab'
      );
      showNotification('نسخه پشتیبان JSON با موفقیت دریافت شد');
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت فایل JSON');
    }
  };

  const handleExportBackup = handleExportJson;

  const handleSelectExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelFile(file, categories);
      if (parsed.applications.length === 0 && parsed.categories.length === 0) {
        setError('هیچ برنامه یا دسته‌بندی معتبری در فایل اکسل یافت نشد. لطفاً از قالب استاندارد اکسل استفاده کنید.');
        return;
      }
      setImportPreview({
        fileType: 'excel',
        fileName: file.name,
        parsed
      });
    } catch (err: any) {
      setError('خطا در پردازش فایل اکسل: ' + (err.message || 'فرمت نامعتبر'));
    } finally {
      if (excelImportRef.current) excelImportRef.current.value = '';
    }
  };

  const handleSelectJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseJsonFile(text, categories);
        if (parsed.applications.length === 0 && parsed.categories.length === 0 && !parsed.settings) {
          setError('هیچ برنامه، دسته یا تنظیماتی در این فایل JSON شناسایی نشد.');
          return;
        }
        setImportPreview({
          fileType: 'json',
          fileName: file.name,
          parsed
        });
      } catch (err: any) {
        setError('فایل JSON نامعتبر است: ' + (err.message || 'ساختار داده خراب است'));
      }
    };
    reader.readAsText(file);
    if (jsonImportRef.current) jsonImportRef.current.value = '';
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleConfirmImport = async (mode: 'merge' | 'replace') => {
    if (!importPreview) return;
    setIsApplyingImport(true);

    try {
      const { parsed } = importPreview;
      let finalCategories: Category[] = [];
      let finalApplications: Application[] = [];

      if (mode === 'replace') {
        finalCategories = parsed.categories.length > 0 ? parsed.categories : categories;
        finalApplications = parsed.applications;
      } else {
        // Merge mode
        finalCategories = [...categories];
        parsed.categories.forEach((newCat) => {
          const existingIdx = finalCategories.findIndex(
            (c) => c.id === newCat.id || c.name.trim().toLowerCase() === newCat.name.trim().toLowerCase()
          );
          if (existingIdx >= 0) {
            finalCategories[existingIdx] = { ...finalCategories[existingIdx], ...newCat };
          } else {
            finalCategories.push(newCat);
          }
        });

        finalApplications = [...applications];
        parsed.applications.forEach((newApp) => {
          const existingIdx = finalApplications.findIndex(
            (a) => a.id === newApp.id || (a.name.trim().toLowerCase() === newApp.name.trim().toLowerCase() && a.url === newApp.url)
          );
          if (existingIdx >= 0) {
            finalApplications[existingIdx] = { ...finalApplications[existingIdx], ...newApp };
          } else {
            finalApplications.push({
              ...newApp,
              sortOrder: finalApplications.length + 1
            });
          }
        });
      }

      await api.importBackup({
        categories: finalCategories,
        applications: finalApplications,
        settings: parsed.settings
      });

      showNotification(
        `اطلاعات با موفقیت در سیستم ثبت شد (${toPersianDigits(parsed.stats.appsCount)} برنامه${
          parsed.stats.categoriesCount > 0 ? ` و ${toPersianDigits(parsed.stats.categoriesCount)} دسته` : ''
        })`
      );
      setImportPreview(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت اطلاعات وارد شده');
    } finally {
      setIsApplyingImport(false);
    }
  };

  const handleImportBackup = handleSelectJsonFile;

  // --- Audit Logs Handlers ---
  const handleClearAuditLogs = async () => {
    if (!window.confirm('آیا از پاک‌سازی دائمی تمام گزارشات لاگ و ورودهای سیستم اطمینان دارید؟')) return;
    setIsClearingLogs(true);
    try {
      await api.clearAuditLogs();
      setAuditLogs([]);
      showNotification('گزارشات لاگ با موفقیت پاک‌سازی شدند');
    } catch (err: any) {
      setError(err.message || 'خطا در پاک‌سازی لاگ‌ها');
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
    const matchesCategory =
      appCategoryFilter === 'all' || app.categoryId === appCategoryFilter;
    const q = appSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.url.toLowerCase().includes(q) ||
      (app.tags && app.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesDashboard && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen relative text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300" dir="rtl">
      {/* 0. Dedicated Admin Background Atmosphere */}
      <AdminConsoleBackground style={adminBgStyle} />

      {/* 0.5. Top Security & Admin Mode Indicator Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 shadow-sm z-40 sticky top-0" />

      {/* Top Admin Header - Concise, High-Utility, Clean */}
      <header className="sticky top-1.5 z-30 border-b border-indigo-200/80 dark:border-indigo-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Right Section: Brand & Title */}
        <div className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.title || 'لوگو'}
              className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] object-contain border-0 outline-none shadow-none bg-transparent select-none transition-transform duration-200 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xs text-white shrink-0">
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              {settings?.title || 'هوم‌لب لینوکس'}
            </h1>
            {settings?.subtitle && (
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                {settings.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Center: Quick Dashboard Switcher (Public / Admin) */}
        <div className="flex items-center justify-center">
          <DashboardSwitcher
            currentDashboard="admin"
            currentUser={currentUser}
            onNavigatePublic={onNavigateHome}
            onNavigateAdmin={() => {}}
            onOpenLogin={() => {}}
          />
        </div>

        {/* Left Section: Time, Themes & Compact User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Persian Date & Live Digital Clock (Compact & Useful) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/5 text-xs select-none">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {toPersianDigits(
                new Date().toLocaleDateString('fa-IR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })
              )}
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-mono">|</span>
            <AdminDigitalClock />
          </div>

          {/* Admin Background Theme Dropdown (Compact Icon Button) */}
          <div className="relative group">
            <button
              type="button"
              id="admin-bg-style-trigger"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/50 border border-slate-200/70 dark:border-white/5 transition-all cursor-pointer shadow-2xs"
              title="تغییر تم پس‌زمینه مدیریت"
            >
              <Palette className="w-4 h-4" />
            </button>
            <div className="absolute left-0 mt-1.5 w-52 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1">
                تم پس‌زمینه مدیریت:
              </div>
              {[
                { id: 'blueprint', label: 'شبکه سرور', icon: LayoutDashboard },
                { id: 'cyber-dark', label: 'فرماندهی تیره', icon: Server },
                { id: 'mesh-indigo', label: 'گرادیانت فیوژن', icon: Sparkles },
                { id: 'terminal', label: 'ترمینال مانیتورینگ', icon: Activity }
              ].map((styleOption) => {
                const Icon = styleOption.icon;
                const isSelected = adminBgStyle === styleOption.id;
                return (
                  <button
                    key={styleOption.id}
                    type="button"
                    onClick={() => handleAdminBgStyleChange(styleOption.id as AdminBgStyle)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{styleOption.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />

          {/* Unified Compact User Profile & Logout Chip */}
          <div className="flex items-center pl-1 pr-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mr-0 ml-1.5 animate-pulse" />
            <span className="font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate" title={currentUser.username}>
              {currentUser.username}
            </span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600 mx-1.5">•</span>
            <button
              id="admin-logout-button"
              onClick={onLogout}
              title="خروج از حساب"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Host Telemetry Bar */}
      {systemInfo && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-4">
          <HostTelemetryBar systemInfo={systemInfo} activity={activityStats || stats?.activity} />
        </div>
      )}

      {/* Main Admin Content with Vertical Sidebar on the Right */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 flex flex-col lg:flex-row gap-6 items-start">
        {/* 1. Vertical Sidebar on the Right (First child in RTL) */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20 z-20">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs space-y-2">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>منوی مدیریت</span>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                ۷ بخش
              </span>
            </div>

            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-1.5" dir="rtl">
              {[
                { id: 'overview', label: 'نمای کلی و آمار', icon: LayoutDashboard },
                { id: 'applications', label: 'برنامه‌ها و دکمه‌ها', icon: AppWindow, count: applications.length },
                { id: 'categories', label: 'دسته‌بندی‌ها و اولویت', icon: Folder, count: categories.length },
                { id: 'users', label: 'کاربران و دسترسی‌ها', icon: Users, count: users.length },
                { id: 'appearance', label: 'نام تب، هدر و ظاهر', icon: Palette },
                { id: 'logs', label: 'گزارش وقایع و لاگ‌ها', icon: ScrollText, count: auditLogs.length },
                { id: 'system', label: 'پشتیبان‌گیری و داکر', icon: SettingsIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`admin-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 mr-1.5 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {toPersianDigits(tab.count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Divider and Quick link to Public Homepage */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                id="admin-nav-to-public-btn"
                onClick={onNavigateHome}
                title="مشاهده و بازگشت به صفحه عمومی"
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>صفحه عمومی هوم‌لب</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 opacity-70 shrink-0" />
              </button>
            </div>
          </div>
        </aside>

        {/* 2. Main Admin Content Area (Left side in RTL) */}
        <main className="flex-1 min-w-0 w-full">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">کل دکمه‌ها</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                      {toPersianDigits(applications.length)}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {toPersianDigits(applications.filter(a => a.isEnabled !== false).length)} فعال
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">دسته‌بندی‌ها</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                      {toPersianDigits(categories.length)}
                    </span>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      مدیریت اولویت
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">کاربران فعال</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {toPersianDigits(activityStats?.activeUsers || stats?.activity?.activeUsers || 1)}
                    </span>
                    <span className="text-xs text-emerald-500 font-medium">فعال</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">بازدیدهای امروز</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                      {toPersianDigits(activityStats?.todayVisits || stats?.activity?.todayVisits || 0)}
                    </span>
                    <span className="text-xs text-slate-400">کلیک و بازدید</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">والپیپرها</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {toPersianDigits(settings.uploadedBackgrounds?.length || 0)} / {toPersianDigits(10)}
                    </span>
                    <span className="text-xs text-slate-400">آپلود شده</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">حساب‌ها</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                      {toPersianDigits(users.length)}
                    </span>
                    <span className="text-xs text-slate-400">کاربر</span>
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Dashboard: Active Sessions, Top 3 Used Apps & Daily Visits */}
              <TelemetryDashboard mode="admin" systemInfo={systemInfo} applications={applications} />

              {/* System Telemetry & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Diagnostics */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>محیط و زمان اجرای هاست</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      فعال و در حال اجرا
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">نسخه نود (Node)</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {systemInfo?.nodeVersion || 'v22.x'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">پلتفرم و معماری</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {systemInfo?.platform} ({systemInfo?.arch})
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">حافظه Heap مصرفی</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {systemInfo?.heapUsedMB || 0} مگابایت
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400">زمان فعالیت پردازه</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {Math.floor((systemInfo?.uptimeSeconds || 0) / 60)} دقیقه
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 sm:col-span-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-slate-400">مسیر ذخیره‌سازی داده‌ها</span>
                        {systemInfo?.isExternalDataDir ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            ✓ خارج از پوشه پروژه (ایمن در آپدیت)
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                            پوشه داخلی پروژه (./data)
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate" dir="ltr">
                        {systemInfo?.dataDir || systemInfo?.dbFile || './data/database.json'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">دسترسی‌های سریع</h3>
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
                      افزودن برنامه جدید
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      خروجی اکسل (.xlsx)
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-purple-500" />
                      خروجی پشتیبان JSON
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>

                  <button
                    onClick={handleCreateZipBackup}
                    disabled={isCreatingBackup}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-purple-500" />
                      {isCreatingBackup ? 'در حال ایجاد نسخه پشتیبان...' : 'تهیه نسخه پشتیبان کامل ZIP'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>فعالیت‌های اخیر و گزارشات ورود</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>مشاهده کامل لاگ‌ها</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </button>
                </div>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="pb-2 font-medium">زمان ثبت</th>
                        <th className="pb-2 font-medium">کاربر</th>
                        <th className="pb-2 font-medium">عملیات</th>
                        <th className="pb-2 font-medium">جزئیات</th>
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
                    <span>فهرست سریع اجرای برنامه‌ها</span>
                    <span className="text-xs text-slate-400 font-normal">({applications.length} کل)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>مدیریت همه برنامه‌ها</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
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
                          <p className="text-[10px] text-slate-400 truncate dir-ltr text-right">{app.url}</p>
                        </div>
                      </div>
                      <a
                        href={app.url}
                        target={app.openInNewTab ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 shrink-0 transition-colors"
                        title="اجرای برنامه"
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
              {/* Header bar with filters, view mode and Action Buttons */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="جستجو در نام، آدرس یا توضیحات دکمه..."
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <select
                      id="app-category-filter"
                      value={appCategoryFilter}
                      onChange={(e) => setAppCategoryFilter(e.target.value)}
                      className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">همه دسته‌بندی‌ها ({applications.length})</option>
                      {categories.map((cat) => {
                        const count = applications.filter((a) => a.categoryId === cat.id).length;
                        return (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({count})
                          </option>
                        );
                      })}
                    </select>

                    <select
                      id="app-dashboard-filter"
                      value={appDashboardFilter}
                      onChange={(e) => setAppDashboardFilter(e.target.value as any)}
                      className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">همه داشبوردها</option>
                      <option value="public">صفحه اصلی عمومی</option>
                      <option value="it_staff">پورتال همکاران IT</option>
                      <option value="admin">کنترل‌پنل مدیریت</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setAppsViewMode('cards')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          appsViewMode === 'cards'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                        title="نمای کارت‌های تفصیلی و بزرگ"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>کارت‌ها</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppsViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          appsViewMode === 'table'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                        title="نمای جدول داده‌ای پیشرفته"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>جدول</span>
                      </button>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={quickPdfInputRef}
                      onChange={handleQuickCreatePdfApp}
                      accept=".pdf,application/pdf"
                      className="hidden"
                      id="admin-quick-pdf-upload-input"
                    />

                    <button
                      type="button"
                      onClick={() => quickPdfInputRef.current?.click()}
                      disabled={isQuickUploadingPdf}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="آپلود مستقیم یک فایل PDF در سرور و ایجاد خودکار دکمه برای آن"
                    >
                      <FileText className={`w-4 h-4 ${isQuickUploadingPdf ? 'animate-bounce' : ''}`} />
                      <span>{isQuickUploadingPdf ? 'در حال ایجاد...' : 'آپلود سریع دکمه PDF'}</span>
                    </button>

                    <button
                      onClick={handleOpenServerDocsModal}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="مشاهده، آپلود و مدیریت فایل‌ها و اسناد PDF روی سرور"
                    >
                      <Folder className="w-4 h-4 text-amber-500" />
                      <span>اسناد و فایل‌های سرور</span>
                    </button>

                    <button
                      id="add-application-button"
                      onClick={() => openAppEditModal()}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن دکمه جدید</span>
                    </button>
                  </div>
                </div>

                {/* Subtitle / summary info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>تعداد دکمه‌های نمایش‌داده‌شده: <strong className="font-mono text-slate-800 dark:text-slate-200">{toPersianDigits(filteredApps.length)}</strong> از <strong className="font-mono text-slate-800 dark:text-slate-200">{toPersianDigits(applications.length)}</strong></span>
                    <span>•</span>
                    <span>فعال در پورتال: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{toPersianDigits(applications.filter(a => a.isEnabled).length)}</strong></span>
                    <span>•</span>
                    <span>اسناد PDF سرور: <strong className="font-mono text-rose-600 dark:text-rose-400">{toPersianDigits(applications.filter(a => a.fileUrl || a.url.toLowerCase().endsWith('.pdf') || a.url.includes('/uploads/documents/')).length)}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400">نکته: برای جابجایی ترتیب دکمه‌ها از فلش‌های بالا/پایین استفاده کنید.</span>
                </div>
              </div>

              {/* No items found */}
              {filteredApps.length === 0 && (
                <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <AppWindow className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">هیچ برنامه‌ای یافت نشد</h4>
                  <p className="text-xs text-slate-400 mt-1">با فیلترها یا عبارت جستجوی فعلی موردی پیدا نشد.</p>
                </div>
              )}

              {/* VIEW MODE 1: DETAILED CARDS GRID */}
              {appsViewMode === 'cards' && filteredApps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
                  {filteredApps.map((app, idx) => {
                    const appCategory = categories.find((c) => c.id === app.categoryId);
                    const isPdf = !!app.fileUrl || app.url.toLowerCase().endsWith('.pdf') || app.url.includes('/uploads/documents/');
                    const isUnc = app.url.startsWith('\\\\') || app.url.startsWith('//') || app.url.toLowerCase().startsWith('smb://');
                    const targetDest = app.fileUrl || app.url;

                    return (
                      <div
                        key={app.id}
                        className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                        style={{ borderTop: `3px solid ${app.accentColor || '#6366F1'}` }}
                      >
                        <div className="p-4 space-y-3.5 flex-1">
                          {/* Card Top: Icon, Title, Category & Sort */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border shrink-0 p-2 shadow-xs group-hover:scale-105 transition-transform"
                                style={{ borderColor: `${app.accentColor || '#6366F1'}60` }}
                              >
                                <AppIcon icon={app.icon} accentColor={app.accentColor || '#6366F1'} className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate" title={app.name}>
                                  {app.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                    <Folder className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{appCategory ? appCategory.name : 'عمومی'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Sort Order Badges & Buttons */}
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveApp(idx, 'up')}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-colors"
                                title="انتقال به بالا"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-1">
                                #{app.sortOrder}
                              </span>
                              <button
                                disabled={idx === filteredApps.length - 1}
                                onClick={() => handleMoveApp(idx, 'down')}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-colors"
                                title="انتقال به پایین"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Destination / Target Box */}
                          <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                            isPdf
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                              : isUnc
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className="inline-flex items-center gap-1 font-semibold text-[10px]">
                                {isPdf ? (
                                  <>
                                    <FileText className="w-3 h-3 text-rose-500" />
                                    <span>سند اختصاصی PDF سرور</span>
                                  </>
                                ) : isUnc ? (
                                  <>
                                    <HardDrive className="w-3 h-3 text-indigo-500" />
                                    <span>مسیر اشتراک شبکه داخلی (SMB / UNC)</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 text-blue-500" />
                                    <span>آدرس وب ({app.url.startsWith('https://') ? 'HTTPS امن' : 'HTTP'})</span>
                                  </>
                                )}
                              </span>

                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {app.openInNewTab ? '↗ باز شدن در زبانه جدید' : '→ باز شدن در همین زبانه'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 font-mono text-[11px] dir-ltr text-left overflow-hidden bg-white/60 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                              <span className="truncate flex-1 select-all" title={targetDest}>
                                {targetDest}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyAppUrl(app, e)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                title="کپی کردن آدرس یا مسیر مقصد"
                              >
                                {copiedAppId === app.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Description Section */}
                          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 min-h-[44px]">
                            {app.description ? (
                              <p className="line-clamp-2">{app.description}</p>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">بدون توضیحات ثبت‌شده</span>
                            )}
                          </div>

                          {/* Metadata Grid (Dashboards, Tags, Accent Color) */}
                          <div className="space-y-2 pt-1">
                            {/* Dashboards Badges */}
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="text-slate-400 text-[10px]">داشبوردها:</span>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {(!app.dashboards || app.dashboards.includes('public') || app.isPublic) && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50 text-[10px] font-medium">
                                    صفحه عمومی
                                  </span>
                                )}
                                {app.dashboards && app.dashboards.includes('it_staff') && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/50 text-[10px] font-medium">
                                    پورتال IT
                                  </span>
                                )}
                                {app.dashboards && app.dashboards.includes('admin') && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-medium">
                                    مدیریت
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Accent Color Dot & Code */}
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="text-slate-400 text-[10px]">رنگ دکمه:</span>
                              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                                <span
                                  className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-xs"
                                  style={{ backgroundColor: app.accentColor || '#3B82F6' }}
                                />
                                <span>{app.accentColor || '#3B82F6'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom / Action Bar */}
                        <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          {/* Status Visibility Switch */}
                          <button
                            type="button"
                            onClick={async () => {
                              await api.updateApplication(app.id, { isEnabled: !app.isEnabled });
                              loadData();
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              app.isEnabled
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                            title="کلیک برای فعال یا مخفی کردن این دکمه در پورتال"
                          >
                            {app.isEnabled ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px]">فعال (نمایش)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-400" />
                                <span className="text-[11px]">غیرفعال (مخفی)</span>
                              </>
                            )}
                          </button>

                          {/* Operations: Launch, Copy, Edit, Delete */}
                          <div className="flex items-center gap-1">
                            <a
                              href={targetDest}
                              target={app.openInNewTab ? '_blank' : '_self'}
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-xs transition-colors"
                              title="تست و اجرای مستقیم این برنامه / فایل"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => openAppEditModal(app)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                              title="ویرایش دکمه"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>ویرایش</span>
                            </button>

                            <button
                              onClick={() => handleDeleteApp(app.id, app.name)}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/40 dark:border-red-900/40 cursor-pointer transition-colors shadow-xs"
                              title="حذف کامل این برنامه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW MODE 2: ENRICHED ADVANCED DATA TABLE */}
              {appsViewMode === 'table' && filteredApps.length > 0 && (
                <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="p-3.5 font-medium whitespace-nowrap">ترتیب</th>
                          <th className="p-3.5 font-medium whitespace-nowrap">نام، آیکون و دسته‌بندی</th>
                          <th className="p-3.5 font-medium">توضیحات و برچسب‌ها</th>
                          <th className="p-3.5 font-medium">آدرس مقصد / فایل سرور</th>
                          <th className="p-3.5 font-medium whitespace-nowrap">داشبوردها</th>
                          <th className="p-3.5 font-medium whitespace-nowrap">وضعیت نمایش</th>
                          <th className="p-3.5 font-medium text-left whitespace-nowrap">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredApps.map((app, idx) => {
                          const appCategory = categories.find((c) => c.id === app.categoryId);
                          const isPdf = !!app.fileUrl || app.url.toLowerCase().endsWith('.pdf') || app.url.includes('/uploads/documents/');
                          const isUnc = app.url.startsWith('\\\\') || app.url.startsWith('//') || app.url.toLowerCase().startsWith('smb://');
                          const targetDest = app.fileUrl || app.url;

                          return (
                            <tr
                              key={app.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              {/* Order Buttons */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <button
                                    disabled={idx === 0}
                                    onClick={() => handleMoveApp(idx, 'up')}
                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer"
                                    title="انتقال به بالا"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    disabled={idx === filteredApps.length - 1}
                                    onClick={() => handleMoveApp(idx, 'down')}
                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer"
                                    title="انتقال به پایین"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-[10px] mr-1">
                                    #{app.sortOrder}
                                  </span>
                                </div>
                              </td>

                              {/* App Info & Category */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center border shrink-0 shadow-xs"
                                    style={{ borderColor: app.accentColor || '#6366F1' }}
                                  >
                                    <AppIcon icon={app.icon} accentColor={app.accentColor || '#6366F1'} className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{app.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                        <Folder className="w-2.5 h-2.5 text-slate-400" />
                                        <span>{appCategory ? appCategory.name : 'عمومی'}</span>
                                      </span>
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/10 dark:border-white/10"
                                        style={{ backgroundColor: app.accentColor || '#3B82F6' }}
                                        title={`رنگ دکمه: ${app.accentColor || '#3B82F6'}`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Description */}
                              <td className="p-3.5 max-w-xs">
                                {app.description ? (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{app.description}</p>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">بدون توضیحات</span>
                                )}
                              </td>

                              {/* Target URL / File */}
                              <td className="p-3.5 max-w-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    {isPdf ? (
                                      <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 text-[10px] font-semibold">
                                        PDF سرور
                                      </span>
                                    ) : isUnc ? (
                                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 text-[10px] font-semibold">
                                        شبکه SMB
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 text-[10px] font-semibold">
                                        وب
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400 dir-ltr text-right">
                                    <span className="truncate flex-1" title={targetDest}>{targetDest}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyAppUrl(app, e)}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                      title="کپی کردن آدرس"
                                    >
                                      {copiedAppId === app.id ? (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* Dashboards */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  {(!app.dashboards || app.dashboards.includes('public') || app.isPublic) && (
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">✓ صفحه عمومی</span>
                                  )}
                                  {app.dashboards && app.dashboards.includes('it_staff') && (
                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">✓ پورتال IT</span>
                                  )}
                                  {app.dashboards && app.dashboards.includes('admin') && (
                                    <span className="text-[10px] text-slate-500 font-medium">✓ مدیریت</span>
                                  )}
                                </div>
                              </td>

                              {/* Status Toggle */}
                              <td className="p-3.5 whitespace-nowrap">
                                <button
                                  onClick={async () => {
                                    await api.updateApplication(app.id, { isEnabled: !app.isEnabled });
                                    loadData();
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                                    app.isEnabled
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                                  }`}
                                  title="کلیک برای تغییر وضعیت نمایش در پورتال"
                                >
                                  {app.isEnabled ? (
                                    <>
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>فعال</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                      <span>مخفی</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 whitespace-nowrap text-left">
                                <div className="flex items-center gap-1 justify-end">
                                  <a
                                    href={targetDest}
                                    target={app.openInNewTab ? '_blank' : '_self'}
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="تست و باز کردن"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => openAppEditModal(app)}
                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    title="ویرایش دکمه"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteApp(app.id, app.name)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                    title="حذف برنامه"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">مدیریت دسته‌بندی‌ها و تعیین اولویت نمایش</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تعریف دسته‌های سفارشی برای برنامه‌ها و تنظیم ترتیب اولویت نمایش تب‌ها در صفحه عمومی
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory({
                      name: '',
                      icon: 'folder',
                      description: ''
                    });
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن دسته‌بندی جدید</span>
                </button>
              </div>

              {/* Categories Table */}
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="p-3.5 font-medium">اولویت نمایش</th>
                        <th className="p-3.5 font-medium">نام دسته‌بندی</th>
                        <th className="p-3.5 font-medium">توضیحات</th>
                        <th className="p-3.5 font-medium">تعداد برنامه‌ها</th>
                        <th className="p-3.5 font-medium text-left">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {categories.map((cat, idx) => {
                        const appCount = applications.filter((a) => a.categoryId === cat.id).length;
                        return (
                          <tr key={cat.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            {/* Priority Reorder */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => handleMoveCategory(idx, 'up')}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                  title="افزایش اولویت (انتقال به بالا)"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  disabled={idx === categories.length - 1}
                                  onClick={() => handleMoveCategory(idx, 'down')}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                  title="کاهش اولویت (انتقال به پایین)"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <span className="font-mono text-slate-400 text-[10px] mr-1">#{idx + 1}</span>
                              </div>
                            </td>

                            {/* Name & Icon */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shrink-0">
                                  <Folder className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{cat.name}</span>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="p-3.5 text-slate-500 dark:text-slate-400 max-w-sm truncate">
                              {cat.description || '—'}
                            </td>

                            {/* App Count */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {appCount} برنامه
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 whitespace-nowrap text-left space-x-1 space-x-reverse">
                              <button
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="ویرایش دسته‌بندی"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                title="حذف دسته‌بندی"
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
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">دسترسی کاربران و نقش‌ها</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    مدیریت مدیران سیستم و کاربران احراز هویت شده.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser({ username: '', role: 'admin', isActive: true, password: '' });
                    setIsUserModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن مدیر جدید</span>
                </button>
              </div>

              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="p-3.5 font-medium">نام کاربری</th>
                      <th className="p-3.5 font-medium">نقش کاربری</th>
                      <th className="p-3.5 font-medium">وضعیت حساب</th>
                      <th className="p-3.5 font-medium">تاریخ ایجاد</th>
                      <th className="p-3.5 font-medium">آخرین ورود</th>
                      <th className="p-3.5 font-medium text-left">عملیات</th>
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                            مدیر سیستم
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
                            {u.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px] dir-ltr text-right">
                          {new Date(u.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px] dir-ltr text-right">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fa-IR') : 'هرگز'}
                        </td>
                        <td className="p-3.5 text-left space-x-1 space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="ویرایش کاربر"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            disabled={currentUser.id === u.id}
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 cursor-pointer"
                            title="حذف کاربر"
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

          {/* 5. APPEARANCE & BRANDING TAB */}
          {activeTab === 'appearance' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Top Banner with Quick Save */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
                <div>
                  <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>تنظیمات نام تب مرورگر، عنوان هدر و ظاهر پورتال</span>
                  </h3>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                    نام تب مرورگر و متن هدر را به صورت مستقل ویرایش کنید.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره کلیه تغییرات</span>
                </button>
              </div>

              {/* Browser Tab Title (Independent from Header) */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>نام و عنوان تب مرورگر (Browser Tab Title)</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        مستقل از هدر
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      نامی که بالای مرورگر در تب (Tab) نمایش داده می‌شود. با تایپ و ذخیره، نام تب فوراً عوض می‌شود.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      متن عنوان تب مرورگر:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.tabTitle ?? ''}
                        onChange={(e) => {
                          const newTab = e.target.value;
                          setSettings({ ...settings, tabTitle: newTab });
                          // Live update tab in real-time while typing
                          updateFaviconAndTitle(settings.logoUrl, newTab.trim() || 'پورتال شیراز');
                        }}
                        placeholder="پورتال شیراز"
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!settings) return;
                          try {
                            const updated = await api.updateSettings(settings);
                            setSettings(updated);
                            updateFaviconAndTitle(updated.logoUrl, updated.tabTitle || 'پورتال شیراز');
                            showNotification('نام تب مرورگر با موفقیت ذخیره و اعمال شد');
                          } catch (err: any) {
                            setError(err.message || 'خطا در ذخیره نام تب');
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                      >
                        ذخیره نام تب
                      </button>
                    </div>
                  </div>

                  {/* Browser Tab Simulation Mockup */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      پیش‌نمایش زنده در نوار تب مرورگر:
                    </div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-t-xl bg-white dark:bg-slate-900 border-t border-x border-slate-300 dark:border-slate-700 shadow-xs max-w-full">
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Tab Favicon"
                          className="w-4 h-4 object-contain shrink-0"
                        />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {settings.tabTitle?.trim() || 'پورتال شیراز'}
                      </span>
                      <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold mr-2">
                        ×
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">پیش‌فرض‌های سریع:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newTab = 'پورتال شیراز';
                        setSettings({ ...settings, tabTitle: newTab });
                        updateFaviconAndTitle(settings.logoUrl, newTab);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      پورتال شیراز
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newTab = 'سامانه خدمات پورتال شیراز';
                        setSettings({ ...settings, tabTitle: newTab });
                        updateFaviconAndTitle(settings.logoUrl, newTab);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      سامانه خدمات پورتال شیراز
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newTab = 'مدیریت منابع انسانی ایران';
                        setSettings({ ...settings, tabTitle: newTab });
                        updateFaviconAndTitle(settings.logoUrl, newTab);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      مدیریت منابع انسانی ایران
                    </button>
                  </div>
                </div>
              </div>

              {/* Header Title (Two Lines Stacked) */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <span>عنوان هدر صفحه اصلی (دو سطری)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      عنوان هدر در دو بخش زیر هم در کنار لوگوی سیستم نمایش داده می‌شود.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      سطر اول هدر (عنوان اصلی)
                    </label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      placeholder="مثلاً: مدیریت منابع انسانی ایران"
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      سطر دوم هدر (دفتر / نمایندگی / زیرعنوان)
                    </label>
                    <input
                      type="text"
                      value={settings.subtitle || ''}
                      onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                      placeholder="مثلاً: دفتر نمایندگی مشهد"
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Live Font-Size & Style Preview */}
                <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">پیش‌نمایش در هدر:</span>
                  <div className="flex items-center gap-3">
                    {settings.logoUrl && (
                      <img
                        src={settings.logoUrl}
                        alt="Logo"
                        className="h-9 w-auto max-w-[80px] object-contain"
                      />
                    )}
                    <div className="text-right flex flex-col justify-center">
                      <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                        {settings.title?.trim() || 'مدیریت منابع انسانی ایران'}
                      </span>
                      {settings.subtitle?.trim() && (
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight mt-0.5">
                          {settings.subtitle.trim()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Management */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">لوگوی سیستم و هدر</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    آپلود فایل لوگوی شفاف با فرمت PNG، SVG یا WebP جهت نمایش یکپارچه در هر دو پنل (عمومی و مدیریت).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
                  <div className="w-28 h-28 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 flex items-center justify-center p-2 shadow-inner shrink-0 overflow-hidden relative">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain border-0 outline-none shadow-none bg-transparent"
                      />
                    ) : (
                      <Server className="w-10 h-10 text-indigo-500" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-right">
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
                        آپلود تصویر لوگو
                      </button>
                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteLogo}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          حذف لوگو
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      لوگوی شفاف (PNG یا SVG) بدون حاشیه در هدر هر دو پنل با ابعاد بزرگ و شفاف نمایش داده می‌شود.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dedicated Admin Console Background & Atmosphere */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>پوسته و پس‌زمینه اختصاصی صفحه مدیریت</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    برای تمایز کامل صفحه مدیریت از صفحه عمومی کاربران، یکی از پوسته‌های اختصاصی کنسول سرور را انتخاب نمایید:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'blueprint',
                      name: 'شبکه سرور (پیش‌فرض)',
                      desc: 'شبکه فنی مهندسی با هاله‌های آبی و بنفش سرور',
                      icon: LayoutDashboard
                    },
                    {
                      id: 'cyber-dark',
                      name: 'اتاق فرماندهی تیره',
                      desc: 'کنسول مدیریت تیره با ماتریس نقاط درخشان',
                      icon: Server
                    },
                    {
                      id: 'mesh-indigo',
                      name: 'گرادیانت فیوژن',
                      desc: 'ترکیب مدرن سرمه‌ای، بنفش و نورهای ملایم',
                      icon: Sparkles
                    },
                    {
                      id: 'terminal',
                      name: 'ترمینال مانیتورینگ',
                      desc: 'سبک مانیتورینگ سرور با نور زمردی ترمینال',
                      icon: Activity
                    }
                  ].map((bgItem) => {
                    const Icon = bgItem.icon;
                    const isSelected = adminBgStyle === bgItem.id;
                    return (
                      <button
                        key={bgItem.id}
                        type="button"
                        onClick={() => handleAdminBgStyleChange(bgItem.id as AdminBgStyle)}
                        className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-md'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              فعال
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{bgItem.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{bgItem.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Public Background Picture / Wallpaper Management */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>تصویر پس‌زمینه و والپیپر صفحه اصلی</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      تغییر تصویر پس‌زمینه داشبورد. یک والپیپر باکیفیت آپلود کنید یا از کتابخانه تصاویر سرور انتخاب نمایید.
                    </p>
                  </div>
                </div>

                {/* Current Background Preview Box */}
                <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-950/20 h-44 flex items-center justify-center">
                  {settings.backgroundUrl ? (
                    <>
                      <img
                        src={settings.backgroundUrl}
                        alt="پیش‌نمایش پس‌زمینه"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                          settings.backgroundBlur ? 'blur-xs scale-105' : ''
                        }`}
                      />
                      <div
                        className="absolute inset-0 bg-slate-950 transition-opacity"
                        style={{ opacity: (settings.backgroundOverlayOpacity ?? 30) / 100 }}
                      />
                      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-xs flex items-center gap-3">
                        <span className="font-semibold">تصویر پس‌زمینه فعال</span>
                        <button
                          type="button"
                          onClick={handleDeleteBackground}
                          className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          حذف والپیپر
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 p-4">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        پوسته پیش‌فرض بدون تصویر (پس‌زمینه ساده سیستم)
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
                        <span>کتابخانه والپیپرهای آپلود شده</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        امکان آپلود تا ۱۰ تصویر پس‌زمینه در سرور و انتخاب هرکدام به عنوان والپیپر فعال داشبورد.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold ${
                        (settings.uploadedBackgrounds?.length || 0) >= 10
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {settings.uploadedBackgrounds?.length || 0} از ۱۰ آپلود شده
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
                        <span>آپلود والپیپر ({(settings.uploadedBackgrounds?.length || 0)}/۱۰)</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Backgrounds Grid */}
                  {settings.uploadedBackgrounds && settings.uploadedBackgrounds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5">
                      {settings.uploadedBackgrounds.map((bg, idx) => {
                        const isActive = settings.backgroundUrl === bg.url;
                        const sizeKb = bg.sizeBytes ? Math.round(bg.sizeBytes / 1024) : 0;
                        const displayName = bg.originalName || bg.filename || `جایگاه والپیپر ${idx + 1}`;
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
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>فعال</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteUploadedBg(bg.id, displayName)}
                                className="absolute top-2 left-2 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="حذف از کتابخانه"
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
                                  {sizeKb > 0 ? `${sizeKb} کیلوبایت • ` : ''}جایگاه {idx + 1}
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
                                    <span>والپیپر فعال</span>
                                  </>
                                ) : (
                                  <span>انتخاب به عنوان والپیپر</span>
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
                        هنوز هیچ تصویر والپیپری آپلود نشده است (۰ از ۱۰ جایگاه استفاده شده).
                      </p>
                      <button
                        type="button"
                        onClick={() => bgInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>آپلود اولین تصویر والپیپر</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Reset or Clear Wallpaper Button */}
                {settings.backgroundUrl && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      والپیپر فعال کنونی: <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-xs dir-ltr inline-block">{settings.backgroundUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const updated = await api.updateSettings({ ...settings, backgroundUrl: null });
                          setSettings(updated);
                          showNotification('والپیپر با موفقیت حذف شد و به پوسته ساده تغییر یافت.');
                        } catch (err: any) {
                          setError(err.message || 'خطا در حذف والپیپر');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      حذف والپیپر (استفاده از رنگ ساده)
                    </button>
                  </div>
                )}

                {/* Direct Background URL Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    آدرس اینترنتی مستقیم تصویر (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/wallpaper.jpg"
                      value={settings.backgroundUrl || ''}
                      onChange={(e) => setSettings({ ...settings, backgroundUrl: e.target.value || null })}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dir-ltr text-right"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const updated = await api.updateSettings({ ...settings, backgroundUrl: settings.backgroundUrl });
                          setSettings(updated);
                          showNotification('آدرس تصویر پس‌زمینه با موفقیت اعمال شد.');
                        } catch (err: any) {
                          setError(err.message || 'خطا در اعمال آدرس پس‌زمینه');
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                    >
                      اعمال آدرس
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
                      <span>اعمال افکت بلور (مات‌سازی ملایم) روی والپیپر</span>
                    </label>
                    <p className="text-[11px] text-slate-400 pr-5">
                      مات‌سازی ملایم گوسی برای افزایش خوانایی و وضوح کارت‌ها و متون.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>شدت لایه تیرگی روی والپیپر (Dimming)</span>
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
                      تیره کردن تصویر برای کنتراست ایده‌آل عناصر با پس‌زمینه.
                    </p>
                  </div>
                </div>
              </div>

              {/* Clock & Layout */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">تنظیمات ساعت و چیدمان ستون‌ها</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      حالت نمایش ساعت
                    </label>
                    <select
                      value={settings.clockType}
                      onChange={(e) => setSettings({ ...settings, clockType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="analog">فقط ساعت عقربه‌ای (آنالوگ)</option>
                      <option value="digital">فقط ساعت دیجیتال</option>
                      <option value="both">هر دو (آنالوگ و دیجیتال)</option>
                      <option value="none">غیرفعال (بدون ساعت)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      پوسته پیش‌فرض
                    </label>
                    <select
                      value={settings.defaultTheme}
                      onChange={(e) => setSettings({ ...settings, defaultTheme: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="light">حالت روشن (پیش‌فرض)</option>
                      <option value="dark">حالت تیره (Dark Mode)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      تعداد ستون‌ها (دکمه‌های داشبورد)
                    </label>
                    <select
                      value={settings.gridColumns || 4}
                      onChange={(e) => setSettings({ ...settings, gridColumns: Number(e.target.value) as any })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value={2}>۲ ستون</option>
                      <option value={3}>۳ ستون</option>
                      <option value={4}>۴ ستون (پیش‌فرض)</option>
                      <option value={5}>۵ ستون</option>
                      <option value={6}>۶ ستون</option>
                      <option value={7}>۷ ستون</option>
                      <option value={8}>۸ ستون (فوق فشرده)</option>
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
                    <span>نمایش ثانیه‌شمار ساعت</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDate}
                      onChange={(e) => setSettings({ ...settings, showDate: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>نمایش تاریخ در هدر</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showTelemetryBar !== false}
                      onChange={(e) => setSettings({ ...settings, showTelemetryBar: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>نمایش نوار آمار سرور (پردازنده، حافظه، دیسک، آپتایم)</span>
                  </label>
                </div>

                {settings.showTelemetryBar !== false && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      موقعیت نوار وضعیت سرور:
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
                        <span>بالا (زیر هدر)</span>
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
                        <span>پایین (بالای فوتر)</span>
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
                  ذخیره تنظیمات ظاهر و والپیپر
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
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="جستجو در کاربر، عملیات، IP، جزئیات..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <select
                    value={logActionFilter}
                    onChange={(e) => setLogActionFilter(e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="all">همه انواع عملیات ({auditLogs.length})</option>
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
                        showNotification('فهرست گزارش‌های رویداد به‌روزرسانی شد.');
                      } catch (err: any) {
                        setError(err.message || 'خطا در تازه‌سازی گزارش‌ها');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تازه‌سازی</span>
                  </button>

                  <button
                    onClick={handleClearAuditLogs}
                    disabled={isClearingLogs || auditLogs.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isClearingLogs ? 'در حال پاک‌سازی...' : 'پاک‌سازی تاریخچه لاگ‌ها'}</span>
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="px-4 py-3 font-semibold">زمان ثبت</th>
                        <th className="px-4 py-3 font-semibold">کاربر</th>
                        <th className="px-4 py-3 font-semibold">نوع عملیات</th>
                        <th className="px-4 py-3 font-semibold">جزئیات رویداد</th>
                        <th className="px-4 py-3 font-semibold">آدرس IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                            <div className="max-w-xs mx-auto space-y-2">
                              <ScrollText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                              <p className="font-semibold text-slate-600 dark:text-slate-400">هیچ رویدادی یافت نشد</p>
                              <p className="text-[11px] text-slate-400">
                                تغییرات مدیریتی، ورود کاربران و پشتیبان‌گیری‌ها در اینجا ثبت می‌شوند.
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
                              <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap dir-ltr text-right">
                                {new Date(log.timestamp).toLocaleString('fa-IR')}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                                  {log.user}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight dir-ltr ${
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
                              <td className="px-4 py-3 text-[11px] font-mono text-slate-400 whitespace-nowrap dir-ltr text-right">
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
                    <span>نمایش {filteredAuditLogs.length} از {auditLogs.length} رویداد</span>
                    <span className="font-mono text-[10px]">محل نگهداری: ذخیره خودکار فایل‌های دائمی سیستم</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. SYSTEM & BACKUP TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Backup & Restore System */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Archive className="w-4 h-4 text-purple-500" />
                      <span>مدیریت فایل‌های پشتیبان کامل (ZIP Backup)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      پشتیبان‌گیری جامع شامل پایگاه‌داده، تصاویر، والپیپرها، کاربران و فایل‌های آپلودشده (حداکثر ۲۰ نسخه با چرخش خودکار).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={zipBackupInputRef}
                      onChange={handleUploadZipBackup}
                      accept=".zip,application/zip"
                      className="hidden"
                      id="admin-zip-upload-input"
                    />
                    <button
                      type="button"
                      disabled={isUploadingBackup}
                      onClick={() => zipBackupInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>{isUploadingBackup ? 'در حال آپلود و بازیابی...' : 'آپلود و بازگردانی فایل ZIP'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCreatingBackup}
                      onClick={handleCreateZipBackup}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingBackup ? 'در حال تهیه پشتیبان...' : 'ایجاد نسخه پشتیبان جدید'}</span>
                    </button>
                  </div>
                </div>

                {/* Storage Path Indicator */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <FolderArchive className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">مسیر ذخیره فایل‌های زیپ (ZIP):</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                            ✓ ذخیره‌سازی دائمی روی هاست (خارج از کانتینر)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          تمام نسخه‌های پشتیبان با نام پیشوند <code className="font-mono text-purple-600 dark:text-purple-400 font-bold">Backup-Homepage-*.zip</code> ذخیره می‌شوند.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-purple-200/50 dark:border-purple-900/30 text-[11px]">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-950">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">مسیر روی سیستم میزبان (هاست / خارج از داکر):</span>
                      <code className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 select-all" dir="ltr">
                        ./data/backups
                      </code>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-950">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">مسیر درون کانتینر داکر:</span>
                      <code className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 select-all" dir="ltr">
                        {backupsDir || '/app/data/backups'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Backups List Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <FileArchive className="w-4 h-4 text-purple-500" />
                      <span>فهرست نسخه‌های ذخیره‌شده</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                        {toPersianDigits(backups.length)} از ۲۰ نسخه مجاز
                      </span>
                    </div>

                    <button
                      onClick={loadBackups}
                      disabled={isLoadingBackups}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                      <span>تازه‌سازی لیست</span>
                    </button>
                  </div>

                  {backups.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Archive className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">هنوز نسخه پشتیبان ZIP ایجاد نشده است</p>
                      <p className="text-[11px] text-slate-400">
                        با فشردن دکمه «ایجاد نسخه پشتیبان جدید» اولین نسخه کامل را ذخیره کنید.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {backups.map((b) => {
                        const stats = b.stats || {} as any;
                        const appsCount = stats.applicationsCount ?? stats.appsCount ?? 0;
                        const catsCount = stats.categoriesCount ?? 0;
                        const usersCount = stats.usersCount ?? 0;
                        const uploadsCount = stats.uploadsCount ?? 0;
                        const buttonFilesCount = stats.buttonFilesCount ?? 0;
                        const buttonIconsCount = stats.buttonIconsCount ?? 0;
                        const hpTitle = stats.homepageTitle || 'Linux Services Hub';
                        const hpSubtitle = stats.subtitle || stats.homepageSubtitle;
                        const hasLogo = stats.hasCustomLogo;
                        const hasBg = stats.hasCustomBackground;
                        const bgCount = stats.uploadedBackgroundsCount ?? 0;

                        return (
                          <div
                            key={b.filename}
                            className="p-4 flex flex-col gap-3 hover:bg-white/90 dark:hover:bg-slate-900/90 transition-colors"
                          >
                            {/* File Header & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                                  <FileArchive className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100" dir="ltr">
                                      {b.filename}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60" dir="ltr">
                                      {formatBytes(b.size)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    زمان ایجاد: <span className="font-medium text-slate-600 dark:text-slate-300">{formatPersianDate(b.createdAt)}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleInspectBackup(b.filename)}
                                  disabled={isLoadingInspection === b.filename}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                                  title="مشاهده محتویات و لیست فایل‌های موجود در این نسخه"
                                >
                                  <Eye className={`w-3.5 h-3.5 ${isLoadingInspection === b.filename ? 'animate-spin' : ''}`} />
                                  <span>{isLoadingInspection === b.filename ? 'در حال بررسی...' : 'مشاهده فایل‌ها'}</span>
                                </button>

                                <a
                                  href={api.getBackupDownloadUrl(b.filename)}
                                  download={b.filename}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                  title="دانلود مستقیم فایل ZIP"
                                >
                                  <Download className="w-3.5 h-3.5 text-blue-500" />
                                  <span>دانلود</span>
                                </a>

                                <button
                                  onClick={() => handleRestoreZipBackup(b.filename)}
                                  disabled={isRestoringBackup === b.filename}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                  title="بازیابی این نسخه"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isRestoringBackup === b.filename ? 'animate-spin' : ''}`} />
                                  <span>{isRestoringBackup === b.filename ? 'در حال بازیابی...' : 'بازیابی'}</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteZipBackup(b.filename)}
                                  className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="حذف نسخه پشتیبان"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Detailed Statistics Box Directly Under the ZIP file */}
                            <div className="mt-1 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                                  <PackageCheck className="w-3.5 h-3.5 text-purple-500" />
                                  <span>آمار محتوای بسته‌بندی‌شده در این فایل زیپ:</span>
                                </span>
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                                  جامع و آماده بازیابی ۱۰۰٪
                                </span>
                              </div>

                              {/* Badges Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col">
                                  <span className="text-[10px] text-slate-400">دکمه‌ها / برنامه‌ها:</span>
                                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                                    {toPersianDigits(appsCount)} مورد
                                  </span>
                                </div>

                                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col">
                                  <span className="text-[10px] text-slate-400">دسته‌بندی‌ها:</span>
                                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-sm">
                                    {toPersianDigits(catsCount)} دسته
                                  </span>
                                </div>

                                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col">
                                  <span className="text-[10px] text-slate-400">اسناد پیوست دکمه‌ها:</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                    {toPersianDigits(buttonFilesCount)} سند
                                  </span>
                                </div>

                                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col">
                                  <span className="text-[10px] text-slate-400">عکس‌ها و آیکون‌های دکمه:</span>
                                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                                    {toPersianDigits(buttonIconsCount)} آیکون
                                  </span>
                                </div>

                                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col">
                                  <span className="text-[10px] text-slate-400">کل فایل‌ها و مدیا:</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                                    {toPersianDigits(uploadsCount)} فایل
                                  </span>
                                </div>

                                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col">
                                  <span className="text-[10px] text-slate-400">حساب‌های کاربری:</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-sm">
                                    {toPersianDigits(usersCount)} کاربر
                                  </span>
                                </div>
                              </div>

                              {/* Customization Details Row */}
                              <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">عنوان صفحه اول:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                                    {hpTitle}
                                  </span>
                                </div>

                                {hpSubtitle && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">زیرعنوان:</span>
                                    <span className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                                      {hpSubtitle}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400">لوگوی صفحه اول:</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    hasLogo
                                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {hasLogo ? '✓ لوگوی اختصاصی آپلودشده موجود است' : 'لوگوی پیش‌فرض سیستم'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400">والپیپر/پس‌زمینه:</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    hasBg
                                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {hasBg ? '✓ والپیپر اختصاصی فعال' : 'بدون والپیپر'}
                                  </span>
                                  {bgCount > 0 && (
                                    <span className="text-[10px] text-slate-400">
                                      ({toPersianDigits(bgCount)} تصویر در گالری)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Data Portability: Excel and JSON Import/Export Section */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        <span>انتقال، ورودی و خروجی داده‌ها (اکسل و JSON)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        استخراج یا ورود گروهی اطلاعات برنامه‌ها و دسته‌بندی‌ها به سادگی از طریق اکسل و فایل ساختاریافته JSON
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadExcelTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                      title="دانلود فایل نمونه اکسل جهت تکمیل و ورود"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>دانلود قالب آماده اکسل</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Excel Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/20 dark:from-emerald-950/30 dark:to-slate-900/40 border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                              اکسل (Excel / Spreadsheet)
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              فرمت‌های پشتیبانی‌شده: xlsx. و csv.
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          {toPersianDigits(applications.length)} برنامه
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        مدیریت و ویرایش گروهی، افزودن صدها سرویس به صورت یکجا، و ایجاد گزارش در نرم‌افزارهای اکسل و شیت‌ها.
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleExportExcel}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>خروجی اکسل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => excelImportRef.current?.click()}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>ورودی از اکسل</span>
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={excelImportRef}
                        onChange={handleSelectExcelFile}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        id="admin-excel-import-input"
                      />
                    </div>

                    {/* JSON Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-purple-100/20 dark:from-purple-950/30 dark:to-slate-900/40 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                            <FileJson className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                              جی‌سان (JSON ساختاریافته)
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              پشتیبان‌گیری سبک و سازگار با دیتابیس
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                          فوق‌سریع
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        استخراج تمام تنظیمات، دسته‌ها و برنامه‌ها در قالب یک فایل استاندارد متنی جهت انتقال مستقیم میان سرورها.
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleExportJson}
                          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>خروجی JSON</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => jsonImportRef.current?.click()}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>ورودی از JSON</span>
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={jsonImportRef}
                        onChange={handleSelectJsonFile}
                        accept=".json,application/json"
                        className="hidden"
                        id="admin-json-import-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Wipe & Factory Reset Section (Red Danger Button) */}
              <div className="p-5 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/60 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="font-bold text-sm text-red-900 dark:text-red-200 flex items-center gap-2">
                        <span>پاک‌سازی کامل داده‌ها و ریست دیتابیس (Reset & Wipe)</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 text-[10px] font-bold">
                          منطقه حساس
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-red-700/90 dark:text-red-300/80 leading-relaxed pr-10">
                      با زدن دکمه قرمز زیر و تأیید، کلیه برنامه‌ها و دسته‌بندی‌ها به طور کامل پاک شده و تنظیمات دیتابیس به حالت اولیه ریست می‌شود. پس از پاک‌سازی، پایگاه‌داده خالی شده و شما می‌توانید از طریق بارگذاری هر یک از ۳ فرمت فایل پشتیبان (فایل زیپ جامع ZIP، فایل اکسل XLSX، یا فایل JSON) کلیه تنظیمات و اطلاعات را بازگردانید.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setWipeUploadsOnReset(false);
                      setShowResetConfirmModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    id="admin-reset-database-button"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>پاک‌سازی داده‌ها و ریست دیتابیس</span>
                  </button>
                </div>
              </div>

              {/* Persistent Storage & Update Safety Guide */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>پیکربندی مسیر ذخیره‌سازی دائمی داده‌ها (Persistent Storage)</span>
                        {systemInfo?.isExternalDataDir ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                            ✓ ایمن در برابر آپدیت
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                            پوشه پیش‌فرض داخلی
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        با ذخیره داده‌ها در مسیری خارج از برنامه (مانند <code className="font-mono text-blue-600 dark:text-blue-400">/opt/homelab-data</code>)، با حذف، جایگزینی یا به‌روزرسانی کدهای پروژه، هیچ اطلاعاتی پاک نمی‌شود.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">مسیر فعال فعلی:</span>
                    <span className="font-mono text-xs text-slate-900 dark:text-slate-100 font-bold px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" dir="ltr">
                      {systemInfo?.dataDir || './data'}
                    </span>
                  </div>

                  <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                    {systemInfo?.isExternalDataDir ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ عالی! داده‌های شما در مسیری مجزا و پایدار ذخیره شده‌اند. می‌توانید با خیال راحت برنامه‌ها یا فایل‌های پروژه را آپدیت کنید.
                      </span>
                    ) : (
                      <span>
                        💡 در حال حاضر داده‌ها داخل پوشه خود برنامه ذخیره می‌شوند. برای فعال‌سازی ذخیره‌سازی دائمی، دستورات زیر را روی سرور اجرا کنید:
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">دستور فعال‌سازی پوشه مستقل در لینوکس (انتقال خودکار انجام می‌شود):</span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto select-all dir-ltr text-left leading-relaxed">
{`# 1. ایجاد پوشه با دسترسی لازم
sudo mkdir -p /opt/homelab-data && sudo chmod 777 /opt/homelab-data

# 2. تنظیم متغیر در فایل .env یا فایل .datadir
echo "DATA_DIR=/opt/homelab-data" >> .env
# یا: echo "/opt/homelab-data" > .datadir

# 3. راه‌اندازی مجدد برنامه (اطلاعات قبلی خودکار به مسیر جدید منتقل می‌شود)`}
                  </pre>
                </div>
              </div>

              {/* Docker & Reverse Proxy Guides */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                  <FileCode2 className="w-4 h-4 text-blue-500" />
                  <span>راهنمای استقرار با داکر و پروکسی معکوس (Nginx)</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">اجرا با داکر (Docker Run):</span>
                    <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto select-all dir-ltr text-left">
                      docker run -d -p 3000:3000 -v /opt/linxdash/data:/app/data --name linxdash --restart unless-stopped linxdash:latest
                    </pre>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">پیکربندی پروکسی معکوس Nginx:</span>
                    <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto select-all dir-ltr text-left">
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
        </main>
      </div>

      {/* --- EDIT / ADD APPLICATION MODAL --- */}
      {isAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="relative w-full max-w-xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs transition-colors"
                  style={{ backgroundColor: editingApp.accentColor || '#2563EB' }}
                >
                  <AppIcon icon={editingApp.icon || 'terminal'} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100 leading-tight">
                    {editingApp.id ? 'ویرایش دکمه' : 'افزودن دکمه جدید'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    تنظیم نام، نوار آدرس پیوند، دسته‌بندی و ظاهر کارت
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAppModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="بستن پنجره"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* 1. Basic Info Section */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-bold text-xs pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span>مشخصات و عنوان دکمه</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      نام دکمه <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingApp.name || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                      placeholder="مثال: Proxmox VE یا سامانه تدارکات"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      دسته‌بندی <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editingApp.categoryId || (categories[0]?.id ?? 'cat-general')}
                      onChange={(e) => setEditingApp({ ...editingApp, categoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-200 cursor-pointer transition-shadow"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    توضیح کوتاه (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={editingApp.description || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                    placeholder="توضیح مختصر عملکرد یا راهنما..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                  />
                </div>
              </div>

              {/* 2. Destination & Smart Address Bar */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-bold text-xs">
                    <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>عملکرد کلیک روی دکمه</span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-[11px] font-medium self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setAppDestType('url')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        appDestType === 'url'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>آدرس اینترنتی (URL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppDestType('file')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        appDestType === 'file'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>فایل PDF / سرور</span>
                    </button>
                  </div>
                </div>

                {/* THE SMART ADDRESS BAR (Visible in both URL and File mode) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {appDestType === 'url'
                        ? 'نوار آدرس اینترنتی یا مسیر شبکه:'
                        : 'نوار آدرس فایل روی سرور (قابل مشاهده و کپی):'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {appDestType === 'url' ? 'URL Destination' : 'Server File Path'}
                    </span>
                  </div>

                  <div className="relative flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all p-1">
                    {/* Leading indicator */}
                    <div className="px-2.5 py-1 text-slate-400 select-none shrink-0 flex items-center justify-center">
                      {appDestType === 'url' ? (
                        <Globe className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-rose-500" />
                      )}
                    </div>

                    {/* Address Text Input */}
                    <input
                      type="text"
                      value={(appDestType === 'file' ? (editingApp.fileUrl || editingApp.url) : editingApp.url) || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (appDestType === 'file') {
                          setEditingApp({ ...editingApp, url: val, fileUrl: val });
                        } else {
                          setEditingApp({ ...editingApp, url: val });
                        }
                      }}
                      placeholder={
                        appDestType === 'url'
                          ? 'https://example.com یا 192.168.1.100:8006'
                          : '/uploads/... (با آپلود یا انتخاب فایل تکمیل می‌شود)'
                      }
                      dir="ltr"
                      className="flex-1 bg-transparent border-0 px-2 py-1.5 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-left selection:bg-blue-500 selection:text-white"
                    />

                    {/* In-bar Actions: External Test link & Copy Button */}
                    <div className="flex items-center gap-1 shrink-0 pl-1">
                      {((appDestType === 'file' ? (editingApp.fileUrl || editingApp.url) : editingApp.url)?.trim()) && (
                        <a
                          href={(appDestType === 'file' ? (editingApp.fileUrl || editingApp.url) : editingApp.url)?.trim()}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="تست و باز کردن پیوند در برگه جدید"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyModalUrl}
                        disabled={!((appDestType === 'file' ? (editingApp.fileUrl || editingApp.url) : editingApp.url)?.trim())}
                        title="کپی کردن این آدرس در حافظه موقت (کلیپ‌بورد)"
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                          isModalUrlCopied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : ((appDestType === 'file' ? (editingApp.fileUrl || editingApp.url) : editingApp.url)?.trim())
                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isModalUrlCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>کپی شد!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی آدرس</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload Controls & Preview (Only when File mode is active) */}
                {appDestType === 'file' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={appDocumentInputRef}
                        onChange={handleUploadAppDocument}
                        accept=".pdf,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => appDocumentInputRef.current?.click()}
                        disabled={isUploadingAppDoc}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs active:scale-98"
                      >
                        <Upload className={`w-3.5 h-3.5 ${isUploadingAppDoc ? 'animate-bounce' : ''}`} />
                        <span>{isUploadingAppDoc ? 'در حال آپلود و ذخیره فایل...' : 'آپلود فایل جدید روی سرور'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenServerDocsModal}
                        className="py-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-500" />
                        <span>فایل‌های سرور</span>
                      </button>
                    </div>

                    {/* If a file is uploaded or linked, show card */}
                    {(editingApp.fileUrl || (editingApp.url && (editingApp.url.startsWith('/uploads/') || editingApp.url.toLowerCase().endsWith('.pdf')))) ? (
                      <div className="p-3 rounded-xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {editingApp.fileName || (editingApp.fileUrl || editingApp.url).split('/').pop()}
                            </p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              فایل روی سرور قرار دارد و آدرس آن در نوار بالا ثبت شده است
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={editingApp.fileUrl || editingApp.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors shadow-2xs"
                            title="مشاهده مستقیم فایل"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingApp({
                                ...editingApp,
                                fileUrl: undefined,
                                fileName: undefined,
                                url: ''
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
                            title="حذف فایل از دکمه"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        با آپلود فایل یا انتخاب از آرشیو سرور، آدرس فایل به صورت خودکار در نوار بالا قرار گرفته و می‌توانید آن را کپی نمایید.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Icon, Custom Image & Color Palette Section */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsIconSectionDragOver(true);
                }}
                onDragLeave={() => setIsIconSectionDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsIconSectionDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleDirectIconUpload(file);
                }}
                className={`p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border space-y-3.5 transition-all ${
                  isIconSectionDragOver
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                {/* Header & Action Buttons */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-bold text-xs">
                    <Palette className="w-3.5 h-3.5 text-purple-500" />
                    <span>آیکون و رنگ سازمانی (۱۰ تم متمایز)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Hidden Direct File Input for Custom Image */}
                    <input
                      type="file"
                      ref={iconDirectInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDirectIconUpload(file);
                      }}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                      id="app-icon-direct-input"
                    />

                    {/* Direct Upload Button */}
                    <button
                      type="button"
                      onClick={() => iconDirectInputRef.current?.click()}
                      disabled={isUploadingIconDirect}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
                      title="آپلود تصویر عکس یا فایل PNG شفاف (بدون پس‌زمینه) یا JPG به جای آیکون"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isUploadingIconDirect ? 'در حال آپلود...' : 'آپلود عکس (PNG شفاف / JPG)'}</span>
                    </button>

                    {/* Icon Library Modal Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIconPickerInitialTab('builtin');
                        setIsIconPickerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      title="انتخاب از بین بیش از ۵۰ آیکون آماده لینوکس و هوم‌لب"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>کتابخانه آیکون‌ها</span>
                    </button>
                  </div>
                </div>

                {/* Active Icon / Custom Image Card */}
                {editingApp.icon && (editingApp.icon.startsWith('/uploads/') || editingApp.icon.startsWith('http') || editingApp.icon.startsWith('data:')) ? (
                  /* Custom Uploaded Image View (with Transparency Checkerboard) */
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl border border-slate-300 dark:border-slate-700 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs"
                        style={{
                          backgroundImage: `linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)`,
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                          backgroundColor: '#f8fafc'
                        }}
                        title="پیش‌نمایش تصویر با شبکه شطرنجی شفافیت"
                      >
                        <img
                          src={editingApp.icon}
                          alt="Custom icon"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            عکس سفارشی اختصاص‌داده‌شده
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                            PNG شفاف / JPG
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5" dir="ltr">
                          {editingApp.icon}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => iconDirectInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        تعویض تصویر
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingApp({ ...editingApp, icon: 'terminal' })}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                        title="حذف تصویر و بازگشت به آیکون پیش‌فرض"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard System Icon View */
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: `${editingApp.accentColor || '#2563EB'}15`,
                          borderColor: `${editingApp.accentColor || '#2563EB'}40`,
                          color: editingApp.accentColor || '#2563EB'
                        }}
                      >
                        <AppIcon icon={editingApp.icon || 'terminal'} accentColor={editingApp.accentColor} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            آیکون سیستمی فعال: {editingApp.icon || 'terminal'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          می‌توانید به جای این آیکون، تصویر لوگوی سازمانی خود را (PNG شفاف یا JPG) بارگذاری نمایید.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => iconDirectInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer shrink-0"
                    >
                      آپلود عکس
                    </button>
                  </div>
                )}

                {/* 10 Distinct Theme Colors */}
                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  {[
                    '#2563EB', // آبی کلاسیک
                    '#0D9488', // فیروزه‌ای
                    '#059669', // سبز زمردی
                    '#E11D48', // قرمز رزی
                    '#D97706', // کهربایی / نارنجی
                    '#7C3AED', // بنفش
                    '#DB2777', // سرخابی / صورتی
                    '#0284C7', // آبی آسمانی
                    '#475569', // خاکستری زغالی
                    '#4F46E5', // سرمه‌ای نیلی
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingApp({ ...editingApp, accentColor: color })}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer border-2 ${
                        (editingApp.accentColor?.toLowerCase() === color.toLowerCase())
                          ? 'scale-115 border-white dark:border-slate-900 ring-2 ring-blue-500 shadow-md'
                          : 'border-transparent hover:scale-110 shadow-2xs'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={editingApp.accentColor || '#2563EB'}
                      onChange={(e) => setEditingApp({ ...editingApp, accentColor: e.target.value })}
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0 bg-transparent"
                      title="انتخاب رنگ دلخواه"
                    />
                    <span className="text-[10px] text-slate-400">دلخواه</span>
                  </div>
                </div>
              </div>

              {/* 4. Display Settings Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingApp.openInNewTab !== false}
                    onChange={(e) => setEditingApp({ ...editingApp, openInNewTab: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      باز شدن در برگه جدید
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      صفحه پیوند در تب مجزای مرورگر باز شود
                    </span>
                  </div>
                </label>

                <label className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingApp.isEnabled !== false}
                    onChange={(e) => setEditingApp({ ...editingApp, isEnabled: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      فعال در صفحه اصلی
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      کارت برای تمامی کاربران قابل مشاهده باشد
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-2 active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT / ADD USER MODAL --- */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
              {editingUser.id ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">نام کاربری *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={editingUser.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="admin"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-left font-mono tracking-wide"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {editingUser.id ? 'رمز عبور جدید (برای حفظ رمز قبلی خالی بگذارید)' : 'رمز عبور *'}
                </label>
                <input
                  type="password"
                  required={!editingUser.id}
                  dir="ltr"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder={editingUser.id ? '••••••••' : 'حداقل ۶ کاراکتر'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-left font-mono tracking-wide"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">نقش کاربری</label>
                <div className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-between">
                  <span>مدیر سیستم (دسترسی کامل به پنل مدیریت)</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-mono">admin</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="user-active-checkbox"
                  checked={editingUser.isActive !== false}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="user-active-checkbox" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  حساب کاربری فعال است و امکان ورود دارد
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  ذخیره مدیر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT / ADD CATEGORY MODAL --- */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingCategory.id ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام دسته‌بندی *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="مثلاً رسانه و استریم، شبکه، ابزارها"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیح کوتاه (اختیاری)
                </label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="توضیح مختصر درباره برنامه‌های این دسته"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  ذخیره دسته‌بندی
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
          initialTab={iconPickerInitialTab}
        />
      )}

      {/* --- SERVER DOCUMENTS & MEDIA LIBRARY MODAL --- */}
      {serverDocsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    اسناد و فایل‌های سرور
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    فایل‌های آپلود شده در سرور جهت نمایش مستقیم بدون دانلود
                  </p>
                </div>
              </div>
              <button
                onClick={() => setServerDocsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Controls & Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="جستجوی فایل یا پسوند..."
                  className="w-full pr-9 pl-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => appDocumentInputRef.current?.click()}
                  disabled={isUploadingAppDoc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className={`w-3.5 h-3.5 ${isUploadingAppDoc ? 'animate-bounce' : ''}`} />
                  <span>{isUploadingAppDoc ? 'در حال ارسال...' : 'آپلود فایل جدید'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadServerDocs}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="تازه‌سازی لیست"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin text-blue-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Modal Files List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoadingDocs ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs">در حال بارگذاری لیست اسناد سرور...</span>
                </div>
              ) : (
                (() => {
                  const filtered = serverDocsList.filter(
                    (d) =>
                      d.filename.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                      d.ext.toLowerCase().includes(docSearchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <FileText className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {docSearchQuery ? 'فایلی با این نام یافت نشد' : 'هنوز فایلی در سرور آپلود نشده است'}
                        </p>
                        <p className="text-xs mt-1 text-slate-400">
                          با دکمه «آپلود فایل جدید» می‌توانید فایل‌های PDF یا اسناد خود را اضافه نمایید.
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((doc) => {
                    const extUpper = doc.ext.toUpperCase();
                    const sizeFormatted =
                      doc.size > 1024 * 1024
                        ? `${(doc.size / (1024 * 1024)).toFixed(1)} مگابایت`
                        : `${Math.round(doc.size / 1024)} کیلوبایت`;

                    return (
                      <div
                        key={doc.filename}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-blue-500/30 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 font-bold text-xs text-blue-600 dark:text-blue-400 border border-slate-200/50 dark:border-slate-700/50">
                            {extUpper || 'DOC'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate dir-ltr text-right">
                              {doc.filename}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                              <span>{sizeFormatted}</span>
                              <span>•</span>
                              <span className="dir-ltr text-right">{new Date(doc.createdAt).toLocaleDateString('fa-IR')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="مشاهده مستقیم در تب جدید"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>مشاهده</span>
                          </a>

                          {editingApp ? (
                            <button
                              type="button"
                              onClick={() => handleSelectDocForApp(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>انتخاب برای کارت</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCreateAppFromDoc(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                              title="ایجاد دکمه اختصاصی برای این فایل در صفحه اصلی"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ایجاد دکمه در داشبورد</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin + doc.url);
                              showNotification('آدرس فایل در کلیپ‌بورد کپی شد');
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="کپی پیوند فایل"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteServerDoc(doc.filename)}
                            className="p-1.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="حذف از سرور"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30">
              <span className="text-[11px] text-slate-400 font-medium">
                تعداد فایل‌های سرور: {serverDocsList.length}
              </span>
              <button
                type="button"
                onClick={() => setServerDocsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EXCEL & JSON IMPORT PREVIEW MODAL --- */}
      {importPreview && (
        <ImportPreviewModal
          isOpen={true}
          onClose={() => setImportPreview(null)}
          fileType={importPreview.fileType}
          fileName={importPreview.fileName}
          parsed={importPreview.parsed}
          existingCategories={categories}
          isApplying={isApplyingImport}
          onConfirm={handleConfirmImport}
        />
      )}

      {/* --- RESET / WIPE CONFIRMATION MODAL --- */}
      {showResetConfirmModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          id="admin-reset-confirm-modal"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-red-200 dark:border-red-900/80 shadow-2xl overflow-hidden text-right">
            {/* Modal Header */}
            <div className="p-4 bg-red-500/10 dark:bg-red-500/15 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-600/30">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-red-950 dark:text-red-200">
                    تأیید پاک‌سازی و بازنشانی دیتابیس
                  </h3>
                  <span className="text-[11px] text-red-700 dark:text-red-400">
                    عملیات غیرقابل برگشت (مگر با بازگردانی فایل پشتیبان)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isResetting && setShowResetConfirmModal(false)}
                disabled={isResetting}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 space-y-2">
                <p className="font-bold text-red-800 dark:text-red-300 leading-relaxed">
                  آیا اطمینان دارید که می‌خواهید تمام داده‌های پایگاه‌داده را پاک کنید؟
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700/90 dark:text-red-400/90 text-[11px]">
                  <li>
                    تعداد <strong className="font-bold text-red-900 dark:text-red-200">{toPersianDigits(applications.length)}</strong> برنامه و <strong className="font-bold text-red-900 dark:text-red-200">{toPersianDigits(categories.length)}</strong> دسته‌بندی حذف خواهند شد.
                  </li>
                  <li>کلیه تنظیمات ظاهری، چیدمان و داشبورد به مقادیر پیش‌فرض ریست می‌شوند.</li>
                  <li>حساب کاربری مدیریت شما جهت امکان دسترسی مجدد حفظ خواهد شد.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  پس از این پاک‌سازی، می‌توانید فوراً با بارگذاری هر کدام از موارد زیر، کلیه تنظیمات و برنامه‌ها را بازگردانی نمایید:
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-bold">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400">
                    فایل جامع ZIP
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                    فایل اکسل XLSX
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                    فایل متنی JSON
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors select-none">
                <input
                  type="checkbox"
                  checked={wipeUploadsOnReset}
                  onChange={(e) => setWipeUploadsOnReset(e.target.checked)}
                  disabled={isResetting}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    پاک‌سازی پوشه فایل‌های آپلودشده (Uploads)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    شامل آیکون‌ها، تصاویر پس‌زمینه و فایل‌های ضمیمه ذخیره‌شده روی سرور. (اگر فایل ZIP دارید، همه آنها قابل بازیابی هستند).
                  </p>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-2.5 bg-slate-50/50 dark:bg-slate-950/30">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetDatabase}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                id="admin-confirm-reset-button"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال پاک‌سازی و بازنشانی...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تأیید و پاک‌سازی کامل داده‌ها</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Inspection Modal */}
      {inspectingBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    محتویات و فایل‌های نسخه پشتیبان ZIP
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400" dir="ltr">
                      {inspectingBackup.filename}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(inspectingBackup.sizeBytes)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingBackup(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <AppWindow className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">کل برنامه‌ها</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {toPersianDigits(inspectingBackup.stats.applicationsCount)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">اسناد پیوست دکمه‌ها</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {toPersianDigits(inspectingBackup.stats.buttonFilesCount || inspectingBackup.files.filter(f => f.zipPath.startsWith('button-documents/') || f.role.includes('سند')).length)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FolderArchive className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">فایل‌ها و آیکون‌ها</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {toPersianDigits(inspectingBackup.stats.uploadsCount)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">اکسل و داده JSON</p>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      کامل و آماده
                    </p>
                  </div>
                </div>
              </div>

              {/* Homepage Personalization Details in Modal */}
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span>عنوان پورتال: <b className="text-slate-800 dark:text-slate-200">{inspectingBackup.stats.homepageTitle || 'Linux Services Hub'}</b></span>
                  {inspectingBackup.stats.homepageSubtitle && (
                    <span>زیرعنوان: <b className="text-slate-700 dark:text-slate-300">{inspectingBackup.stats.homepageSubtitle}</b></span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inspectingBackup.stats.hasCustomLogo
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {inspectingBackup.stats.hasCustomLogo ? '✓ شامل لوگوی اختصاصی' : 'لوگوی استاندارد'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inspectingBackup.stats.hasCustomBackground
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {inspectingBackup.stats.hasCustomBackground ? '✓ شامل والپیپر اختصاصی' : 'پوسته رنگی'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  نسخه پکیج: ۲.۲.۰
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-xs">
                <button
                  type="button"
                  onClick={() => setInspectionFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    inspectionFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  همه فایل‌ها ({toPersianDigits(inspectingBackup.files.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionFilter('documents')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    inspectionFilter === 'documents'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  اسناد پیوست دکمه‌ها
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionFilter('icons')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    inspectionFilter === 'icons'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  آیکون‌ها و تصاویر
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionFilter('data')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    inspectionFilter === 'data'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  پایگاه داده و اکسل
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="جستجو در فایل‌های این نسخه..."
                  value={inspectionSearch}
                  onChange={(e) => setInspectionSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Files List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {inspectingBackup.files
                .filter((file) => {
                  if (inspectionFilter === 'documents') {
                    return file.zipPath.startsWith('button-documents/') || file.role.includes('سند') || file.name.startsWith('doc-');
                  }
                  if (inspectionFilter === 'icons') {
                    return file.zipPath.startsWith('button-icons/') || file.zipPath.startsWith('uploads/icons/') || file.name.startsWith('icon-') || file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.svg');
                  }
                  if (inspectionFilter === 'data') {
                    return file.zipPath.endsWith('.json') || file.zipPath.endsWith('.xlsx');
                  }
                  return true;
                })
                .filter((file) => {
                  if (!inspectionSearch.trim()) return true;
                  const q = inspectionSearch.toLowerCase();
                  return (
                    file.name.toLowerCase().includes(q) ||
                    file.zipPath.toLowerCase().includes(q) ||
                    file.role.toLowerCase().includes(q) ||
                    (file.appName && file.appName.toLowerCase().includes(q))
                  );
                })
                .map((file, idx) => {
                  const isButtonDoc = file.zipPath.startsWith('button-documents/') || file.role.includes('سند');
                  const isIcon = file.zipPath.startsWith('button-icons/') || file.zipPath.startsWith('uploads/icons/') || file.name.startsWith('icon-');
                  const isXlsx = file.zipPath.endsWith('.xlsx');

                  return (
                    <div
                      key={`${file.zipPath}-${idx}`}
                      className="pt-2.5 pb-1 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isButtonDoc
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : isIcon
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : isXlsx
                            ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}>
                          {isButtonDoc ? (
                            <FileText className="w-4 h-4" />
                          ) : isIcon ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : isXlsx ? (
                            <FileSpreadsheet className="w-4 h-4" />
                          ) : (
                            <FileCode2 className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" dir="auto">
                              {file.name}
                            </span>
                            {file.appName && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/50">
                                برای دکمه «{file.appName}»
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate" dir="ltr">
                              {file.zipPath}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {file.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md" dir="ltr">
                          {formatBytes(file.sizeBytes)}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" title="موجود در بسته پشتیبان" />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30">
              <a
                href={api.getBackupDownloadUrl(inspectingBackup.filename)}
                download={inspectingBackup.filename}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>دانلود مستقیم فایل ZIP ({formatBytes(inspectingBackup.sizeBytes)})</span>
              </a>

              <button
                type="button"
                onClick={() => setInspectingBackup(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl px-4 sm:px-8 py-3.5 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4" dir="ltr">
          <div className="inline-flex items-center gap-2 bg-[#f0f4f8] dark:bg-slate-800/90 border border-[#e2e8f0] dark:border-slate-700/80 px-3.5 py-1 rounded-full text-slate-600 dark:text-slate-300 font-sans font-medium text-[13px] shadow-2xs select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0"></span>
            <span className="leading-none">v{APP_VERSION}</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] tracking-tight select-none">
            Developed by : N.Shaaeri
          </span>
        </div>
      </footer>
    </div>
  );
};
