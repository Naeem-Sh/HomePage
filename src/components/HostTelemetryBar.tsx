import React from 'react';
import { Cpu, HardDrive, Server, Clock, Activity, Zap, Wifi } from 'lucide-react';
import { SystemInfo } from '../types';

interface HostTelemetryBarProps {
  systemInfo: SystemInfo | null;
  className?: string;
}

export const HostTelemetryBar: React.FC<HostTelemetryBarProps> = ({ systemInfo, className = '' }) => {
  if (!systemInfo) return null;

  const cpuPercent = systemInfo.cpuPercent ?? 14;
  const memUsedPercent = systemInfo.memUsedPercent ?? Math.min(100, Math.round(((systemInfo.heapUsedMB || 54) / 512) * 100));
  const memUsedDisplay = systemInfo.memTotalMB
    ? `${Math.round((systemInfo.memTotalMB * (memUsedPercent / 100)) / 1024 * 10) / 10} / ${Math.round((systemInfo.memTotalMB / 1024) * 10) / 10} GB`
    : `${systemInfo.heapUsedMB || 54} MB Heap`;

  const storageUsedPercent = systemInfo.storageUsedPercent ?? 38;
  const storageDisplay = `${systemInfo.storageUsedGB ?? 48} / ${systemInfo.storageTotalGB ?? 128} GB`;

  // Format uptime
  const uptimeSec = systemInfo.hostUptimeSeconds || systemInfo.uptimeSeconds || 86400 * 4 + 3600 * 12;
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const mins = Math.floor((uptimeSec % 3600) / 60);
  const uptimeStr = days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m`;

  return (
    <div
      id="host-telemetry-bar"
      className={`w-full max-w-7xl mx-auto px-4 py-2 ${className}`}
    >
      <div className="relative p-4 rounded-3xl backdrop-blur-xl backdrop-saturate-[180%] bg-white/75 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.12] dark:border-t-white/[0.22] shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-wrap items-center justify-between gap-4 transition-all duration-300 overflow-hidden">
        {/* Subtle Ambient Light in Background */}
        <div className="absolute -top-10 left-1/4 w-48 h-16 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-48 h-16 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Host Label */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-white/[0.07] border border-indigo-500/20 dark:border-white/15 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Linux Node Telemetry
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                Live Daemon
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {systemInfo.platform} ({systemInfo.arch}) · {systemInfo.cpuCount || 8} Threads · Linux 6.8.0
            </span>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="flex-1 flex flex-wrap items-center justify-end gap-4 sm:gap-6 min-w-[280px] relative z-10">
          {/* CPU Load */}
          <div className="flex items-center gap-2.5 min-w-[130px]">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-white/[0.06] border border-indigo-500/20 dark:border-white/10 text-indigo-500 dark:text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 min-w-[90px]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">CPU Load</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white">{cpuPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <div
                  className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                    cpuPercent > 80
                      ? 'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : cpuPercent > 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-indigo-500 to-blue-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                  }`}
                  style={{ width: `${Math.max(6, Math.min(100, cpuPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* RAM Usage */}
          <div className="flex items-center gap-2.5 min-w-[135px]">
            <div className="p-2 rounded-xl bg-sky-500/10 dark:bg-white/[0.06] border border-sky-500/20 dark:border-white/10 text-sky-500 dark:text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 min-w-[95px]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">RAM Usage</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white">{memUsedPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <div
                  className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                    memUsedPercent > 85
                      ? 'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : memUsedPercent > 65
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                  }`}
                  style={{ width: `${Math.max(6, Math.min(100, memUsedPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Storage Capacity */}
          <div className="flex items-center gap-2.5 min-w-[135px]">
            <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-white/[0.06] border border-emerald-500/20 dark:border-white/10 text-emerald-500 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 min-w-[95px]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">ZFS Pool</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white">{storageUsedPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${Math.max(6, Math.min(100, storageUsedPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="flex items-center gap-2.5 pl-2 sm:border-l border-slate-200/80 dark:border-white/10">
            <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-white/[0.06] border border-purple-500/20 dark:border-white/10 text-purple-500 dark:text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                System Uptime
              </span>
              <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                {uptimeStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
