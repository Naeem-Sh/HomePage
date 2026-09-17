import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  ArrowRightLeft,
  Globe,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { Category } from '../types';
import { ParsedBackupResult } from '../lib/excelBackup';
import { toPersianDigits } from '../lib/utils';
import { AppIcon } from './AppIcon';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileType: 'excel' | 'json';
  fileName: string;
  parsed: ParsedBackupResult;
  existingCategories: Category[];
  isApplying: boolean;
  onConfirm: (mode: 'merge' | 'replace') => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  onClose,
  fileType,
  fileName,
  parsed,
  existingCategories,
  isApplying,
  onConfirm
}) => {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  if (!isOpen) return null;

  const isExcel = fileType === 'excel';
  const previewApps = parsed.applications.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                isExcel
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
              }`}
            >
              {isExcel ? <FileSpreadsheet className="w-5 h-5" /> : <FileJson className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>پیش‌نمایش و تأیید واردسازی داده‌ها</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isExcel
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}
                >
                  {isExcel ? 'فایل اکسل (XLSX)' : 'فایل JSON'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate max-w-[280px] sm:max-w-md" dir="ltr">
                {fileName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">برنامه‌ها</span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {toPersianDigits(parsed.stats.appsCount)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium block">دسته‌بندی‌ها</span>
              <span className="text-lg font-bold text-purple-900 dark:text-purple-200">
                {toPersianDigits(parsed.stats.categoriesCount)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">تنظیمات کلی</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                {parsed.stats.hasSettings ? 'شامل تنظیمات' : 'بدون تنظیمات'}
              </span>
            </div>
          </div>

          {/* Import Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              <span>نحوه اعمال و ثبت داده‌ها در سیستم:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  importMode === 'merge'
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>افزودن و ادغام (Merge)</span>
                  </span>
                  {importMode === 'merge' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  برنامه‌های جدید به لیست اضافه شده و داده‌های قبلی حفظ می‌شوند (پیشنهادی).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  importMode === 'replace'
                    ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>جایگزینی کامل (Replace)</span>
                  </span>
                  {importMode === 'replace' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  داده‌های فعلی پاک شده و فقط محتویات این فایل در سیستم قرار می‌گیرند.
                </p>
              </button>
            </div>
          </div>

          {/* Sample Apps Preview */}
          {previewApps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>نمونه برنامه‌های شناسایی‌شده ({toPersianDigits(previewApps.length)} از {toPersianDigits(parsed.applications.length)}):</span>
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
                {previewApps.map((app, i) => {
                  const cat = existingCategories.find(c => c.id === app.categoryId) ||
                              parsed.categories.find(c => c.id === app.categoryId);
                  return (
                    <div key={app.id || i} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                          <AppIcon icon={app.icon} className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {app.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
                            {app.url}
                          </div>
                        </div>
                      </div>

                      {cat && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
                          {cat.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={() => onConfirm(importMode)}
            disabled={isApplying || (parsed.applications.length === 0 && parsed.categories.length === 0 && !parsed.settings)}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 ${
              isExcel
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>در حال ثبت اطلاعات...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تأیید و واردسازی ({importMode === 'merge' ? 'ادغام' : 'جایگزینی'})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
