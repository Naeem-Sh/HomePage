import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, HardDrive, AlertCircle, Terminal, HelpCircle } from 'lucide-react';
import { Application } from '../types';

interface DestinationModalProps {
  app: Application | null;
  onClose: () => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({ app, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!app) return null;

  const isUnc = app.url.startsWith('\\\\') || app.url.startsWith('smb://') || app.url.startsWith('nfs://');
  const isFilePath = app.url.startsWith('file://') || app.url.startsWith('/');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(app.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      id="destination-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="destination-modal-card"
        className="relative w-full max-w-lg rounded-3xl bg-[#0d1322]/95 border border-white/[0.15] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] p-6 md:p-7 overflow-hidden text-slate-100 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.1]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-inner">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {app.name}
              </h3>
              <p className="text-xs text-slate-400">
                {isUnc ? 'Network Resource / UNC Share' : 'Local File Resource'}
              </p>
            </div>
          </div>
          <button
            id="destination-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-200">
                Browser Security Protocol Notice
              </p>
              <p className="text-amber-300/80 leading-relaxed text-[11px]">
                Web browsers restrict direct clicking of network shares (UNC, SMB) and local files for safety. Copy the address below to open in your system file manager.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Network Target Location
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={app.url}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono bg-white/[0.06] border border-white/[0.12] text-blue-300 focus:outline-none select-all"
              />
              <button
                id="copy-destination-url-button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border border-white/15'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.1] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            {app.isPublic ? 'Public Access' : 'Private Access'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
