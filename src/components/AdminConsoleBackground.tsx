import React from 'react';

export type AdminBgStyle = 'blueprint' | 'cyber-dark' | 'mesh-indigo' | 'terminal';

interface AdminConsoleBackgroundProps {
  className?: string;
  style?: AdminBgStyle;
}

export const AdminConsoleBackground: React.FC<AdminConsoleBackgroundProps> = ({
  className = '',
  style = 'blueprint'
}) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 transition-colors duration-700 ${className}`}
    >
      {/* 1. Blueprint Grid Theme (Default) */}
      {style === 'blueprint' && (
        <>
          {/* Light Mode: Crisp Technical Engineering Grid */}
          <div className="block dark:hidden absolute inset-0 bg-[#EDF2F7]">
            {/* Technical Blueprint Grid Lines */}
            <div
              className="absolute inset-0 opacity-55"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99, 102, 241, 0.09) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.09) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
            {/* Radial Dot Matrix */}
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            {/* Top Atmospheric Admin Glow */}
            <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/40 via-blue-200/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/35 via-indigo-100/25 to-transparent rounded-full blur-3xl" />
          </div>

          {/* Dark Mode: Deep Datacenter Command Grid */}
          <div className="hidden dark:block absolute inset-0 bg-[#090D1A]">
            {/* Technical Grid */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99, 102, 241, 0.25) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.25) 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px'
              }}
            />
            {/* Server Ambient Orbs */}
            <div className="absolute -top-40 right-1/3 w-[650px] h-[650px] bg-gradient-to-br from-indigo-600/25 via-blue-700/15 to-transparent rounded-full blur-[140px]" />
            <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-purple-700/20 via-indigo-900/15 to-transparent rounded-full blur-[130px]" />
          </div>
        </>
      )}

      {/* 2. Cyber Dark Theme */}
      {style === 'cyber-dark' && (
        <div className="absolute inset-0 bg-[#06080F]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1.2px, transparent 1.2px)',
              backgroundSize: '28px 28px'
            }}
          />
          <div className="absolute -top-24 -right-24 w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        </div>
      )}

      {/* 3. Mesh Indigo Theme */}
      {style === 'mesh-indigo' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/90 via-indigo-100/60 to-blue-100/50 dark:from-[#090D16] dark:via-[#0F172A] dark:to-[#080C14]">
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-indigo-500/15 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent" />
        </div>
      )}

      {/* 4. Terminal Theme */}
      {style === 'terminal' && (
        <div className="absolute inset-0 bg-[#05080E]">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16, 185, 129, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px'
            }}
          />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px]" />
        </div>
      )}

      {/* Subtle Admin Corner Technical Watermark */}
      <div className="absolute top-16 left-6 text-[10px] font-mono tracking-widest text-indigo-600/30 dark:text-indigo-400/25 select-none uppercase hidden 2xl:block" dir="ltr">
        // HOMELAB CONTROL CENTER - NODE: ROOT //
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] font-mono tracking-widest text-indigo-600/30 dark:text-indigo-400/25 select-none uppercase hidden 2xl:block" dir="ltr">
        // SECURE ADMINISTRATIVE SESSION ACTIVE //
      </div>
    </div>
  );
};
