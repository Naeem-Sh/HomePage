import React, { useState } from 'react';
import { X, Lock, User, KeyRound, LogIn } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import { AuthResponse } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auth: AuthResponse) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login({ username: username.trim(), password });
      setStoredToken(res.token);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'نام کاربری یا رمز عبور اشتباه است.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="auth-modal-card"
        className="relative w-full max-w-sm rounded-3xl bg-[#0e1320] border border-white/10 shadow-2xl p-6 text-slate-100 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-white">ورود به پنل مدیریت</h3>
          </div>
          <button
            id="auth-modal-close"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="py-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              نام کاربری
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="auth-username"
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pr-9 pl-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-right font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              رمز عبور
            </label>
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
                className="w-full pr-9 pl-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-right font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="auth-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>در حال ورود...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 rtl:rotate-180" />
                  <span>ورود</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end text-xs text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs px-3 py-1 rounded-lg hover:bg-white/5 font-medium"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};
