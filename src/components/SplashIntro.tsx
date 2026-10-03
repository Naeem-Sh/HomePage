import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

export interface SplashAnimationMeta {
  name: string;
  nameEn: string;
  description: string;
  badge: string;
  lightGradient: string;
  darkGradient: string;
  previewBg: string;
}

export const DEFAULT_SPLASH_META: SplashAnimationMeta = {
  name: 'اسپلش پیش‌فرض IOOC',
  nameEn: 'IOOC Shimmer',
  description: 'گذر پرتو نوری زنده کریستالی با رینگ‌های هندسی متقارن و عبارت Shiraz Office',
  badge: 'پیش‌فرض',
  lightGradient: 'from-sky-500 via-blue-600 to-indigo-600',
  darkGradient: 'from-sky-200 via-cyan-400 to-blue-500',
  previewBg: 'from-blue-50/90 via-sky-50 to-white dark:from-blue-950/50 dark:via-slate-900 dark:to-slate-950'
};

interface SplashIntroProps {
  minDurationMs?: number;
  onFinish?: () => void;
  previewMode?: boolean;
  onClosePreview?: () => void;
  style?: string;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({
  minDurationMs = 1500,
  onFinish,
  previewMode = false,
  onClosePreview
}) => {
  const [stage, setStage] = useState<'enter' | 'shimmer' | 'exit'>('enter');
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    setStage('enter');

    // 1. Shimmer sweep starts after 160ms
    const shimmerTimer = setTimeout(() => {
      setStage('shimmer');
    }, 160);

    // 2. Fade-out starts at minDurationMs (if not in previewMode)
    let exitTimer: NodeJS.Timeout | undefined;
    let doneTimer: NodeJS.Timeout | undefined;

    if (!previewMode) {
      exitTimer = setTimeout(() => {
        setStage('exit');
      }, minDurationMs);

      doneTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, minDurationMs + 380);
    }

    return () => {
      clearTimeout(shimmerTimer);
      if (exitTimer) clearTimeout(exitTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [minDurationMs, previewMode, onFinish, playCount]);

  const handleReplay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStage('enter');
    setPlayCount((prev) => prev + 1);
  };

  return (
    <div
      id="portal-splash-screen"
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-350 ease-out bg-gradient-to-b from-white via-slate-50/95 to-slate-100/90 dark:from-[#090e1c] dark:via-[#070b16] dark:to-[#04060e] text-slate-800 dark:text-white backdrop-blur-2xl ${
        stage === 'exit' ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 scale-100'
      }`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '380ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Preview Mode Top Floating Toolbar */}
      {previewMode && (
        <div className="absolute top-5 inset-x-4 sm:inset-x-8 flex items-center justify-between z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-none">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">پیش‌نمایش انیمیشن ورودی:</span>
            <span className="text-xs font-black text-blue-600 dark:text-cyan-400">IOOC</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono">
              {(minDurationMs / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              title="پخش مجدد انیمیشن"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پخش مجدد</span>
            </button>
            {onClosePreview && (
              <button
                type="button"
                onClick={onClosePreview}
                className="p-2 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                title="بستن پیش‌نمایش"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Luminous Soft Radiant Ambient Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-400/15 dark:bg-blue-600/20 blur-[130px] pointer-events-none animate-pulse -translate-y-6" />
      <div className="absolute w-[360px] h-[360px] rounded-full bg-cyan-300/20 dark:bg-cyan-400/15 blur-[100px] pointer-events-none translate-y-4" />

      {/* High-Tech Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 dark:opacity-20">
        <div
          className="w-[320px] h-[320px] rounded-full border border-blue-500/25 dark:border-blue-400/20 animate-spin"
          style={{ animationDuration: '22s' }}
        />
        <div
          className="absolute w-[480px] h-[480px] rounded-full border border-sky-400/20 dark:border-cyan-400/15 border-dashed animate-spin"
          style={{ animationDuration: '32s', animationDirection: 'reverse' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Subtle radiant bloom */}
          <span
            className="absolute font-black text-6xl sm:text-7xl md:text-8xl tracking-[0.25em] select-none text-sky-400/30 dark:text-cyan-400/40 blur-2xl pointer-events-none transition-transform duration-700"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transform: stage === 'enter' ? 'scale(0.88)' : 'scale(1)'
            }}
          >
            IOOC
          </span>

          {/* High-Fidelity Vibrant Gradient Text */}
          <h1
            className="relative font-black text-6xl sm:text-7xl md:text-8xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 dark:from-sky-200 dark:via-cyan-400 dark:to-blue-500 drop-shadow-[0_4px_25px_rgba(37,99,235,0.2)] dark:drop-shadow-[0_10px_35px_rgba(14,165,233,0.5)] transition-all duration-700 ease-out"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transform: stage === 'enter' ? 'scale(0.90)' : 'scale(1)',
              letterSpacing: stage === 'enter' ? '0.14em' : '0.25em'
            }}
          >
            IOOC
          </h1>

          {/* Shimmer Light Beam Sweep */}
          <div
            className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${
              stage === 'shimmer' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-28 h-full bg-gradient-to-r from-transparent via-white/80 dark:via-white/50 to-transparent skew-x-[-25deg] blur-xs"
              style={{
                animation: 'ioocShimmer 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            />
          </div>
        </div>

        {/* Subtitle: Shiraz Office */}
        <p
          className="mt-2 text-xs sm:text-sm md:text-base font-bold tracking-[0.35em] uppercase text-slate-500 dark:text-sky-300/80 transition-all duration-700 ease-out select-none"
          style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transform: stage === 'enter' ? 'scale(0.92)' : 'scale(1)',
            opacity: stage === 'enter' ? 0.6 : 1
          }}
        >
          Shiraz Office
        </p>

        {/* Radiant Accent Underline */}
        <div className="mt-4 relative w-36 sm:w-52 h-[3px] bg-slate-200/90 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
            style={{
              width: stage === 'enter' ? '0%' : '100%',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.7)'
            }}
          />
        </div>

        {/* Smooth Indicator Dots */}
        <div className="mt-5 flex items-center gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>

      {/* Embedded CSS for shimmer */}
      <style>{`
        @keyframes ioocShimmer {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          100% {
            transform: translateX(350%) skewX(-25deg);
          }
        }
      `}</style>
    </div>
  );
};
