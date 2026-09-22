import React, { useState, useEffect, useCallback } from 'react';
import { PublicConfig, ThemeMode, Application, AuthResponse } from './types';
import { api, getStoredToken, removeStoredToken, setStoredToken } from './lib/api';
import { PublicHomepage } from './components/PublicHomepage';
import { AdminDashboard } from './components/AdminDashboard';
import { SetupWizard } from './components/SetupWizard';
import { AuthModal } from './components/AuthModal';
import { DashboardSwitcher } from './components/DashboardSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { updateFaviconAndTitle } from './lib/favicon';
import { Server, RefreshCw, Lock, User, KeyRound, LogIn, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('linxdash_theme') as ThemeMode;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [publicConfig, setPublicConfig] = useState<PublicConfig | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [userApplications, setUserApplications] = useState<Application[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'home' | 'admin'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Admin Direct Login Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Apply dark mode class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('linxdash_theme', theme);
  }, [theme]);

  // Fetch initial state & check token
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch public config (always available without login)
      const config = await api.getPublicConfig();
      setPublicConfig(config);

      // Apply default theme if not overridden by user
      if (!localStorage.getItem('linxdash_theme') && config.settings.defaultTheme) {
        setTheme(config.settings.defaultTheme);
      }

      // 2. Check if user is authenticated with token
      const token = getStoredToken();
      if (token) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);

          // If authenticated, also fetch private + public applications
          const allApps = await api.getAdminApplications();
          setUserApplications(allApps.filter((a) => a.isEnabled));
        } catch {
          // Token invalid or expired
          removeStoredToken();
          setCurrentUser(null);
          setUserApplications(null);
        }
      } else {
        setCurrentUser(null);
        setUserApplications(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Synchronize browser tab favicon and independent tab title
  useEffect(() => {
    const tabTitle = publicConfig?.settings?.tabTitle || 'پورتال شیراز';
    const logoUrl = publicConfig?.settings?.logoUrl;
    updateFaviconAndTitle(logoUrl, tabTitle);
  }, [publicConfig?.settings?.logoUrl, publicConfig?.settings?.tabTitle]);

  const handleAuthSuccess = async (auth: AuthResponse) => {
    setStoredToken(auth.token);
    setCurrentUser(auth.user);
    if (auth.user.role === 'admin') {
      setViewMode('admin');
    } else {
      setViewMode('home');
    }
    // Reload user-visible applications
    try {
      const allApps = await api.getAdminApplications();
      setUserApplications(allApps.filter((a) => a.isEnabled));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setUserApplications(null);
    setViewMode('home');
    loadInitialData();
  };

  // 1. Initial Loading Screen
  if (isLoading && !publicConfig) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center animate-pulse">
            <Server className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            در حال اتصال به دیمن هوم‌لب لینوکس...
          </p>
        </div>
      </div>
    );
  }

  // 2. Fatal Server Error Screen
  if (error && !publicConfig) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
            <Server className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">خطا در اتصال به سرویس</h2>
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تلاش مجدد برای اتصال</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. First-Time Setup Wizard (if no admin has been created yet)
  if (publicConfig && !publicConfig.isSetupComplete && !currentUser) {
    return (
      <SetupWizard
        onComplete={(auth) => {
          handleAuthSuccess(auth);
          loadInitialData();
        }}
      />
    );
  }

  if (!publicConfig) return null;

  // Render Admin Dashboard or Public Homepage
  const displayedApps =
    currentUser && userApplications ? userApplications : publicConfig.applications;

  const handleAdminDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    setIsAdminLoggingIn(true);
    try {
      const res = await api.login({ username: adminUsername.trim(), password: adminPassword });
      setStoredToken(res.token);
      await handleAuthSuccess(res);
      setAdminUsername('');
      setAdminPassword('');
    } catch (err: any) {
      setAdminLoginError(err.message || 'Login failed. Invalid administrator credentials.');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen">
      {viewMode === 'admin' ? (
        currentUser?.role === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateHome={() => {
              setViewMode('home');
              loadInitialData();
            }}
            theme={theme}
            onThemeToggle={setTheme}
          />
        ) : (
          <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header with Switcher */}
            <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between" dir="rtl">
              <div className="flex items-center gap-3">
                {publicConfig.settings?.logoUrl ? (
                  <img
                    src={publicConfig.settings.logoUrl}
                    alt={publicConfig.settings.title || 'لوگو'}
                    className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] object-contain border-0 outline-none shadow-none bg-transparent select-none transition-transform duration-200 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-black shadow-xs">
                    مدیر
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                    {publicConfig.settings?.title || 'هوم‌لب لینوکس'}
                  </h2>
                  {publicConfig.settings?.subtitle && (
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      {publicConfig.settings.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DashboardSwitcher
                  currentDashboard="admin"
                  currentUser={currentUser}
                  onNavigatePublic={() => setViewMode('home')}
                  onNavigateAdmin={() => setViewMode('admin')}
                  onOpenLogin={() => setIsAuthModalOpen(true)}
                />
                <ThemeToggle theme={theme} onToggle={setTheme} />
              </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-4" dir="rtl">
              <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xl space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      ورود به پنل مدیریت
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      برای دسترسی به تنظیمات سیستم، پیکربندی سرویس‌ها و مدیریت کاربران وارد شوید.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAdminDirectLogin} className="space-y-4">
                  {adminLoginError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                      {adminLoginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      نام کاربری
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="admin-login-username"
                        type="text"
                        required
                        autoFocus
                        dir="ltr"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-left font-mono tracking-wide"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      رمز عبور
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="admin-login-password"
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-left font-mono tracking-wide"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={showAdminPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="admin-login-submit-button"
                    type="submit"
                    disabled={isAdminLoggingIn}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.98] text-white shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAdminLoggingIn ? (
                      <span>در حال احراز هویت...</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 rtl:rotate-180" />
                        <span>ورود به پنل مدیریت</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('home')}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>بازگشت به صفحه عمومی</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      ) : (
        <PublicHomepage
          categories={publicConfig.categories}
          applications={displayedApps}
          settings={publicConfig.settings}
          systemInfo={publicConfig.system || null}
          theme={theme}
          onThemeToggle={setTheme}
          currentUser={currentUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onOpenAdmin={() => setViewMode('admin')}
          onLogout={handleLogout}
        />
      )}

      {/* Auth Modal for Sign In */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
