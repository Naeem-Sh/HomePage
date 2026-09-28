import React, { useState, useRef, useEffect } from 'react';
import { CircleDot, Check, X, RotateCcw, Palette } from 'lucide-react';
import {
  BG_PATTERN_THEMES,
  BgPatternTheme,
  DEFAULT_BG_THEME_ID
} from '../lib/bgThemes';

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

  const activeTheme =
    BG_PATTERN_THEMES.find((t) => t.id === currentThemeId) ||
    BG_PATTERN_THEMES[0]; // cosmic-sky default

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
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectTheme(DEFAULT_BG_THEME_ID);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button - Circle with center dot (Matching exact icon and shape in user's screenshot) */}
      <button
        ref={buttonRef}
        type="button"
        id="bg-pattern-picker-button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`انتخاب طرح پس‌زمینه (طرح فعال: ${activeTheme.name})`}
        aria-label="انتخاب طرح پس‌زمینه"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-2xl border transition-all duration-200 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs ${
          isOpen
            ? 'bg-white dark:bg-slate-900 border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 text-slate-950 dark:text-white scale-105'
            : 'bg-slate-100/90 dark:bg-white/[0.08] border-slate-300/80 dark:border-white/[0.15] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-white/15'
        }`}
      >
        <CircleDot className="w-4 h-4 stroke-[2.3]" />
      </button>

      {/* Popover Modal: Viewport-aware on mobile (left-3 right-3) and anchored on desktop */}
      {isOpen && (
        <div
          ref={popoverRef}
          id="bg-pattern-picker-popover"
          className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-0 sm:right-auto mt-2 max-w-[340px] mx-auto sm:mx-0 w-auto sm:w-[325px] rounded-[26px] bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-[0_24px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.7)] p-3.5 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
          role="dialog"
          aria-modal="true"
        >
          {/* Header with Close on Left and Actions on Right */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Right Tools: Reset, Dot, Palette */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                title="بازنشانی به آبی کهکشانی ساده (پیش‌فرض)"
                className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />

              <div
                className="p-1.5 text-blue-600 dark:text-blue-400"
                title="پالت الگوهای پس‌زمینه (۲۰ طرح)"
              >
                <Palette className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 4 Rows x 5 Columns = 20 High-Definition Pattern Swatches */}
          <div className="grid grid-cols-5 gap-2 max-h-[60vh] sm:max-h-none overflow-y-auto pr-0.5">
            {BG_PATTERN_THEMES.map((item: BgPatternTheme) => {
              const isSelected = item.id === currentThemeId;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`bg-pattern-option-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  title={`${item.name} (${item.enName})`}
                  className={`relative aspect-square w-full rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden flex items-center justify-center group ${
                    isSelected
                      ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 border-2 border-blue-600 shadow-md scale-[1.05]'
                      : 'border border-slate-200/90 dark:border-slate-800 hover:border-blue-400/90 hover:scale-[1.03] shadow-2xs'
                  }`}
                  style={{
                    backgroundColor: item.lightBaseBg,
                    backgroundImage: item.lightPatternCss,
                    backgroundSize: item.lightPatternSize || 'auto',
                    backgroundPosition: item.lightPatternPosition || '0 0',
                    backgroundRepeat: 'repeat'
                  }}
                >
                  {/* Center Indicator: Selected Blue Checkmark Badge OR Center Accent Dot */}
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 shadow-sm flex items-center justify-center text-white animate-in zoom-in-75 duration-150">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </div>
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-xs transition-transform duration-200 group-hover:scale-125 ring-1 ring-white/60 dark:ring-black/40"
                      style={{ backgroundColor: item.accentDotColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Pattern Name Hint */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>طرح فعال:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
              {activeTheme.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
