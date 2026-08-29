import React, { useState, useRef } from 'react';
import { X, Search, Upload, Check, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { BUILTIN_ICONS, BuiltinIcon } from '../data/builtinIcons';
import { api } from '../lib/api';
import { AppIcon } from './AppIcon';

interface IconPickerModalProps {
  currentIcon: string;
  onSelectIcon: (icon: string) => void;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  currentIcon,
  onSelectIcon,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'builtin' | 'upload'>('builtin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All Icons' },
    { id: 'os', label: 'Linux OS' },
    { id: 'infra', label: 'Infrastructure' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'storage', label: 'Storage' },
    { id: 'media', label: 'Media' },
    { id: 'network', label: 'Network & Security' },
    { id: 'dev', label: 'Dev & DB' },
    { id: 'enterprise', label: 'Enterprise & SaaS' },
    { id: 'smarthome', label: 'Smart Home' },
    { id: 'general', label: 'General & Hardware' }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      setUploadError(err.message || 'Failed to upload icon');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      id="icon-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
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
                Choose Application Icon
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select from {BUILTIN_ICONS.length}+ built-in Linux logos or upload custom icon
              </p>
            </div>
          </div>
          <button
            id="close-icon-picker"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <button
            id="tab-builtin-icons"
            onClick={() => setActiveTab('builtin')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'builtin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Built-in Icons ({BUILTIN_ICONS.length})
          </button>
          <button
            id="tab-upload-icon"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upload Custom Icon (PNG/SVG/WebP)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'builtin' ? (
            <div className="space-y-4">
              {/* Search Bar & Category Pills */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="icon-search-input"
                    type="text"
                    placeholder="Search icons (e.g. Proxmox, Docker, Jellyfin, WireGuard, Nextcloud)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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
                      <span className="mt-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 text-center truncate w-full">
                        {icon.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 p-0.5 rounded-full bg-blue-600 text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No built-in icons match "{searchQuery}". Try searching another keyword or upload a custom image.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-950/40 text-center transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  id="custom-icon-upload-input"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Upload Custom Icon Image
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      PNG with transparent background, SVG (sanitized), WebP or JPG up to 5MB.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading & Sanitizing...' : 'Select File from Computer'}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Current Icon Preview */}
              {currentIcon && currentIcon.startsWith('/uploads/') && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border p-1.5 flex items-center justify-center">
                      <img src={currentIcon} alt="Current custom icon" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Current Custom Icon
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">
                        {currentIcon}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectIcon('terminal')}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Current selection:</span>
            <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 p-0.5 flex items-center justify-center">
              <AppIcon icon={currentIcon} className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
