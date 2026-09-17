import React, { useState, useRef } from 'react';
import { X, Search, Upload, Check, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { BUILTIN_ICONS, BuiltinIcon } from '../data/builtinIcons';
import { api } from '../lib/api';
import { AppIcon } from './AppIcon';

interface IconPickerModalProps {
  currentIcon: string;
  onSelectIcon: (icon: string) => void;
  onClose: () => void;
  initialTab?: 'builtin' | 'upload';
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  currentIcon,
  onSelectIcon,
  onClose,
  initialTab = 'builtin'
}) => {
  const [activeTab, setActiveTab] = useState<'builtin' | 'upload'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'همه آیکون‌ها' },
    { id: 'office', label: 'اداری و اسناد' },
    { id: 'storage', label: 'ذخیره‌سازی و فایل' },
    { id: 'network', label: 'شبکه و امنیت' },
    { id: 'infra', label: 'زیرساخت و سرور' },
    { id: 'monitoring', label: 'مانیتورینگ' },
    { id: 'os', label: 'سیستم‌عامل' },
    { id: 'media', label: 'رسانه' },
    { id: 'dev', label: 'توسعه' },
    { id: 'smarthome', label: 'خانه هوشمند' },
    { id: 'general', label: 'عمومی' }
  ];

  const filteredIcons = BUILTIN_ICONS.filter((icon) => {
    const matchesCat = selectedCategory === 'all' || icon.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      icon.name.toLowerCase().includes(q) ||
      icon.id.toLowerCase().includes(q) ||
      icon.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const processFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await api.uploadIcon(file);
      if (res.success && res.iconUrl) {
        onSelectIcon(res.iconUrl);
        onClose();
      }
    } catch (err: any) {
      setUploadError(err.message || 'خطا در بارگذاری تصویر آیکون');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <div
      id="icon-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="icon-picker-modal-dialog"
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                انتخاب آیکون برنامه
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                انتخاب از بین بیش از {BUILTIN_ICONS.length} آیکون لینوکس و هوم‌لب یا بارگذاری تصویر سفارشی
              </p>
            </div>
          </div>
          <button
            id="close-icon-picker"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <button
            id="tab-builtin-icons"
            onClick={() => setActiveTab('builtin')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'builtin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            آیکون‌های داخلی ({BUILTIN_ICONS.length})
          </button>
          <button
            id="tab-upload-icon"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>بارگذاری تصویر سفارشی (PNG شفاف / JPG)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'builtin' ? (
            <div className="space-y-4">
              {/* Search Bar & Category Pills */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="icon-search-input"
                    type="text"
                    placeholder="جستجوی آیکون (مثلاً Proxmox، Docker، Jellyfin، WireGuard)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Icons */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-80 overflow-y-auto p-1">
                {filteredIcons.map((icon) => {
                  const isSelected = currentIcon === icon.id;
                  return (
                    <button
                      key={icon.id}
                      id={`icon-choice-${icon.id}`}
                      onClick={() => {
                        onSelectIcon(icon.id);
                        onClose();
                      }}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                      }`}
                      title={`${icon.name} (${icon.tags.join(', ')})`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        <AppIcon icon={icon.id} className="w-7 h-7 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="mt-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 text-center truncate w-full" dir="ltr">
                        {icon.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 left-1 p-0.5 rounded-full bg-blue-600 text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  هیچ آیکونی با عنوان «{searchQuery}» یافت نشد. می‌توانید عبارت دیگری را جستجو کنید یا آیکون دلخواه خود را بارگذاری کنید.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`p-7 rounded-2xl border-2 border-dashed text-center transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-950/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                  id="custom-icon-upload-input"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      بارگذاری تصویر آیکون (PNG شفاف / JPG)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                      فایل عکس را بکشید و اینجا رها کنید، یا دکمه زیر را برای انتخاب فایل کلیک کنید.
                    </p>
                  </div>

                  {/* Format Badges */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                      PNG با زمینه شفاف (بدون کادر)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                      JPG / JPEG استاندارد
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[10px] font-semibold">
                      WebP سبک
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-semibold">
                      SVG وکتور
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'در حال بارگذاری و بهینه‌سازی...' : 'انتخاب تصویر از سیستم'}</span>
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Current Custom Icon Preview with Transparency Checkerboard */}
              {currentIcon && currentIcon.startsWith('/uploads/') && (
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Checkerboard Pattern for transparent PNG inspection */}
                      <div
                        className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-600 p-1 flex items-center justify-center shadow-xs overflow-hidden"
                        style={{
                          backgroundImage: `linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)`,
                          backgroundSize: '12px 12px',
                          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <img
                          src={currentIcon}
                          alt="Custom icon"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            تصویر سفارشی انتخاب‌شده
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono">
                            فعال
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs mt-0.5" dir="ltr">
                          {currentIcon}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectIcon('terminal')}
                      className="px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف و بازگشت به آیکون پیش‌فرض</span>
                    </button>
                  </div>

                  {/* Visual Test on Light vs Dark */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                    <span>پیش‌نمایش روی پس‌زمینه‌های مختلف:</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">روشن:</span>
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
                          <img src={currentIcon} alt="light preview" className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">تیره:</span>
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shadow-2xs">
                          <img src={currentIcon} alt="dark preview" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">آیکون انتخاب‌شده:</span>
            <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 p-0.5 flex items-center justify-center">
              <AppIcon icon={currentIcon} className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            تایید و پایان
          </button>
        </div>
      </div>
    </div>
  );
};
