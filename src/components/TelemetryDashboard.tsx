import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { useTelemetryStats } from '../lib/telemetryTracker';
import { toPersianDigits } from '../lib/utils';
import { Application, SystemInfo } from '../types';

interface TelemetryDashboardProps {
  mode?: 'public' | 'admin' | 'compact';
  systemInfo?: SystemInfo | null;
  applications?: Application[];
  className?: string;
  onRefresh?: () => void;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  mode = 'public',
  className = ''
}) => {
  const {
    activeSessionsCount,
    todayVisits,
    totalVisits,
    sessionDurationSec,
    dailyHistory,
    simulateNewVisit,
    resetTelemetry
  } = useTelemetryStats();

  const [isExpanded, setIsExpanded] = useState(false);
  const [justSimulated, setJustSimulated] = useState(false);

  // Format session duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${toPersianDigits(hours)}:${toPersianDigits(mins % 60).padStart(2, '۰')}:${toPersianDigits(secs).padStart(2, '۰')}`;
    }
    return `${toPersianDigits(mins)}:${toPersianDigits(secs).padStart(2, '۰')}`;
  };

  // Max visits for chart bar scaling
  const maxHistoryCount = Math.max(1, ...dailyHistory.map((d) => d.count));

  const handleSimulate = () => {
    simulateNewVisit();
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 1200);
  };

  // -------------------------------------------------------------
  // ADMIN DASHBOARD VIEW
  // -------------------------------------------------------------
  if (mode === 'admin') {
    return (
      <div
        id="admin-telemetry-dashboard"
        className={`p-5 rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 ${className}`}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>داشبورد آماری</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                پایش کاربران فعال، آمار بازدیدهای روزانه و روند ترافیک سامانه‌ها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulate}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                justSimulated
                  ? 'bg-emerald-500 text-white border-emerald-600 scale-95'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="ثبت یک بازدید آزمایشی در لاگ تلمتری"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{justSimulated ? 'ثبت شد!' : 'شبیه‌سازی بازدید'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('آیا از بازنشانی کلیه شمارنده‌های تلمتری و بازدیدها اطمینان دارید؟')) {
                  resetTelemetry();
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer border border-transparent hover:border-red-200 dark:border-slate-800/50"
              title="بازنشانی آمار تلمتری و بازدیدها"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Active Users */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">کاربران فعال</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono tracking-tight">
                {toPersianDigits(activeSessionsCount)}
              </span>
              <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">کاربر فعال</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>پایش تب‌ها و نشست‌های فعال</span>
            </div>
          </div>

          {/* Today Visits */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">بازدید امروز</span>
              <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono tracking-tight">
                {toPersianDigits(todayVisits)}
              </span>
              <span className="text-xs font-medium text-blue-600/80 dark:text-blue-400/80">بازدید</span>
            </div>
            <div className="mt-1 text-[10px] text-blue-600 dark:text-blue-400">
              <span>میانگین روزانه: {toPersianDigits(Math.round(totalVisits / 7))}</span>
            </div>
          </div>

          {/* Total Visits All Time */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-fuchsia-50/50 dark:from-purple-950/30 dark:to-fuchsia-950/20 border border-purple-200/80 dark:border-purple-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">کل بازدیدها</span>
              <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono tracking-tight">
                {toPersianDigits(totalVisits)}
              </span>
              <span className="text-xs font-medium text-purple-600/80 dark:text-purple-400/80">مرتبه</span>
            </div>
            <div className="mt-1 text-[10px] text-purple-600 dark:text-purple-400">
              <span>ذخیره دائمی محلی</span>
            </div>
          </div>

          {/* Current Session Duration */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">مدت نشست کنونی</span>
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-tight" dir="ltr">
                {formatDuration(sessionDurationSec)}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
              <span>شمارش زنده زمان اتصال</span>
            </div>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                نمودار روند بازدیدهای اخیر (۷ روز گذشته)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              مجموع ۷ روز: {toPersianDigits(dailyHistory.reduce((acc, curr) => acc + curr.count, 0))} بازدید
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end h-28">
            {dailyHistory.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.count / maxHistoryCount) * 100));
              const isToday = idx === dailyHistory.length - 1;
              return (
                <div key={item.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                    {toPersianDigits(item.count)}
                  </span>
                  <div className="w-full max-w-[28px] bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className={`w-full rounded-t-lg transition-colors ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-xs'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-blue-500 group-hover:to-blue-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold truncate ${
                      isToday
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PUBLIC HOMEPAGE VIEW (Sleek Glass Spatial Widget with Expandable View)
  // -------------------------------------------------------------
  return (
    <div
      id="public-telemetry-dashboard"
      className={`w-full rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-[#0c1120]/70 border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Primary Bar: Quick Metrics */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Indicator & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                داشبورد آماری
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              آمار بازدید روزانه، پایش نشست‌ها و نمودار ترافیک
            </span>
          </div>
        </div>

        {/* Center: Live Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Active Users Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 shadow-2xs">
            <Users className="w-4 h-4 text-emerald-500" />
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">کاربران فعال:</span>
              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                {toPersianDigits(activeSessionsCount)}
              </span>
              <span className="text-[10px] text-slate-400">نفر</span>
            </div>
          </div>

          {/* Daily Visits Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-800 dark:text-blue-200 shadow-2xs">
            <Eye className="w-4 h-4 text-blue-500" />
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">بازدید امروز:</span>
              <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400 font-mono">
                {toPersianDigits(todayVisits)}
              </span>
              <span className="text-[10px] text-slate-400">بار</span>
            </div>
          </div>

          {/* Session Duration Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">زمان حضور:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200" dir="rtl">
                {formatDuration(sessionDurationSec)}
              </span>
            </div>
          </div>

          {/* Toggle Expand Details Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title={isExpanded ? 'بستن جزئیات' : 'مشاهده نمودار بازدیدها'}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline text-[11px]">
              {isExpanded ? 'بستن نمودار' : 'نمودار بازدیدها'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Section: 7-Day Trend Chart */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 bg-slate-50/50 dark:bg-black/20 space-y-4 overflow-hidden"
          >
            {/* 7-Day Trend Chart */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    نمودار مقایسه‌ای بازدیدهای ۷ روز اخیر
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    کل بازدیدهای ثبت‌شده:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{toPersianDigits(totalVisits)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulate}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{justSimulated ? 'ثبت شد!' : '+ ثبت بازدید آزمایشی'}</span>
                  </button>
                </div>
              </div>

              {/* 7-Day Bars */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-3 items-end h-24 sm:h-28">
                {dailyHistory.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.count / maxHistoryCount) * 100));
                  const isToday = idx === dailyHistory.length - 1;
                  return (
                    <div key={item.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
                        {toPersianDigits(item.count)}
                      </span>
                      <div className="w-full max-w-[36px] bg-slate-200/80 dark:bg-white/[0.06] rounded-t-xl overflow-hidden flex items-end h-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.04 }}
                          className={`w-full rounded-t-xl transition-all ${
                            isToday
                              ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm'
                              : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-blue-500 group-hover:to-blue-400'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-medium truncate ${
                          isToday
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

