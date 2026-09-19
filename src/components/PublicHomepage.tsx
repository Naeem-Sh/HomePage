import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut,
  Server,
  LayoutGrid,
  List,
  Star,
  Search,
  Command,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpRight,
  Shield,
  Folder,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Application, Category, SystemSettings, ThemeMode, APP_VERSION } from '../types';
import { AnalogClock } from './AnalogClock';
import { ThemeToggle } from './ThemeToggle';
import { AppCard } from './AppCard';
import { AppIcon } from './AppIcon';
import { DestinationModal } from './DestinationModal';
import { AmbientSpatialBackground } from './AmbientSpatialBackground';
import { BgThemePicker } from './BgThemePicker';
import { CommandPalette } from './CommandPalette';
import { ServiceDetailModal } from './ServiceDetailModal';
import { TelemetryDashboard } from './TelemetryDashboard';
import { api } from '../lib/api';
import { getStoredBgTheme, setStoredBgTheme, BG_THEMES } from '../lib/bgThemes';
import { sanitizePublicAddress } from '../lib/networkUtils';
import { toPersianDigits } from '../lib/utils';

interface PublicHomepageProps {
  categories?: Category[];
  applications: Application[];
  settings: SystemSettings;
  theme: ThemeMode;
  onThemeToggle: (theme: ThemeMode) => void;
  currentUser: { id: string; username: string; role: string } | null;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  systemInfo?: any;
}

export const PublicHomepage: React.FC<PublicHomepageProps> = ({
  categories = [],
  applications,
  settings,
  theme,
  onThemeToggle,
  currentUser,
  onOpenLogin,
  onOpenAdmin,
  onLogout
}) => {
  const safeSettings: SystemSettings = settings || {
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
    publicSearch: true,
    customFooterText: 'Host: Linux Homelab Server',
    showTelemetryBar: false,
    telemetryPosition: 'top',
    configVersion: '1.0.0'
  };

  // Modals state
  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<Application | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Layout View Mode (Grid vs List) with localStorage persistence
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('linxdash_layout_view');
    return saved === 'list' || saved === 'grid' ? saved : 'grid';
  });

  const handleSetLayoutView = (view: 'grid' | 'list') => {
    setLayoutView(view);
    localStorage.setItem('linxdash_layout_view', view);
  };

  // Active Category Filter ('all' or category ID)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Background Theme Color (7 options cached in localStorage)
  const [bgThemeId, setBgThemeId] = useState<string>(() => getStoredBgTheme());

  const handleBgThemeChange = (newThemeId: string) => {
    setBgThemeId(newThemeId);
    setStoredBgTheme(newThemeId);
  };

  const activeBgTheme = BG_THEMES.find((t) => t.id === bgThemeId) || BG_THEMES[0];

  // Pinned / Favorite Apps with localStorage persistence
  const [favoriteAppIds, setFavoriteAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('linxdash_favorite_apps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteAppIds((prev) => {
      const next = prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId];
      localStorage.setItem('linxdash_favorite_apps', JSON.stringify(next));
      return next;
    });
  };

  // Drag-and-Drop Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [orderedApps, setOrderedApps] = useState<Application[]>([]);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSaveFeedback, setOrderSaveFeedback] = useState<string | null>(null);

  // Sync initial applications into ordered state
  useEffect(() => {
    const customOrder = localStorage.getItem('linxdash_custom_order');
    if (customOrder) {
      try {
        const idList: string[] = JSON.parse(customOrder);
        const map = new Map<string, Application>(applications.map((a) => [a.id, a]));
        const sorted: Application[] = [];
        idList.forEach((id) => {
          if (map.has(id)) {
            sorted.push(map.get(id)!);
            map.delete(id);
          }
        });
        // Append any newly added apps not in the saved order
        map.forEach((app) => sorted.push(app));
        setOrderedApps(sorted);
        return;
      } catch {
        // fallback
      }
    }
    setOrderedApps(applications);
  }, [applications]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'صبح بخیر';
    if (hour >= 12 && hour < 17) return 'ظهر بخیر';
    if (hour >= 17 && hour < 21) return 'عصر بخیر';
    return 'شب بخیر';
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    if (!isEditMode) return;
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetAppId: string) => {
    if (!isEditMode || !draggedAppId || draggedAppId === targetAppId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetAppId: string) => {
    if (!isEditMode || !draggedAppId || draggedAppId === targetAppId) return;
    e.preventDefault();

    setOrderedApps((prev) => {
      const fromIndex = prev.findIndex((a) => a.id === draggedAppId);
      const toIndex = prev.findIndex((a) => a.id === targetAppId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setHasUnsavedOrder(true);
      return updated;
    });

    setDraggedAppId(null);
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
  };

  // Keyboard / Touch Reorder Up & Down
  const handleMoveUp = (appId: string) => {
    setOrderedApps((prev) => {
      const idx = prev.findIndex((a) => a.id === appId);
      if (idx <= 0) return prev;
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      setHasUnsavedOrder(true);
      return updated;
    });
  };

  const handleMoveDown = (appId: string) => {
    setOrderedApps((prev) => {
      const idx = prev.findIndex((a) => a.id === appId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      setHasUnsavedOrder(true);
      return updated;
    });
  };

  // Save arrangement
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setOrderSaveFeedback(null);
    try {
      const ids = orderedApps.map((a) => a.id);
      localStorage.setItem('linxdash_custom_order', JSON.stringify(ids));

      if (currentUser?.role === 'admin') {
        await api.reorderApplications(ids);
      }

      setHasUnsavedOrder(false);
      setOrderSaveFeedback('چیدمان ذخیره شد!');
      setTimeout(() => setOrderSaveFeedback(null), 2500);
    } catch {
      setOrderSaveFeedback('در حافظه مرورگر ذخیره شد');
      setTimeout(() => setOrderSaveFeedback(null), 2500);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleResetOrder = () => {
    localStorage.removeItem('linxdash_custom_order');
    setOrderedApps(applications);
    setHasUnsavedOrder(false);
    setOrderSaveFeedback('بازنشانی به چیدمان پیش‌فرض');
    setTimeout(() => setOrderSaveFeedback(null), 2500);
  };

  // Active enabled applications
  const activeApps = orderedApps.filter((app) => app.isEnabled !== false);
  const favoriteApps = activeApps.filter((app) => favoriteAppIds.includes(app.id));

  // Filtered applications by category
  const filteredApps =
    selectedCategoryId === 'all'
      ? activeApps
      : selectedCategoryId === 'favorites'
      ? favoriteApps
      : activeApps.filter((app) => app.categoryId === selectedCategoryId);

  // Dynamic responsive grid column configuration with Ultra-wide / 2K / 4K / 32:9 automatic scaling
  const getGridColsClass = () => {
    if (layoutView === 'list') {
      return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5 min-[2560px]:grid-cols-6';
    }
    const cols = safeSettings.gridColumns || 4;
    switch (cols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 min-[1920px]:grid-cols-4 min-[2560px]:grid-cols-5';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5 min-[2560px]:grid-cols-6';
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1920px]:grid-cols-7 min-[2560px]:grid-cols-8 min-[3200px]:grid-cols-10';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 min-[2560px]:grid-cols-10 min-[3200px]:grid-cols-12';
      case 7:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-9 min-[2560px]:grid-cols-11 min-[3200px]:grid-cols-12';
      case 8:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 min-[1920px]:grid-cols-10 min-[2560px]:grid-cols-12';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 min-[2560px]:grid-cols-7 min-[3200px]:grid-cols-8';
    }
  };

  // Group applications by category with their names and counts
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories]);

  const categorySections = useMemo(() => {
    if (selectedCategoryId === 'favorites') {
      return [
        {
          id: 'favorites',
          name: 'سرویس‌های برگزیده و نشان‌شده',
          icon: 'Star',
          description: 'برنامه‌های مورد علاقه برای دسترسی فوق‌سریع',
          apps: favoriteApps
        }
      ].filter((sec) => sec.apps.length > 0);
    }

    if (selectedCategoryId !== 'all') {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (!cat) return [];
      const apps = activeApps.filter((a) => a.categoryId === cat.id);
      return [
        {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || 'Folder',
          description: cat.description,
          apps
        }
      ];
    }

    // 'all' mode: group each category sequentially
    const sections: Array<{
      id: string;
      name: string;
      icon: string;
      description?: string;
      apps: Application[];
    }> = [];

    sortedCategories.forEach((cat) => {
      const apps = activeApps.filter((a) => a.categoryId === cat.id);
      if (apps.length > 0) {
        sections.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || 'Folder',
          description: cat.description,
          apps
        });
      }
    });

    // Uncategorized apps (if any app has no categoryId or unrecognized category)
    const uncategorizedApps = activeApps.filter(
      (a) => !a.categoryId || !categories.some((c) => c.id === a.categoryId)
    );
    if (uncategorizedApps.length > 0) {
      sections.push({
        id: 'uncategorized',
        name: 'سایر سرویس‌ها و ابزارها',
        icon: 'Layers',
        description: 'سرویس‌های بدون دسته‌بندی اختصاصی',
        apps: uncategorizedApps
      });
    }

    return sections;
  }, [selectedCategoryId, sortedCategories, categories, activeApps, favoriteApps]);

  return (
    <div className={`relative min-h-screen ${activeBgTheme.lightBaseBg} dark:${activeBgTheme.darkBaseBg} text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-500`} dir="rtl">
      {/* 1. Spatial Ambient Atmospheric Backdrop or Offline Local Server Wallpaper */}
      {safeSettings.backgroundUrl ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
        >
          <img
            src={safeSettings.backgroundUrl}
            alt="Homelab Server Wallpaper"
            className={`w-full h-full object-cover transition-all duration-700 ${
              safeSettings.backgroundBlur ? 'blur-md scale-105' : ''
            }`}
            referrerPolicy="no-referrer"
          />
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{
              opacity: Math.max(0.12, (safeSettings.backgroundOverlayOpacity || 20) / 100)
            }}
          />
        </div>
      ) : (
        <AmbientSpatialBackground themeId={bgThemeId} />
      )}

      {/* ========================================================================= */}
      {/* 2. APPLE MENU BAR & HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] backdrop-blur-2xl bg-white/75 dark:bg-[#080d19]/80 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl 2xl:max-w-[1920px] min-[2560px]:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Homelab Branding */}
          <div className="flex items-center gap-3">
            {safeSettings.logoUrl ? (
              <img
                src={safeSettings.logoUrl}
                alt={safeSettings.title}
                className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] object-contain border-0 outline-none shadow-none bg-transparent transition-transform duration-200 hover:scale-105 select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25 text-white shrink-0 border border-white/20 transition-transform duration-200 hover:scale-105">
                <Server className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="flex flex-col justify-center">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {safeSettings.title || 'هوم‌لب لینوکس'}
              </h1>
              {safeSettings.subtitle && (
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  {safeSettings.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Toolbar: Theme, Layout & Admin Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-slate-200/70 dark:bg-white/[0.06] p-1 rounded-2xl border border-slate-300/80 dark:border-white/[0.12] backdrop-blur-md shadow-xs">
              <button
                type="button"
                id="view-mode-grid-button"
                onClick={() => handleSetLayoutView('grid')}
                title="نمای شبکه‌ای"
                aria-label="نمای شبکه‌ای"
                className={`p-1.5 rounded-xl transition-all duration-150 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center ${
                  layoutView === 'grid'
                    ? 'bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="view-mode-list-button"
                onClick={() => handleSetLayoutView('list')}
                title="نمای فهرستی"
                aria-label="نمای فهرستی"
                className={`p-1.5 rounded-xl transition-all duration-150 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center ${
                  layoutView === 'list'
                    ? 'bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Background Theme Palette Picker (7 Vibrant Themes Cached in Browser) */}
            <BgThemePicker
              currentThemeId={bgThemeId}
              onSelectTheme={handleBgThemeChange}
            />

            {/* Dark / Light Theme Mode Toggle */}
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />

            {/* Single Admin Icon Button (Navigates to Admin or opens Login) */}
            <button
              type="button"
              id="admin-entry-icon-button"
              onClick={currentUser ? onOpenAdmin : onOpenLogin}
              title={currentUser ? `کنترل‌پنل مدیریت (${currentUser.username})` : 'ورود به پنل مدیریت'}
              aria-label="کنترل‌پنل مدیریت"
              className="p-2 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/80 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-200 cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center shadow-xs"
            >
              <Shield className="w-4 h-4" />
            </button>

            {currentUser && (
              <button
                type="button"
                id="user-logout-button"
                onClick={onLogout}
                title={`خروج از حساب (${currentUser.username})`}
                className="p-2 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. MAIN HOMELAB INTERFACE */}
      {/* ========================================================================= */}
      <main className="max-w-7xl 2xl:max-w-[1920px] min-[2560px]:max-w-[2560px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-7 relative z-10">
        {/* Spatial Welcome & Context Bar (Spring Entrance Animation) */}
        <motion.section
          id="homelab-context-area"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24,
            mass: 0.8
          }}
          className="rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/15 bg-white/80 dark:bg-[#0c1120]/80 backdrop-blur-3xl shadow-[0_8px_30px_-6px_rgba(59,130,246,0.1),0_2px_8px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_-6px_rgba(59,130,246,0.15),0_0_0_1px_rgba(255,255,255,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ring-1 ring-blue-500/10 dark:ring-blue-400/15"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {toPersianDigits(activeApps.length)} برنامه فعال
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}، <span className="text-blue-600 dark:text-blue-400">{currentUser ? currentUser.username : 'کاربر گرامی'}</span>
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              دسترسی سریع به برنامه‌ها و سرویس‌ها
            </p>
          </div>

          {/* Clock & Persian/Gregorian/Hijri Date Section Transferred Here */}
          <div className="shrink-0 flex items-center bg-slate-100/80 dark:bg-white/[0.05] p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs self-start md:self-auto">
            <AnalogClock
              clockType={safeSettings.clockType}
              showDate={safeSettings.showDate}
              showSeconds={safeSettings.showSeconds}
            />
          </div>
        </motion.section>

        {/* Telemetry Dashboard: Active Sessions, Top 3 Used Apps & Daily Visits Tracking */}
        <TelemetryDashboard mode="public" applications={applications} />

        {/* Category Navigation Pills */}
        {(categories.length > 0 || favoriteApps.length > 0) && (
          <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none w-full" dir="rtl">
            {/* All Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                selectedCategoryId === 'all'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-white/70 dark:bg-white/[0.05] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>همه برنامه‌ها</span>
              <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/15 font-bold">
                {toPersianDigits(activeApps.length)}
              </span>
            </button>

            {/* Favorites Pill */}
            {favoriteApps.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId('favorites')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  selectedCategoryId === 'favorites'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 font-black'
                    : 'bg-white/70 dark:bg-white/[0.05] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>علاقه‌مندی‌ها</span>
                <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/15 font-bold">
                  {toPersianDigits(favoriteApps.length)}
                </span>
              </button>
            )}

            {/* Individual Categories */}
            {categories.map((cat) => {
              const count = activeApps.filter((a) => a.categoryId === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    selectedCategoryId === cat.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white/70 dark:bg-white/[0.05] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cat.name}</span>
                  <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/15 font-bold">
                    {toPersianDigits(count)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 5. FEATURED / QUICK ACCESS SECTION (When viewing all and user has favorites) */}
        {selectedCategoryId === 'all' && favoriteApps.length > 0 && (
          <section id="featured-favorites-section" className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  دسترسی سریع / برنامه‌های نشان‌شده
                </h3>
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                {toPersianDigits(favoriteApps.length)} نشان‌شده
              </span>
            </div>

            <motion.div
              layout
              transition={{
                layout: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }
              }}
              className={`grid ${getGridColsClass()} gap-4 sm:gap-5`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {favoriteApps.map((app) => (
                  <motion.div
                    key={`fav-${app.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{
                      layout: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.2 }
                    }}
                    className="w-full h-full"
                  >
                    <AppCard
                      app={app}
                      onOpenDestinationModal={(a) => setSelectedAppForModal(a)}
                      onOpenDetailModal={(a) => setSelectedAppForDetail(a)}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                      layoutView={layoutView}
                      isFeatured={true}
                      isEditMode={isEditMode}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        )}

        {/* 6. CATEGORY GROUPED APPLICATIONS SECTIONS */}
        {categorySections.length > 0 ? (
          <div className="space-y-10 sm:space-y-12">
            {categorySections.map((section) => (
              <section
                key={section.id}
                id={`category-section-${section.id}`}
                className="space-y-4"
              >
                {/* Category Header with Name, Icon & Apps Count Badge */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-2xs">
                      <AppIcon icon={section.icon || 'Folder'} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{section.name}</span>
                      </h3>
                      {section.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Application Count Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-xs">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-black">{toPersianDigits(section.apps.length)}</span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">برنامه</span>
                    </span>
                  </div>
                </div>

                {/* Applications Grid Under This Category */}
                <motion.div
                  layout
                  transition={{
                    layout: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }
                  }}
                  className={`grid ${getGridColsClass()} gap-4 sm:gap-5`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {section.apps.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{
                          layout: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 },
                          opacity: { duration: 0.2 },
                          scale: { duration: 0.2 }
                        }}
                        className="w-full h-full"
                      >
                        <AppCard
                          app={app}
                          onOpenDestinationModal={(a) => setSelectedAppForModal(a)}
                          onOpenDetailModal={(a) => setSelectedAppForDetail(a)}
                          isFavorite={favoriteAppIds.includes(app.id)}
                          onToggleFavorite={handleToggleFavorite}
                          layoutView={layoutView}
                          isFeatured={favoriteAppIds.includes(app.id)}
                          isEditMode={isEditMode}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 rounded-3xl backdrop-blur-xl bg-white/50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
              <Server className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              هیچ سرویسی در این نما یافت نشد
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              سرویس فعالی منطبق با فیلتر انتخابی وجود ندارد. به بخش «همه سرویس‌ها» بازگردید یا از پنل مدیریت سرویس جدید اضافه کنید.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all"
            >
              نمایش همه سرویس‌ها
            </button>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 7. MINIMAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.08] backdrop-blur-2xl bg-white/80 dark:bg-[#080d19]/80 px-4 sm:px-6 lg:px-8 py-3.5 mt-auto relative z-10">
        <div className="max-w-7xl 2xl:max-w-[1920px] min-[2560px]:max-w-[2560px] mx-auto flex items-center justify-between gap-4" dir="ltr">
          <div className="inline-flex items-center gap-2 bg-[#f0f4f8] dark:bg-slate-800/90 border border-[#e2e8f0] dark:border-slate-700/80 px-3.5 py-1 rounded-full text-slate-600 dark:text-slate-300 font-sans font-medium text-[13px] shadow-2xs select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0"></span>
            <span className="leading-none">v{APP_VERSION}</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] tracking-tight select-none">
            Developed by : N.Shaaeri
          </span>
        </div>
      </footer>

      {/* Spotlight Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        applications={activeApps}
        categories={categories}
        theme={theme}
        onToggleTheme={onThemeToggle}
        isEditMode={false}
        onToggleEditMode={() => {}}
        onOpenAdmin={onOpenAdmin}
        onOpenServiceDetail={(app) => setSelectedAppForDetail(app)}
        currentUser={currentUser}
      />

      {/* Service Detail Sheet / Modal */}
      {selectedAppForDetail && (
        <ServiceDetailModal
          app={selectedAppForDetail}
          category={categories.find((c) => c.id === selectedAppForDetail.categoryId)}
          onClose={() => setSelectedAppForDetail(null)}
          isFavorite={favoriteAppIds.includes(selectedAppForDetail.id)}
          onToggleFavorite={handleToggleFavorite}
          currentUser={currentUser}
        />
      )}

      {/* Protocol / UNC Share Destination Modal */}
      {selectedAppForModal && (
        <DestinationModal
          app={selectedAppForModal}
          onClose={() => setSelectedAppForModal(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
