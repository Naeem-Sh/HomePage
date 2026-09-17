import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X, RotateCcw } from 'lucide-react';
import { BG_THEMES, BgThemeOption } from '../lib/bgThemes';

interface BgThemePickerProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  className?: string;
}

export const BgThemePicker: React.FC<BgThemePickerProps> = ({
  currentThemeId,
  onSelectTheme,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeTheme = BG_THEMES.find((t) => t.id === currentThemeId) || BG_THEMES[0];

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (themeId: string) => {
    onSelectTheme(themeId);
    setIsOpen(false); // 1-click select & dismiss
  };

  return (
    <div className={`relative inline-block ${className}`} dir="rtl">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        id="bg-theme-picker-button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`تغییر رنگ پس‌زمینه (فعال: ${activeTheme.name})`}
        aria-label="تغییر رنگ پس‌زمینه"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-2xl border transition-all duration-200 cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center gap-1.5 shadow-xs ${
          isOpen
            ? 'bg-blue-600/15 border-blue-500/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
            : 'bg-slate-200/70 dark:bg-white/[0.06] border-slate-300/80 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-white/10'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Palette className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          {/* Ambient mini color dot indicator */}
          <span
            className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full ring-1 ring-white/80 dark:ring-black/80 shadow-xs transition-colors duration-300"
            style={{ background: activeTheme.previewGradient }}
          />
        </div>
      </button>

      {/* Popover Dropdown (Simple, fast 1-click 10 colors grid) */}
      {isOpen && (
        <div
          ref={popoverRef}
          id="bg-theme-picker-popover"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 rounded-3xl bg-white/95 dark:bg-[#0c1120]/95 border border-slate-200/90 dark:border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-white/10">
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
              انتخاب رنگ پس‌زمینه (۱۰ تم)
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 10 Colors - 2-Column Grid (1-Click Instant Selection) */}
          <div className="grid grid-cols-2 gap-2">
            {BG_THEMES.map((item: BgThemeOption) => {
              const isSelected = item.id === currentThemeId;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`bg-theme-option-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-150 cursor-pointer border text-right group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500/60 dark:border-blue-400/60 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200/60 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {/* Swatch circle with glowing check */}
                  <div
                    className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-white/40 dark:border-white/20 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: item.previewGradient }}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] stroke-[3.5]" />
                    )}
                  </div>

                  <span
                    className={`text-xs truncate ${
                      isSelected
                        ? 'font-black text-blue-600 dark:text-blue-400'
                        : 'font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset button if not default */}
          {currentThemeId !== 'cosmic' && (
            <button
              type="button"
              onClick={() => handleSelect('cosmic')}
              className="mt-2.5 pt-2 w-full border-t border-slate-200/80 dark:border-white/10 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازنشانی به رنگ پیش‌فرض</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
