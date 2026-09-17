import React, { useState, useRef } from 'react';
import {
  ExternalLink,
  HardDrive,
  FileText,
  Star,
  GripVertical,
  Info,
  ArrowUpRight,
  ShieldCheck,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Application } from '../types';
import { AppIcon, isImageIcon } from './AppIcon';
import { useAppHealth } from '../lib/useAppHealthStatus';
import { toPersianDigits } from '../lib/utils';
import { recordAppClick } from '../lib/telemetryTracker';

interface AppCardProps {
  app: Application;
  onOpenDestinationModal: (app: Application) => void;
  onOpenDetailModal?: (app: Application) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (appId: string, e: React.MouseEvent) => void;
  layoutView?: 'grid' | 'list';
  isFeatured?: boolean;
  isEditMode?: boolean;
  onDragStart?: (e: React.DragEvent, appId: string) => void;
  onDragOver?: (e: React.DragEvent, appId: string) => void;
  onDrop?: (e: React.DragEvent, appId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onMoveUp?: (appId: string) => void;
  onMoveDown?: (appId: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onOpenDestinationModal,
  onOpenDetailModal,
  isFavorite = false,
  onToggleFavorite,
  layoutView = 'grid',
  isFeatured = false,
  isEditMode = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const health = useAppHealth(app.id);

  // If app has an attached file (app.fileUrl) or if app.url is a server upload / PDF
  const isAttachedFile = Boolean(app.fileUrl && app.fileUrl.trim() !== '');
  const isFileUrl =
    isAttachedFile ||
    app.url.startsWith('/uploads/') ||
    app.url.toLowerCase().endsWith('.pdf') ||
    app.url.startsWith('file://');

  const effectiveUrl = isAttachedFile ? app.fileUrl! : app.url;

  const isUncOrLocal =
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
  const isImg = isImageIcon(app.icon);

  // Check if device supports hover and fine pointer (mouse / trackpad)
  const isFinePointer = () => {
    if (typeof window === 'undefined') return false;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return hasFinePointer && canHover && !prefersReducedMotion;
  };

  // High-performance direct DOM transform without triggering React re-renders on mousemove
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditMode || !cardRef.current || !isFinePointer()) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);

    // Max 3px - 5px translation toward cursor with tactile scaling
    const maxMove = isFeatured ? 5 : 3.5;
    const clampedX = Math.max(-1, Math.min(1, distanceX));
    const clampedY = Math.max(-1, Math.min(1, distanceY));

    const moveX = clampedX * maxMove;
    const moveY = clampedY * maxMove;
    const lift = isFeatured ? 5 : 3.5;

    // Direct GPU-accelerated translate3d with responsive 1.025x subtle scaling
    cardRef.current.style.transform = `perspective(900px) translate3d(${moveX.toFixed(2)}px, ${(moveY - lift).toFixed(2)}px, 0) scale(${isFeatured ? 1.032 : 1.025})`;
    cardRef.current.style.transition = 'transform 90ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 220ms ease, border-color 220ms ease';
    cardRef.current.style.willChange = 'transform';
  };

  const handleMouseEnter = () => {
    if (isEditMode || !isFinePointer()) return;
    setIsHovered(true);
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(900px) translate3d(0, -3px, 0) scale(${isFeatured ? 1.03 : 1.022})`;
      cardRef.current.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, border-color 220ms ease';
      cardRef.current.style.willChange = 'transform';
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      // Smooth Apple spring reset on cursor exit
      cardRef.current.style.transform = 'perspective(900px) translate3d(0, 0, 0) scale(1)';
      cardRef.current.style.transition = 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease, border-color 300ms ease';
      cardRef.current.style.willChange = 'auto';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) return;

    // Record application launch for usage statistics
    recordAppClick(app.id, app.name);

    const openTarget = effectiveUrl.startsWith('/')
      ? `${window.location.origin}${effectiveUrl}`
      : effectiveUrl;

    // When an attached file or PDF is present, directly open the file (bypasses URL)
    if (isAttachedFile || isFileUrl) {
      window.open(openTarget, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isUncOrLocal) {
      e.preventDefault();
      onOpenDestinationModal(app);
    } else {
      if (app.openInNewTab !== false) {
        window.open(openTarget, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = openTarget;
      }
    }
  };

  const handleOpenInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetailModal) {
      onOpenDetailModal(app);
    } else {
      onOpenDestinationModal(app);
    }
  };

  const dynamicCardShadow = isHovered && !isEditMode
    ? `0 18px 40px -10px ${accentColor}28, 0 0 0 1px ${accentColor}44, 0 4px 12px 0 rgba(0,0,0,0.15)`
    : undefined;

  const dynamicBorderColor = isHovered && !isEditMode ? `${accentColor}77` : undefined;

  // =========================================================================
  // 1. COMPACT GLASS LIST VIEW
  // =========================================================================
  if (layoutView === 'list') {
    return (
      <div
        ref={cardRef}
        id={`app-card-${app.id}`}
        draggable={isEditMode}
        onDragStart={(e) => onDragStart && onDragStart(e, app.id)}
        onDragOver={(e) => onDragOver && onDragOver(e, app.id)}
        onDrop={(e) => onDrop && onDrop(e, app.id)}
        onDragEnd={(e) => onDragEnd && onDragEnd(e)}
        className={`app-card-magnetic group relative w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 select-none overflow-hidden border backdrop-blur-xl transition-all duration-300 ease-out ${
          isEditMode
            ? 'cursor-grab active:cursor-grabbing border-blue-500/40 bg-blue-500/5 dark:bg-blue-950/20 ring-1 ring-blue-500/30'
            : 'cursor-pointer active:scale-[0.99] border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#101524]/65 hover:border-slate-300 dark:hover:border-white/25 shadow-xs hover:shadow-lg hover:scale-[1.015]'
        }`}
        style={{
          boxShadow: dynamicCardShadow,
          borderColor: dynamicBorderColor
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        aria-label={`${app.name} — ${app.description || 'Launch application'}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
          {/* Edit Mode Handle or Move Controls */}
          {isEditMode ? (
            <div className="flex items-center gap-1 shrink-0">
              <div className="p-1 text-blue-400 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>
              {onMoveUp && onMoveDown && (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(app.id);
                    }}
                    title="انتقال به بالا"
                    aria-label="انتقال به بالا"
                    className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(app.id);
                    }}
                    title="انتقال به پایین"
                    aria-label="انتقال به پایین"
                    className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => onToggleFavorite(app.id, e)}
                title={isFavorite ? 'حذف از دسترسی سریع' : 'پین کردن به دسترسی سریع'}
                aria-label={isFavorite ? 'حذف از دسترسی سریع' : 'پین کردن به دسترسی سریع'}
                className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer shrink-0 min-h-[34px] min-w-[34px] flex items-center justify-center ${
                  isFavorite
                    ? 'text-amber-400 opacity-100 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                    : 'text-slate-400 opacity-30 hover:opacity-100 hover:text-amber-400 hover:bg-amber-400/10'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )
          )}

          {/* App Icon with subtle glass frame */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-transform duration-200 group-hover:scale-105 border bg-slate-100/80 dark:bg-white/[0.06] border-slate-200 dark:border-white/10 overflow-hidden p-0.5"
            style={{
              borderColor: isHovered ? `${accentColor}88` : undefined
            }}
          >
            <AppIcon
              icon={app.icon}
              accentColor={accentColor}
              className="w-[92%] h-[92%]"
            />
          </div>

          {/* Title, Protocol indicator & Description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {app.name}
              </h3>
              
              {/* Pulsing Status LED Indicator (No words) */}
              <span
                className="relative flex h-2 w-2 shrink-0 items-center justify-center my-auto"
                title={`وضعیت سرویس: ${
                  health.status === 'online' ? 'فعال' : health.status === 'degraded' ? 'کند' : 'قطع'
                }`}
              >
                {health.status === 'online' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 transition-all duration-300 ${
                    health.status === 'online'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                      : health.status === 'degraded'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                      : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                  }`}
                />
              </span>
            </div>
            {app.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                {app.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions: Info Button + Direct Launch Trigger */}
        <div className="flex items-center gap-1.5 shrink-0 relative z-10 pl-2">
          {!isEditMode && (
            <button
              type="button"
              onClick={handleOpenInfo}
              title="مشاهده مشخصات و پروتکل سرویس"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="p-1.5 rounded-xl text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            {isUncOrLocal ? (
              <HardDrive className="w-4 h-4" />
            ) : isPdf ? (
              <FileText className="w-4 h-4" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. APPLE GLASS GRID CARD (Featured & Standard variants)
  // =========================================================================
  return (
    <div
      ref={cardRef}
      id={`app-card-${app.id}`}
      draggable={isEditMode}
      onDragStart={(e) => onDragStart && onDragStart(e, app.id)}
      onDragOver={(e) => onDragOver && onDragOver(e, app.id)}
      onDrop={(e) => onDrop && onDrop(e, app.id)}
      onDragEnd={(e) => onDragEnd && onDragEnd(e)}
      className={`app-card-magnetic group relative w-full h-full rounded-3xl p-5 sm:p-5.5 flex flex-col justify-between select-none overflow-hidden border backdrop-blur-xl transition-all duration-300 ease-out ${
        isFeatured ? 'min-h-[170px] sm:min-h-[185px]' : 'min-h-[155px] sm:min-h-[165px]'
      } ${
        isEditMode
          ? 'cursor-grab active:cursor-grabbing border-blue-500/50 bg-blue-500/10 dark:bg-blue-950/30 ring-2 ring-blue-500/30 animate-pulse-slow'
          : 'cursor-pointer active:scale-[0.985] border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#101524]/65 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-2xl hover:scale-[1.025]'
      }`}
      style={{
        boxShadow: dynamicCardShadow,
        borderColor: dynamicBorderColor
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      aria-label={`${app.name} — ${app.description || 'اجرای برنامه'}`}
    >
      {/* Dynamic Ambient Accent Bloom behind card */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Bar: Icon + Edit Controls or Favorite/Info/Launch */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        {/* App Icon Container */}
        <div
          className={`rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform duration-200 group-hover:scale-105 border bg-slate-100/90 dark:bg-white/[0.06] border-slate-200/90 dark:border-white/10 backdrop-blur-md overflow-hidden p-0.5 sm:p-1 ${
            isFeatured ? 'w-13 h-13 sm:w-14 sm:h-14' : 'w-11 h-11 sm:w-12 sm:h-12'
          }`}
          style={{
            borderColor: isHovered ? `${accentColor}88` : undefined,
            boxShadow: isHovered ? `0 4px 20px -2px ${accentColor}33` : undefined
          }}
        >
          <AppIcon
            icon={app.icon}
            accentColor={accentColor}
            className="w-[92%] h-[92%] transition-transform duration-200"
          />
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <div className="flex items-center gap-1">
              {onMoveUp && onMoveDown && (
                <div className="flex items-center bg-slate-100 dark:bg-white/10 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(app.id);
                    }}
                    title="انتقال به بالا/راست"
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(app.id);
                    }}
                    title="انتقال به پایین/چپ"
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="p-1.5 text-blue-400 cursor-grab bg-blue-500/20 rounded-xl">
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <>
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(app.id, e)}
                  title={isFavorite ? 'حذف از نشان‌شده‌ها' : 'افزودن به نشان‌شده‌ها'}
                  aria-label={isFavorite ? 'حذف از نشان‌شده‌ها' : 'افزودن به نشان‌شده‌ها'}
                  className={`p-1.5 rounded-xl transition-all duration-150 cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center ${
                    isFavorite
                      ? 'text-amber-400 opacity-100 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                      : 'text-slate-400 opacity-25 hover:opacity-100 hover:text-amber-400 hover:bg-amber-400/10'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenInfo}
                title="مشاهده اطلاعات و پروتکل سرویس"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors opacity-40 hover:opacity-100 cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              <div className="p-1.5 rounded-xl text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {isUncOrLocal ? (
                  <HardDrive className="w-4 h-4" />
                ) : isPdf ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Area: Protocol Badge + Real-time Ping Latency + Name & Description */}
      <div className="mt-3.5 pt-1 relative z-10">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {isUncOrLocal ? 'اشتراک شبکه' : isPdf ? 'سند و فایل' : isHttps ? 'امن HTTPS' : 'پروتکل HTTP'}
            </span>
          </div>

          {/* Pulsing Status LED Indicator (No words) */}
          <span
            className="relative flex h-2 w-2 shrink-0 items-center justify-center"
            title={`وضعیت سرویس: ${
              health.status === 'online' ? 'فعال' : health.status === 'degraded' ? 'کند' : 'قطع'
            }`}
          >
            {health.status === 'online' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 transition-all duration-300 ${
                health.status === 'online'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                  : health.status === 'degraded'
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
              }`}
            />
          </span>
        </div>

        <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          {app.name}
        </h3>

        {app.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed font-normal">
            {app.description}
          </p>
        )}
      </div>
    </div>
  );
};
