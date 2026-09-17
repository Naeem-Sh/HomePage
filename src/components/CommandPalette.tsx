import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ExternalLink,
  HardDrive,
  FileText,
  Moon,
  Sun,
  LayoutDashboard,
  Lock,
  Edit3,
  Check,
  X,
  Sparkles,
  Command,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { Application, Category, ThemeMode } from '../types';
import { AppIcon } from './AppIcon';
import { recordAppClick } from '../lib/telemetryTracker';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  categories?: Category[];
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAdmin: () => void;
  onOpenServiceDetail: (app: Application) => void;
  currentUser: { id: string; username: string; role: string } | null;
}

interface PaletteAction {
  id: string;
  type: 'app' | 'action' | 'category';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category?: string;
  tags?: string[];
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  applications,
  categories = [],
  theme,
  onToggleTheme,
  isEditMode,
  onToggleEditMode,
  onOpenAdmin,
  onOpenServiceDetail,
  currentUser
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build the searchable action list
  const allItems: PaletteAction[] = [];

  // 1. Applications
  applications.forEach((app) => {
    const isUnc =
      app.url.startsWith('\\\\') ||
      app.url.startsWith('smb://') ||
      app.url.startsWith('nfs://') ||
      app.url.startsWith('file://');
    const isPdf = app.url.toLowerCase().endsWith('.pdf');
    const isHttps = app.url.startsWith('https://');

    allItems.push({
      id: `app-${app.id}`,
      type: 'app',
      title: app.name,
      subtitle: app.description || (isUnc ? 'اشتراک شبکه' : isPdf ? 'سند و فایل' : isHttps ? 'سرویس امن HTTPS' : 'سرویس داخلی شبکه'),
      category: categories.find((c) => c.id === app.categoryId)?.name || 'برنامه‌ها',
      tags: app.tags || [],
      icon: (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 shrink-0 bg-slate-800/60 dark:bg-white/10 border border-white/10"
          style={{ borderColor: app.accentColor ? `${app.accentColor}55` : undefined }}
        >
          <AppIcon icon={app.icon} accentColor={app.accentColor} className="w-5 h-5" />
        </div>
      ),
      action: () => {
        recordAppClick(app.id, app.name);
        onClose();
        const targetUrl = (app.fileUrl && app.fileUrl.trim() !== '') ? app.fileUrl : app.url;
        const openTarget = targetUrl.startsWith('/') ? `${window.location.origin}${targetUrl}` : targetUrl;
        if (isUnc) {
          onOpenServiceDetail(app);
        } else {
          if (app.openInNewTab !== false) {
            window.open(openTarget, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = openTarget;
          }
        }
      }
    });
  });

  // 2. Global Homelab Actions
  allItems.push({
    id: 'action-theme',
    type: 'action',
    title: theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک',
    subtitle: 'تغییر ظاهر بصری و پوسته داشبورد',
    icon: (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/20">
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </div>
    ),
    shortcut: 'تم',
    action: () => {
      onToggleTheme(theme === 'dark' ? 'light' : 'dark');
      onClose();
    }
  });

  allItems.push({
    id: 'action-edit-mode',
    type: 'action',
    title: isEditMode ? 'خروج از حالت چیدمان (قفل کردن)' : 'ورود به حالت تغییر چیدمان و سازماندهی',
    subtitle: 'جابجایی کارت‌ها و مدیریت سرویس‌های نشان‌شده',
    icon: (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Edit3 className="w-4 h-4" />
      </div>
    ),
    shortcut: 'چیدمان',
    action: () => {
      onToggleEditMode();
      onClose();
    }
  });

  allItems.push({
    id: 'action-admin',
    type: 'action',
    title: currentUser?.role === 'admin' ? 'ورود به کنترل‌پنل مدیریت' : 'ورود مدیریت و پیکربندی هوم‌لب',
    subtitle: 'مدیریت سرویس‌ها، دسته‌بندی‌ها، پس‌زمینه‌ها و کاربران',
    icon: (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <LayoutDashboard className="w-4 h-4" />
      </div>
    ),
    shortcut: 'مدیریت',
    action: () => {
      onOpenAdmin();
      onClose();
    }
  });

  // Filter items based on query
  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-card"
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_24px_70px_-12px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-[#0c101d]/90 backdrop-blur-2xl text-slate-900 dark:text-slate-100 flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        dir="rtl"
      >
        {/* Top Search Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="یک دستور تایپ کنید یا بین سرویس‌ها جستجو نمایید..."
            aria-label="ورودی جستجوی اسپات‌لایت"
            className="flex-1 bg-transparent text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none tracking-tight font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1 divide-y-0 max-h-[50vh]"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.icon}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight truncate">
                          {item.title}
                        </span>
                        {item.category && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium truncate ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p
                          className={`text-xs truncate font-normal mt-0.5 ${
                            isSelected
                              ? 'text-blue-100'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform rtl:rotate-180 ${
                        isSelected ? 'translate-x-0.5 rtl:-translate-x-0.5 opacity-100' : 'opacity-30'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Command className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">دستور یا سرویسی یافت نشد</p>
              <p className="text-xs text-slate-500">با کلمه کلیدی یا نام سرویس دیگری جستجو کنید</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">↓</kbd>
              پیمایش
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">↵</kbd>
              انتخاب / اجرا
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium">
            <Command className="w-3.5 h-3.5" />
            <span>اسپات‌لایت دستورات هوم‌لب</span>
          </div>
        </div>
      </div>
    </div>
  );
};
