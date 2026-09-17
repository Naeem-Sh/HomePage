import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  HardDrive,
  FileText,
  Star,
  ShieldCheck,
  Globe,
  Tag,
  Folder,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Application, Category } from '../types';
import { AppIcon, isImageIcon } from './AppIcon';
import { sanitizePublicAddress, getFriendlyServiceLabel, containsIpOrPort } from '../lib/networkUtils';
import { useAppHealth } from '../lib/useAppHealthStatus';
import { toPersianDigits } from '../lib/utils';
import { recordAppClick } from '../lib/telemetryTracker';

interface ServiceDetailModalProps {
  app: Application | null;
  category?: Category;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (appId: string, e: React.MouseEvent) => void;
  currentUser?: { id?: string; username?: string; role?: string } | null;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  app,
  category,
  onClose,
  isFavorite,
  onToggleFavorite,
  currentUser
}) => {
  const [copied, setCopied] = useState(false);
  const [showAdminRawUrl, setShowAdminRawUrl] = useState(false);
  const health = useAppHealth(app?.id || '');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!app) return null;

  const isAttachedFile = Boolean(app.fileUrl && app.fileUrl.trim() !== '');
  const isFileUrl =
    isAttachedFile ||
    app.url.startsWith('/uploads/') ||
    app.url.toLowerCase().endsWith('.pdf') ||
    app.url.startsWith('file://');

  const effectiveUrl = isAttachedFile ? app.fileUrl! : app.url;

  const isUnc =
    !isAttachedFile &&
    (app.url.startsWith('\\\\') ||
      app.url.startsWith('smb://') ||
      app.url.startsWith('nfs://') ||
      app.url.startsWith('file://'));

  const isPdf =
    effectiveUrl.toLowerCase().endsWith('.pdf') ||
    (app.fileName && app.fileName.toLowerCase().endsWith('.pdf'));
  const isHttps = effectiveUrl.startsWith('https://');
  const accentColor = app.accentColor || (isPdf ? '#EF4444' : '#3B82F6');

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(effectiveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleLaunch = () => {
    recordAppClick(app.id, app.name);
    if (isUnc) {
      handleCopyUrl();
    } else {
      if (app.openInNewTab !== false || isAttachedFile || isFileUrl) {
        window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = effectiveUrl;
      }
      onClose();
    }
  };

  return (
    <div
      id="service-detail-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container: iOS Bottom Sheet on Mobile, Centered Glass Card on Desktop */}
      <div
        id="service-detail-sheet"
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white/95 dark:bg-[#0c101d]/95 border-t sm:border border-slate-200/90 dark:border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] p-6 sm:p-7 overflow-hidden text-slate-900 dark:text-slate-100 backdrop-blur-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Mobile Swipe Bar Handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mb-4 sm:hidden" />

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Header with Icon, Name, Category & Close */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/15 shadow-md overflow-hidden p-1"
              style={{
                boxShadow: `0 8px 24px -4px ${accentColor}33`,
                borderColor: `${accentColor}55`
              }}
            >
              <AppIcon icon={app.icon} accentColor={accentColor} className="w-[92%] h-[92%]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                {app.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {category && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                    <Folder className="w-3 h-3 text-slate-400" />
                    {category.name}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                    health.status === 'online'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : health.status === 'degraded'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {health.status === 'online' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        health.status === 'online'
                          ? 'bg-emerald-500'
                          : health.status === 'degraded'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </span>
                  <span>
                    {health.status === 'offline'
                      ? 'غیرفعال و قطع'
                      : health.status === 'degraded'
                      ? 'پاسخ با تأخیر'
                      : 'فعال و آماده'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => onToggleFavorite(app.id, e)}
              title={isFavorite ? 'حذف از نشان‌شده‌ها' : 'افزودن به نشان‌شده‌ها'}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isFavorite
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-xs'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              id="service-detail-close-button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-4 sm:py-5 space-y-4 relative z-10">
          {/* Description */}
          {app.description && (
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/[0.03] p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
              {app.description}
            </div>
          )}

          {/* Protocol Notice for UNC or File Shares */}
          {isUnc && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex gap-3 items-start">
              <HardDrive className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">منبع شبکه و اشتراک فایل سیستم</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-0.5 leading-normal">
                  مرورگرهای وب به دلایل امنیتی امکان باز کردن مستقیم لینک‌های شبکه محلی را نمی‌دهند. با زدن دکمه «کپی آدرس» مسیر را در مدیریت فایل سیستم خود (File Explorer یا Finder) قرار دهید.
                </p>
              </div>
            </div>
          )}

          {/* Address & Copy Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isAttachedFile || isFileUrl ? 'آدرس فایل در سرور' : 'آدرس مقصد سرویس'}
              </label>
              {currentUser?.role === 'admin' && containsIpOrPort(effectiveUrl) && (
                <button
                  type="button"
                  onClick={() => setShowAdminRawUrl(!showAdminRawUrl)}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {showAdminRawUrl ? 'پنهان‌سازی آدرس ادمین' : 'نمایش آدرس کامل ادمین'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-blue-300 truncate" dir="ltr">
                {isAttachedFile || isFileUrl ? (
                  <FileText className="w-3.5 h-3.5 mr-2 text-rose-500 shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                )}
                <span className="truncate">
                  {currentUser?.role === 'admin' && showAdminRawUrl
                    ? effectiveUrl
                    : sanitizePublicAddress(effectiveUrl, currentUser?.role)}
                </span>
              </div>
              <button
                type="button"
                id="copy-address-button"
                onClick={handleCopyUrl}
                title="کپی کردن آدرس فایل یا مقصد در حافظه موقت"
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 min-h-[40px] ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-white border border-slate-300/60 dark:border-white/10'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی</span>
                  </>
                )}
              </button>
            </div>
            {(!currentUser || currentUser.role !== 'admin') && containsIpOrPort(effectiveUrl) && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <span>🔒 مشخصات IP و پورت میزبان در داشبورد عمومی مخفی شده است.</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 relative z-10">
          <span className="text-[11px] text-slate-400 font-mono">
            {app.openInNewTab !== false || isAttachedFile || isFileUrl
              ? '↗ باز شدن مستقیم در زبانه جدید'
              : '→ باز شدن در همین زبانه'}
          </span>

          <button
            type="button"
            id="launch-service-primary-button"
            onClick={handleLaunch}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg border border-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 min-h-[42px] ${
              isAttachedFile || isFileUrl
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/25'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
            }`}
          >
            <span>
              {isUnc
                ? 'کپی مسیر شبکه'
                : isAttachedFile || isFileUrl
                ? isPdf
                  ? 'باز کردن سند PDF'
                  : 'باز کردن مستقیم فایل'
                : 'اجرای سرویس'}
            </span>
            <ArrowUpRight className="w-4 h-4 rtl:rotate-[-90deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};
