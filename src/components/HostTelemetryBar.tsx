import React from 'react';
import { Cpu, HardDrive, Server, Clock, Activity, Zap, Wifi, Users, Eye } from 'lucide-react';
import { SystemInfo, ActivityStats } from '../types';
import { toPersianDigits } from '../lib/utils';

interface HostTelemetryBarProps {
  systemInfo: SystemInfo | null;
  activity?: ActivityStats | null;
  className?: string;
}

export const HostTelemetryBar: React.FC<HostTelemetryBarProps> = ({ systemInfo, activity, className = '' }) => {
  if (!systemInfo) return null;

  const cpuPercent = systemInfo.cpuPercent ?? 14;
  const memUsedPercent = systemInfo.memUsedPercent ?? Math.min(100, Math.round(((systemInfo.heapUsedMB || 54) / 512) * 100));

  const storageUsedPercent = systemInfo.storageUsedPercent ?? 38;

  // Format uptime
  const uptimeSec = systemInfo.hostUptimeSeconds || systemInfo.uptimeSeconds || 86400 * 4 + 3600 * 12;
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const mins = Math.floor((uptimeSec % 3600) / 60);
  const uptimeStr = days > 0
    ? `${toPersianDigits(days)} روز و ${toPersianDigits(hours)} ساعت`
    : `${toPersianDigits(hours)} ساعت و ${toPersianDigits(mins)} دقیقه`;

  const activeUsers = activity?.activeUsersCount || 1;
  const todayVisits = activity?.todayVisits || 1;

  return (
    <div
      id="host-telemetry-bar"
      className={`w-full max-w-7xl mx-auto px-4 py-2 ${className}`}
    >
      <div className="relative p-4 rounded-3xl backdrop-blur-xl backdrop-saturate-[180%] bg-white/75 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.12] dark:border-t-white/[0.22] shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-wrap items-center justify-between gap-4 transition-all duration-300 overflow-hidden font-sans">
        {/* Subtle Ambient Light in Background */}
        <div className="absolute -top-10 left-1/4 w-48 h-16 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-48 h-16 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Host Label & Activity Summary */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-white/[0.07] border border-indigo-500/20 dark:border-white/15 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                وضعیت سرور و کاربران فعال
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                فعال
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400" dir="ltr">
              {systemInfo.platform} ({systemInfo.arch}) · {toPersianDigits(systemInfo.cpuCount || 8)} هسته پردازشی
            </span>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="flex-1 flex flex-wrap items-center justify-end gap-3 sm:gap-5 min-w-[280px] relative z-10 text-xs">
          {/* Active Users Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 shadow-xs">
            <Users className="w-4 h-4 text-blue-500" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">کاربران فعال:</span>
              <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">
                {toPersianDigits(activeUsers)}
              </span>
              <span className="text-[10px] text-slate-400">نفر</span>
            </div>
          </div>

          {/* Today Visits Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 shadow-xs">
            <Eye className="w-4 h-4 text-purple-500" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">بازدید امروز:</span>
              <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400">
                {toPersianDigits(todayVisits)}
              </span>
              <span className="text-[10px] text-slate-400">بار</span>
            </div>
          </div>

          {/* CPU Load */}
          <div className="flex items-center gap-2 min-w-[110px]">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 dark:bg-white/[0.06] border border-indigo-500/20 dark:border-white/10 text-indigo-500 dark:text-indigo-400">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 min-w-[75px]">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">پردازنده</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{toPersianDigits(cpuPercent)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400"
                  style={{ width: `${Math.max(6, Math.min(100, cpuPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* RAM Usage */}
          <div className="flex items-center gap-2 min-w-[110px]">
            <div className="p-1.5 rounded-xl bg-sky-500/10 dark:bg-white/[0.06] border border-sky-500/20 dark:border-white/10 text-sky-500 dark:text-sky-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 min-w-[75px]">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">حافظه رم</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{toPersianDigits(memUsedPercent)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                  style={{ width: `${Math.max(6, Math.min(100, memUsedPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Storage Capacity */}
          <div className="flex items-center gap-2 min-w-[110px]">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 dark:bg-white/[0.06] border border-emerald-500/20 dark:border-white/10 text-emerald-500 dark:text-emerald-400">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 min-w-[75px]">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">دیسک</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{toPersianDigits(storageUsedPercent)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.max(6, Math.min(100, storageUsedPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="flex items-center gap-2 pr-2 sm:border-r border-slate-200/80 dark:border-white/10">
            <div className="p-1.5 rounded-xl bg-purple-500/10 dark:bg-white/[0.06] border border-purple-500/20 dark:border-white/10 text-purple-500 dark:text-purple-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                آپ‌تایم
              </span>
              <span className="font-medium text-[11px] text-slate-900 dark:text-white">
                {uptimeStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
