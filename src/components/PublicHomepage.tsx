import React, { useState } from 'react';
import {
  LogOut,
  Server,
  LayoutGrid,
  List,
  Star
} from 'lucide-react';
import { Application, SystemSettings, ThemeMode } from '../types';
import { AnalogClock } from './AnalogClock';
import { ThemeToggle } from './ThemeToggle';
import { AppCard } from './AppCard';
import { DestinationModal } from './DestinationModal';
import { DashboardSwitcher } from './DashboardSwitcher';

interface PublicHomepageProps {
  categories?: any[];
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

  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);

  // Layout View Mode (Grid vs List) with localStorage persistence
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('linxdash_layout_view');
    return saved === 'list' || saved === 'grid' ? saved : 'grid';
  });

  const handleSetLayoutView = (view: 'grid' | 'list') => {
    setLayoutView(view);
    localStorage.setItem('linxdash_layout_view', view);
  };

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

  // Active enabled applications
  const activeApps = applications.filter((app) => app.isEnabled !== false);
  const favoriteApps = activeApps.filter((app) => favoriteAppIds.includes(app.id));

  // Dynamic responsive grid column configuration
  const getGridColsClass = () => {
    if (layoutView === 'list') {
      return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    }
    const cols = safeSettings.gridColumns || 4;
    switch (cols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      case 7:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7';
      case 8:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* ========================================================================= */}
      {/* 1. CLEAN RESPONSIVE GLASS HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] backdrop-blur-2xl bg-[#090d16]/85 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Homelab Branding */}
          <div className="flex items-center gap-3.5">
            {safeSettings.logoUrl ? (
              <img
                src={safeSettings.logoUrl}
                alt={safeSettings.title}
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-2xl drop-shadow-md transition-transform duration-200 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 text-white shrink-0 border border-white/20 transition-transform duration-200 hover:scale-105">
                <Server className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="flex flex-col justify-center">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                {safeSettings.title ? safeSettings.title.toUpperCase() : 'LINUX HOMELAB'}
              </h1>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold mt-0.5">
                {safeSettings.subtitle || 'Self-Hosted Command Center'}
              </span>
            </div>
          </div>

          {/* Center: Dashboard Switcher */}
          <div className="flex items-center justify-center order-last sm:order-none w-full sm:w-auto">
            <DashboardSwitcher
              currentDashboard="public"
              currentUser={currentUser}
              onNavigatePublic={() => {}}
              onNavigateAdmin={onOpenAdmin}
              onOpenLogin={onOpenLogin}
            />
          </div>

          {/* Right Controls: Clock, View Switcher, Theme & Auth */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Live Frosted Glass Analog/Digital Clock */}
            <div className="hidden lg:flex items-center pr-2 border-r border-white/10">
              <AnalogClock
                clockType={safeSettings.clockType}
                showDate={safeSettings.showDate}
                showSeconds={safeSettings.showSeconds}
              />
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-white/[0.06] p-1 rounded-2xl border border-white/[0.12] backdrop-blur-md">
              <button
                type="button"
                id="view-mode-grid-button"
                onClick={() => handleSetLayoutView('grid')}
                title="Grid View"
                aria-label="Grid View"
                className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  layoutView === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="view-mode-list-button"
                onClick={() => handleSetLayoutView('list')}
                title="List View"
                aria-label="List View"
                className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  layoutView === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-300 text-xs font-semibold border border-blue-500/30 backdrop-blur-md">
                  {currentUser.username}
                </span>

                <button
                  id="user-logout-button"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-button"
                onClick={onOpenLogin}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 border border-white/15 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[38px] flex items-center justify-center"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN APPLICATION LAUNCHER (Responsive Grid/List) */}
      {/* ========================================================================= */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-8">
        {/* Pinned Favorites Section (if user has pinned apps) */}
        {favoriteApps.length > 0 && (
          <section id="pinned-favorites-section" className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-200">
                  Quick Access
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {favoriteApps.length} {favoriteApps.length === 1 ? 'app' : 'apps'}
              </span>
            </div>

            <div className={`grid ${getGridColsClass()} gap-4 sm:gap-5`}>
              {favoriteApps.map((app) => (
                <AppCard
                  key={`fav-${app.id}`}
                  app={app}
                  onOpenDestinationModal={(a) => setSelectedAppForModal(a)}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  layoutView={layoutView}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Applications Section */}
        <section id="all-applications-section" className="space-y-3.5">
          {favoriteApps.length > 0 && (
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-300">
                All Services & Applications
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {activeApps.length} {activeApps.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          )}

          {activeApps.length > 0 ? (
            <div className={`grid ${getGridColsClass()} gap-4 sm:gap-5`}>
              {activeApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onOpenDestinationModal={(a) => setSelectedAppForModal(a)}
                  isFavorite={favoriteAppIds.includes(app.id)}
                  onToggleFavorite={handleToggleFavorite}
                  layoutView={layoutView}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3 rounded-3xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-8">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">
                No Applications Configured
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No applications or services have been added yet. Sign in to the Admin panel to configure your homelab launcher.
              </p>
              {currentUser?.role === 'admin' ? (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Go to Admin Panel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Sign In as Admin
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 3. MINIMAL SLEEK FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/[0.08] backdrop-blur-2xl bg-[#090d16]/80 px-4 sm:px-6 lg:px-8 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span>{safeSettings.customFooterText || 'Host: Linux Server'}</span>
          </div>

          <div className="flex items-center gap-6 uppercase tracking-wider text-[11px]">
            <span className="font-mono text-slate-500">Config: {safeSettings.configVersion?.slice(0, 8) || 'v1.0.0'}</span>
            <button
              onClick={currentUser?.role === 'admin' ? onOpenAdmin : onOpenLogin}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-semibold"
            >
              {currentUser ? `Signed in (${currentUser.role})` : 'Admin Access'}
            </button>
          </div>
        </div>
      </footer>

      {/* Protocol / UNC Share Destination Modal */}
      {selectedAppForModal && (
        <DestinationModal
          app={selectedAppForModal}
          onClose={() => setSelectedAppForModal(null)}
        />
      )}
    </div>
  );
};
