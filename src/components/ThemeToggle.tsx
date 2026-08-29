import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-button"
      type="button"
      onClick={() => onToggle(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex items-center bg-white/[0.08] p-1 rounded-2xl border border-white/[0.12] backdrop-blur-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-inner select-none"
    >
      <div className="flex items-center gap-0.5">
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-xl transition-all duration-200 ${
            !isDark
              ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </div>
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-xl transition-all duration-200 ${
            isDark
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
};
