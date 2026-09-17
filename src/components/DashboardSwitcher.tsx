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
      className={`inline-flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/80 dark:border-white/[0.12] backdrop-blur-xl gap-1 select-none shadow-xs ${className}`}
    >
      {/* 1. Public Dashboard Segment */}
      <button
        type="button"
        id="switch-dashboard-public"
        onClick={onNavigatePublic}
        title="داشبورد عمومی هوم‌لب"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[32px] ${
          currentDashboard === 'public'
            ? 'bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-slate-900 dark:text-white shadow-sm dark:shadow-md dark:shadow-blue-500/25 font-bold border border-slate-200/60 dark:border-white/20'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.06]'
        }`}
      >
        <Globe className={`w-3.5 h-3.5 ${currentDashboard === 'public' ? 'text-blue-600 dark:text-white' : 'text-slate-400'}`} />
        <span className="text-xs font-bold tracking-tight">عمومی</span>
      </button>

      {/* 2. Admin Control Panel Segment */}
      <button
        type="button"
        id="switch-dashboard-admin"
        onClick={handleAdminClick}
        title={
          isAdminAuthorized
            ? 'تغییر به کنترل‌پنل مدیریت'
            : 'کنترل‌پنل مدیریت (برای ورود کلیک کنید)'
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[32px] ${
          currentDashboard === 'admin'
            ? 'bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-slate-900 dark:text-white shadow-sm dark:shadow-md dark:shadow-blue-500/25 font-bold border border-slate-200/60 dark:border-white/20'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.06]'
        }`}
      >
        <LayoutDashboard className={`w-3.5 h-3.5 ${currentDashboard === 'admin' ? 'text-blue-600 dark:text-white' : 'text-slate-400'}`} />
        <span className="text-xs font-bold tracking-tight">مدیریت</span>
        {!isAdminAuthorized && <Lock className="w-3 h-3 opacity-60 ml-0.5" />}
      </button>
    </div>
  );
};
