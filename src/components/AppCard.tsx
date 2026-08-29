import React, { useState } from 'react';
import { ExternalLink, HardDrive, FileText, Star } from 'lucide-react';
import { Application } from '../types';
import { AppIcon } from './AppIcon';

interface AppCardProps {
  app: Application;
  onOpenDestinationModal: (app: Application) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (appId: string, e: React.MouseEvent) => void;
  layoutView?: 'grid' | 'list';
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onOpenDestinationModal,
  isFavorite = false,
  onToggleFavorite,
  layoutView = 'grid'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isUncOrLocal =
    app.url.startsWith('\\\\') ||
    app.url.startsWith('smb://') ||
    app.url.startsWith('nfs://') ||
    app.url.startsWith('file://');

  const isPdf = app.url.toLowerCase().endsWith('.pdf');

  const handleClick = (e: React.MouseEvent) => {
    if (isUncOrLocal) {
      e.preventDefault();
      onOpenDestinationModal(app);
    } else {
      if (app.openInNewTab !== false) {
        window.open(app.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = app.url;
      }
    }
  };

  const accentColor = app.accentColor || '#3B82F6';

  // =========================================================================
  // 1. COMPACT GLASS LIST VIEW (Status & Category omitted)
  // =========================================================================
  if (layoutView === 'list') {
    return (
      <div
        id={`app-card-${app.id}`}
        className="group relative rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none overflow-hidden active:scale-[0.99] border backdrop-blur-xl bg-slate-900/60 dark:bg-slate-900/40 border-slate-800/80 dark:border-white/10 dark:hover:border-white/25 shadow-md hover:-translate-y-0.5 hover:shadow-xl"
        style={{
          boxShadow: isHovered
            ? `0 12px 28px -4px ${accentColor}26, 0 0 0 1px ${accentColor}55`
            : undefined,
          borderColor: isHovered ? `${accentColor}77` : undefined
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
        <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
          {/* Favorite Pin Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => onToggleFavorite(app.id, e)}
              title={isFavorite ? 'Unpin from Favorites' : 'Pin to Favorites'}
              aria-label={isFavorite ? 'Unpin from Favorites' : 'Pin to Favorites'}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-120 active:scale-90 cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isFavorite
                  ? 'text-amber-400 opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-slate-500 opacity-30 hover:opacity-100 hover:text-amber-400 hover:bg-amber-400/10'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          )}

          {/* App Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-2 shadow-inner transition-all duration-300 group-hover:scale-105 border bg-white/[0.05] border-white/10 backdrop-blur-md"
            style={{
              borderColor: isHovered ? `${accentColor}88` : undefined,
              boxShadow: isHovered ? `0 0 16px ${accentColor}33` : undefined
            }}
          >
            <AppIcon icon={app.icon} accentColor={accentColor} className="w-6 h-6 transition-transform duration-300" />
          </div>

          {/* Title & Description */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-sm sm:text-base tracking-tight truncate group-hover:text-blue-400 transition-colors duration-200">
              {app.name}
            </h3>
            {app.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5 font-normal leading-normal">
                {app.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Launch Trigger */}
        <div className="flex items-center gap-2 shrink-0 relative z-10 pl-2">
          <div className="p-2 rounded-xl text-slate-400 group-hover:text-blue-400 group-hover:bg-white/5 transition-all duration-200">
            {isUncOrLocal ? (
              <span title="UNC Network / Local Share">
                <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            ) : isPdf ? (
              <span title="PDF Document">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            ) : (
              <span title="Launch Service">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:opacity-100" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ULTRA-CLEAN GLASS GRID CARD (Status & Category omitted)
  // =========================================================================
  return (
    <div
      id={`app-card-${app.id}`}
      className="group relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[160px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none overflow-hidden active:scale-[0.985] border backdrop-blur-xl bg-slate-900/60 dark:bg-slate-900/40 border-slate-800/80 dark:border-white/10 dark:border-t-white/15 dark:hover:border-white/25 shadow-md hover:-translate-y-1 hover:shadow-2xl"
      style={{
        boxShadow: isHovered
          ? `0 16px 36px -6px ${accentColor}33, 0 0 20px 0 ${accentColor}1a`
          : undefined,
        borderColor: isHovered ? `${accentColor}88` : undefined
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {/* Dynamic Ambient Accent Bloom */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Row: App Icon & Top Actions (Favorite Star + Launch Button) */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        {/* App Icon Container */}
        <div
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 p-3 shadow-inner transition-all duration-300 group-hover:scale-105 border bg-white/[0.05] border-white/10 backdrop-blur-md"
          style={{
            borderColor: isHovered ? `${accentColor}88` : undefined,
            boxShadow: isHovered ? `0 0 16px ${accentColor}33` : undefined
          }}
        >
          <AppIcon icon={app.icon} accentColor={accentColor} className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300" />
        </div>

        {/* Favorite Star and Launch Glyph */}
        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => onToggleFavorite(app.id, e)}
              title={isFavorite ? 'Unpin from Favorites' : 'Pin to Favorites'}
              aria-label={isFavorite ? 'Unpin from Favorites' : 'Pin to Favorites'}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-120 active:scale-90 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isFavorite
                  ? 'text-amber-400 opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-slate-500 opacity-30 hover:opacity-100 hover:text-amber-400 hover:bg-amber-400/10'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          )}

          <div className="p-2 rounded-xl text-slate-500 group-hover:text-blue-400 transition-all duration-200">
            {isUncOrLocal ? (
              <span title="UNC Network / Local Share">
                <HardDrive className="w-4 h-4" />
              </span>
            ) : isPdf ? (
              <span title="PDF Document">
                <FileText className="w-4 h-4" />
              </span>
            ) : (
              <span title="Launch Service">
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Area: Title & Description */}
      <div className="mt-4 pt-2 relative z-10">
        <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight truncate group-hover:text-blue-400 transition-colors duration-200">
          {app.name}
        </h3>

        {app.description && (
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed font-normal">
            {app.description}
          </p>
        )}
      </div>
    </div>
  );
};
