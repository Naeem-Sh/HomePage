import React from 'react';
import { Globe, LayoutDashboard, Lock } from 'lucide-react';

interface DashboardSwitcherProps {
  currentDashboard: 'public' | 'admin';
  currentUser: { id: string; username: string; role: string } | null;
  onNavigatePublic: () => void;
  onNavigateAdmin: () => void;
  onOpenLogin: () => void;
  className?: string;
}

export const DashboardSwitcher: React.FC<DashboardSwitcherProps> = ({
  currentDashboard,
  currentUser,
  onNavigatePublic,
  onNavigateAdmin,
  onOpenLogin,
  className = ''
}) => {
  const isAdminAuthorized = currentUser?.role === 'admin';

  const handleAdminClick = () => {
    onNavigateAdmin();
  };

  return (
    <div
      id="quick-dashboard-switcher"
      className={`inline-flex items-center p-1 rounded-2xl bg-white/[0.06] border border-white/[0.12] shadow-inner backdrop-blur-xl gap-1 select-none ${className}`}
    >
      {/* 1. Public Dashboard Button */}
      <button
        type="button"
        id="switch-dashboard-public"
        onClick={onNavigatePublic}
        title="Public Homelab Launcher"
        className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[76px] ${
          currentDashboard === 'public'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 font-bold border border-white/20'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
        }`}
      >
        <div className="flex items-center gap-1.5 leading-none">
          <Globe className={`w-3.5 h-3.5 ${currentDashboard === 'public' ? 'text-white' : 'text-blue-400'}`} />
          <span className="text-xs font-bold">Public</span>
        </div>
        <div className="mt-0.5 text-[9px] font-semibold flex items-center gap-0.5 leading-none">
          {currentUser ? (
            <span className="text-emerald-400 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Signed
            </span>
          ) : (
            <span className="text-slate-400">Open</span>
          )}
        </div>
      </button>

      {/* 2. Admin Control Panel Button */}
      <button
        type="button"
        id="switch-dashboard-admin"
        onClick={handleAdminClick}
        title={
          isAdminAuthorized
            ? 'Switch to Admin Control Panel'
            : 'Admin Control Panel (Click to Sign In)'
        }
        className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[76px] ${
          currentDashboard === 'admin'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 font-bold border border-white/20'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
        }`}
      >
        <div className="flex items-center gap-1.5 leading-none">
          <LayoutDashboard className={`w-3.5 h-3.5 ${currentDashboard === 'admin' ? 'text-white' : 'text-indigo-400'}`} />
          <span className="text-xs font-bold">Admin</span>
          {!isAdminAuthorized && <Lock className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
        </div>
        <div className="mt-0.5 text-[9px] font-semibold flex items-center gap-0.5 leading-none">
          {isAdminAuthorized ? (
            <span className={`${currentDashboard === 'admin' ? 'text-blue-100' : 'text-emerald-400'} flex items-center gap-0.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentDashboard === 'admin' ? 'bg-white' : 'bg-emerald-400'} inline-block`} />
              Signed
            </span>
          ) : (
            <span className="text-slate-400">Sign In</span>
          )}
        </div>
      </button>
    </div>
  );
};
