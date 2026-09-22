import React, { useState } from 'react';
import { ShieldCheck, User, Lock, KeyRound, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import { AuthResponse } from '../types';

interface SetupWizardProps {
  onComplete: (auth: AuthResponse) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError('نام کاربری باید حداقل ۳ کاراکتر باشد.');
      return;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (password !== confirmPassword) {
      setError('رمزهای عبور وارد شده یکسان نیستند.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.setupAdmin({ username: username.trim(), password });
      setStoredToken(res.token);
      onComplete(res);
    } catch (err: any) {
      setError(err.message || 'راه‌اندازی با خطا مواجه شد. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden p-6 md:p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/10">
            <Server className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            به هوم‌لب لینوکس خوش آمدید
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            راه‌اندازی اولیه الزامی است. لطفاً حساب مدیر ارشد را جهت پیکربندی سرویس‌ها، دسته‌بندی‌ها و تنظیمات امنیتی ایجاد نمایید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              نام کاربری مدیر
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="setup-admin-username"
                type="text"
                required
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left font-mono tracking-wide"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              رمز عبور مدیر
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="setup-admin-password"
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left font-mono tracking-wide"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              تکرار رمز عبور مدیر
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="setup-admin-password-confirm"
                type="password"
                required
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left font-mono tracking-wide"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>امنیت و رمزنگاری رمز عبور</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              رمزهای عبور با الگوریتم قدرتمند bcrypt هش می‌شوند. داشبورد عمومی همواره بدون نیاز به لاگین برای نمایش سرویس‌های عمومی در دسترس خواهد بود.
            </p>
          </div>

          <button
            id="setup-admin-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>در حال راه‌اندازی و ثبت اطلاعات...</span>
            ) : (
              <>
                <span>تکمیل راه‌اندازی و باز کردن داشبورد</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
