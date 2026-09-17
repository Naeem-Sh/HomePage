import * as XLSX from 'xlsx';
import { Application, Category, SystemSettings } from '../types';

export interface ExcelBackupData {
  applications: Application[];
  categories: Category[];
  settings?: SystemSettings;
}

export interface ParsedBackupResult {
  applications: Application[];
  categories: Category[];
  settings?: Partial<SystemSettings>;
  stats: {
    appsCount: number;
    categoriesCount: number;
    hasSettings: boolean;
  };
}

/**
 * Exports current dashboard data to a multi-sheet formatted Excel workbook (.xlsx)
 */
export function exportToExcel(data: ExcelBackupData, filenamePrefix = 'homelab'): void {
  const wb = XLSX.utils.book_new();

  // 1. Applications Sheet
  const appsRows = data.applications.map((app, idx) => {
    const category = data.categories.find(c => c.id === app.categoryId);
    return {
      'ردیف': idx + 1,
      'شناسه برنامه': app.id,
      'نام برنامه': app.name,
      'دسته‌بندی': category ? category.name : (app.categoryId || 'عمومی'),
      'شناسه دسته‌بندی': app.categoryId || '',
      'آدرس اینترنتی (URL)': app.url,
      'توضیحات': app.description || '',
      'آیکون': app.icon || 'globe',
      'دسترسی عمومی': app.isPublic ? 'بله' : 'خیر',
      'وضعیت فعال': app.isEnabled !== false ? 'بله' : 'خیر',
      'باز شدن در تب جدید': app.openInNewTab ? 'بله' : 'خیر',
      'ترتیب نمایش': app.sortOrder ?? idx + 1,
      'رنگ برجسته': app.accentColor || '',
      'آدرس فایل پیوست (fileUrl)': app.fileUrl || '',
      'نام فایل پیوست (fileName)': app.fileName || '',
      'برچسب‌ها': Array.isArray(app.tags) ? app.tags.join(', ') : '',
      'داشبوردها': Array.isArray(app.dashboards) ? app.dashboards.join(', ') : 'public, admin'
    };
  });

  const wsApps = XLSX.utils.json_to_sheet(appsRows);
  // Auto column widths
  wsApps['!cols'] = [
    { wch: 6 },  // ردیف
    { wch: 24 }, // شناسه برنامه
    { wch: 22 }, // نام برنامه
    { wch: 20 }, // دسته‌بندی
    { wch: 20 }, // شناسه دسته‌بندی
    { wch: 32 }, // آدرس URL
    { wch: 35 }, // توضیحات
    { wch: 16 }, // آیکون
    { wch: 14 }, // عمومی
    { wch: 12 }, // فعال
    { wch: 18 }, // تب جدید
    { wch: 12 }, // ترتیب
    { wch: 14 }, // رنگ
    { wch: 30 }, // آدرس فایل پیوست
    { wch: 24 }, // نام فایل پیوست
    { wch: 20 }, // برچسب‌ها
    { wch: 16 }, // داشبوردها
  ];
  XLSX.utils.book_append_sheet(wb, wsApps, 'برنامه‌ها (Applications)');

  // 2. Categories Sheet
  const catRows = data.categories.map((cat, idx) => ({
    'ردیف': idx + 1,
    'شناسه دسته‌بندی': cat.id,
    'نام دسته‌بندی': cat.name,
    'آیکون': cat.icon,
    'ترتیب نمایش': cat.sortOrder ?? idx + 1,
    'توضیحات': cat.description || ''
  }));
  const wsCats = XLSX.utils.json_to_sheet(catRows);
  wsCats['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 22 },
    { wch: 16 },
    { wch: 12 },
    { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsCats, 'دسته‌بندی‌ها (Categories)');

  // 3. Settings Sheet
  if (data.settings) {
    const settingsRows = [
      { 'پارامتر': 'عنوان سرور و هوم‌لب', 'کلید': 'title', 'مقدار': data.settings.title || '' },
      { 'پارامتر': 'زیرعنوان', 'کلید': 'subtitle', 'مقدار': data.settings.subtitle || '' },
      { 'پارامتر': 'حالت پیش‌فرض تم (light/dark)', 'کلید': 'defaultTheme', 'مقدار': data.settings.defaultTheme || 'dark' },
      { 'پارامتر': 'نوع ساعت (analog/digital/both/none)', 'کلید': 'clockType', 'مقدار': data.settings.clockType || 'both' },
      { 'پارامتر': 'نمایش تاریخ', 'کلید': 'showDate', 'مقدار': data.settings.showDate ? 'true' : 'false' },
      { 'پارامتر': 'نمایش ثانیه‌شمار', 'کلید': 'showSeconds', 'مقدار': data.settings.showSeconds ? 'true' : 'false' },
      { 'پارامتر': 'تعداد ستون‌ها در دسکتاپ (2 تا 8)', 'کلید': 'gridColumns', 'مقدار': String(data.settings.gridColumns || 4) },
      { 'پارامتر': 'جستجوی عمومی', 'کلید': 'publicSearch', 'مقدار': data.settings.publicSearch !== false ? 'true' : 'false' },
      { 'پارامتر': 'متن پاورقی سفارشی', 'کلید': 'customFooterText', 'مقدار': data.settings.customFooterText || '' },
      { 'پارامتر': 'آدرس لوگو', 'کلید': 'logoUrl', 'مقدار': data.settings.logoUrl || '' },
      { 'پارامتر': 'آدرس تصویر پس‌زمینه', 'کلید': 'backgroundUrl', 'مقدار': data.settings.backgroundUrl || '' },
      { 'پارامتر': 'مات بودن پس‌زمینه', 'کلید': 'backgroundBlur', 'مقدار': data.settings.backgroundBlur ? 'true' : 'false' },
      { 'پارامتر': 'شفافیت لایه تیره پس‌زمینه (0 تا 90)', 'کلید': 'backgroundOverlayOpacity', 'مقدار': String(data.settings.backgroundOverlayOpacity ?? 40) },
      { 'پارامتر': 'نمایش نوار تله‌متری', 'کلید': 'showTelemetryBar', 'مقدار': data.settings.showTelemetryBar !== false ? 'true' : 'false' },
      { 'پارامتر': 'موقعیت نوار تله‌متری (top/bottom)', 'کلید': 'telemetryPosition', 'مقدار': data.settings.telemetryPosition || 'top' }
    ];
    const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
    wsSettings['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSettings, 'تنظیمات (Settings)');
  }

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}-data-${dateStr}.xlsx`);
}

/**
 * Downloads an empty Excel template formatted for easy bulk application additions
 */
export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  const sampleApps = [
    {
      'نام برنامه': 'Nextcloud',
      'دسته‌بندی': 'ذخیره‌سازی و فایل',
      'آدرس اینترنتی (URL)': 'https://cloud.homelab.local',
      'توضیحات': 'فضای ابری شخصی و اشتراک اسناد و تصاویر',
      'آیکون': 'cloud',
      'دسترسی عمومی': 'بله',
      'وضعیت فعال': 'بله',
      'باز شدن در تب جدید': 'بله',
      'ترتیب نمایش': 1,
      'رنگ برجسته': '#0082c9',
      'برچسب‌ها': 'cloud, storage, personal'
    },
    {
      'نام برنامه': 'Plex Media Server',
      'دسته‌بندی': 'چندرسانه‌ای',
      'آدرس اینترنتی (URL)': 'https://plex.homelab.local:32400',
      'توضیحات': 'استریم ویدیو، فیلم و سریال‌های خانگی',
      'آیکون': 'film',
      'دسترسی عمومی': 'خیر',
      'وضعیت فعال': 'بله',
      'باز شدن در تب جدید': 'بله',
      'ترتیب نمایش': 2,
      'رنگ برجسته': '#e5a00d',
      'برچسب‌ها': 'movies, stream, media'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleApps);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 34 },
    { wch: 38 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'برنامه‌ها (Applications)');

  const sampleCats = [
    { 'نام دسته‌بندی': 'ذخیره‌سازی و فایل', 'آیکون': 'folder', 'ترتیب نمایش': 1, 'توضیحات': 'سرویس‌های ذخیره‌سازی ابری و دیسک' },
    { 'نام دسته‌بندی': 'چندرسانه‌ای', 'آیکون': 'play-circle', 'ترتیب نمایش': 2, 'توضیحات': 'پخش فیلم، موسیقی و صوت' },
    { 'نام دسته‌بندی': 'ابزارهای مانیتورینگ', 'آیکون': 'activity', 'ترتیب نمایش': 3, 'توضیحات': 'داشبوردهای سنجش عملکرد سرور' }
  ];
  const wsCats = XLSX.utils.json_to_sheet(sampleCats);
  wsCats['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsCats, 'دسته‌بندی‌ها (Categories)');

  XLSX.writeFile(wb, 'homelab-template.xlsx');
}

/**
 * Parses an Excel (.xlsx / .xls / .csv) file uploaded by the user
 */
export async function parseExcelFile(
  file: File,
  existingCategories: Category[]
): Promise<ParsedBackupResult> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });

  const categoriesMap = new Map<string, Category>();
  existingCategories.forEach(c => categoriesMap.set(c.id, c));
  existingCategories.forEach(c => categoriesMap.set(c.name.trim().toLowerCase(), c));

  const parsedCategories: Category[] = [];
  const parsedApplications: Application[] = [];

  // Helper to normalize strings
  const norm = (v: any) => (v !== undefined && v !== null ? String(v).trim() : '');
  const toBool = (v: any, defaultVal = true) => {
    if (v === undefined || v === null || v === '') return defaultVal;
    const s = String(v).trim().toLowerCase();
    if (s === 'بله' || s === 'true' || s === '1' || s === 'yes' || s === 'فعال') return true;
    if (s === 'خیر' || s === 'false' || s === '0' || s === 'no' || s === 'غیرفعال') return false;
    return defaultVal;
  };

  // Helper to search across keys
  const getVal = (row: any, ...possibleKeys: string[]) => {
    for (const k of possibleKeys) {
      if (row[k] !== undefined) return row[k];
      const match = Object.keys(row).find(
        rk => rk.trim().toLowerCase() === k.trim().toLowerCase()
      );
      if (match && row[match] !== undefined) return row[match];
    }
    return undefined;
  };

  // 1. Check for Categories Sheet
  const catSheetName = wb.SheetNames.find(s =>
    s.includes('دسته‌بندی') || s.toLowerCase().includes('categor')
  );
  if (catSheetName) {
    const rawCats = XLSX.utils.sheet_to_json<any>(wb.Sheets[catSheetName]);
    rawCats.forEach((row, idx) => {
      const name = norm(getVal(row, 'نام دسته‌بندی', 'نام', 'name', 'category', 'CategoryName'));
      if (!name) return;

      const rawId = norm(getVal(row, 'شناسه دسته‌بندی', 'شناسه', 'id', 'categoryId'));
      const id = rawId || `cat_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
      const icon = norm(getVal(row, 'آیکون', 'icon', 'iconName')) || 'folder';
      const sortOrder = Number(getVal(row, 'ترتیب نمایش', 'ترتیب', 'order', 'sortOrder')) || (idx + 1);
      const description = norm(getVal(row, 'توضیحات', 'description', 'desc'));

      const newCat: Category = { id, name, icon, sortOrder, description };
      parsedCategories.push(newCat);
      categoriesMap.set(id, newCat);
      categoriesMap.set(name.toLowerCase(), newCat);
    });
  }

  // 2. Applications Sheet (Search for sheet name, or fallback to first sheet)
  const appSheetName =
    wb.SheetNames.find(s => s.includes('برنامه') || s.toLowerCase().includes('app')) ||
    wb.SheetNames[0];

  if (appSheetName) {
    const rawApps = XLSX.utils.sheet_to_json<any>(wb.Sheets[appSheetName]);
    rawApps.forEach((row, idx) => {
      const name = norm(getVal(row, 'نام برنامه', 'نام', 'name', 'title', 'appName'));
      const url = norm(getVal(row, 'آدرس اینترنتی (URL)', 'آدرس', 'url', 'link', 'href'));

      if (!name || !url) return; // Basic required fields

      const rawAppId = norm(getVal(row, 'شناسه برنامه', 'شناسه', 'id', 'appId'));
      const id = rawAppId || `app_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;

      // Resolve category
      const catNameOrId = norm(getVal(row, 'دسته‌بندی', 'شناسه دسته‌بندی', 'دسته', 'category', 'categoryId'));
      let categoryId = '';

      if (catNameOrId) {
        const found = categoriesMap.get(catNameOrId) || categoriesMap.get(catNameOrId.toLowerCase());
        if (found) {
          categoryId = found.id;
        } else {
          // Auto create a category with this name!
          const newCatId = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const autoCat: Category = {
            id: newCatId,
            name: catNameOrId,
            icon: 'folder',
            sortOrder: categoriesMap.size + 1
          };
          parsedCategories.push(autoCat);
          categoriesMap.set(newCatId, autoCat);
          categoriesMap.set(catNameOrId.toLowerCase(), autoCat);
          categoryId = newCatId;
        }
      } else if (existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
      }

      const description = norm(getVal(row, 'توضیحات', 'description', 'desc'));
      const icon = norm(getVal(row, 'آیکون', 'icon', 'iconName')) || 'globe';
      const isPublic = toBool(getVal(row, 'دسترسی عمومی', 'عمومی', 'isPublic', 'public'), true);
      const isEnabled = toBool(getVal(row, 'وضعیت فعال', 'فعال', 'isEnabled', 'enabled'), true);
      const openInNewTab = toBool(getVal(row, 'باز شدن در تب جدید', 'تب جدید', 'openInNewTab', 'newTab'), true);
      const sortOrder = Number(getVal(row, 'ترتیب نمایش', 'ترتیب', 'order', 'sortOrder')) || (idx + 1);
      const accentColor = norm(getVal(row, 'رنگ برجسته', 'رنگ', 'accentColor', 'color'));

      const rawTags = getVal(row, 'برچسب‌ها', 'برچسب', 'tags', 'tag');
      let tags: string[] = [];
      if (Array.isArray(rawTags)) {
        tags = rawTags.map(String);
      } else if (typeof rawTags === 'string' && rawTags.trim()) {
        tags = rawTags.split(/[,،]/).map(t => t.trim()).filter(Boolean);
      }

      const rawDashboards = norm(getVal(row, 'داشبوردها', 'dashboards'));
      let dashboards: ('public' | 'admin')[] = ['public', 'admin'];
      if (rawDashboards) {
        const parts = rawDashboards.split(',').map(p => p.trim().toLowerCase());
        const valid = parts.filter(p => p === 'public' || p === 'admin') as ('public' | 'admin')[];
        if (valid.length > 0) dashboards = valid;
      }

      const fileUrl = norm(getVal(row, 'آدرس فایل پیوست (fileUrl)', 'فایل پیوست', 'fileUrl', 'file'));
      const fileName = norm(getVal(row, 'نام فایل پیوست (fileName)', 'نام فایل', 'fileName'));

      parsedApplications.push({
        id,
        name,
        description,
        url,
        categoryId,
        icon,
        isPublic,
        isEnabled,
        sortOrder,
        openInNewTab,
        accentColor: accentColor || undefined,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        tags: tags.length > 0 ? tags : undefined,
        dashboards
      });
    });
  }

  // 3. Settings Sheet (if present)
  let parsedSettings: Partial<SystemSettings> | undefined;
  const settingsSheetName = wb.SheetNames.find(s =>
    s.includes('تنظیمات') || s.toLowerCase().includes('setting')
  );
  if (settingsSheetName) {
    const rawSettings = XLSX.utils.sheet_to_json<any>(wb.Sheets[settingsSheetName]);
    parsedSettings = {};
    rawSettings.forEach(row => {
      const key = norm(getVal(row, 'کلید', 'key'));
      const val = norm(getVal(row, 'مقدار', 'value', 'val'));
      if (key && val && parsedSettings) {
        if (key === 'title') parsedSettings.title = val;
        if (key === 'subtitle') parsedSettings.subtitle = val;
        if (key === 'defaultTheme' && (val === 'light' || val === 'dark')) {
          parsedSettings.defaultTheme = val;
        }
        if (key === 'clockType' && (val === 'analog' || val === 'digital' || val === 'both' || val === 'none')) {
          parsedSettings.clockType = val;
        }
        if (key === 'showDate') parsedSettings.showDate = val === 'true' || val === 'بله';
        if (key === 'showSeconds') parsedSettings.showSeconds = val === 'true' || val === 'بله';
        if (key === 'gridColumns') {
          const cols = Number(val);
          if (cols >= 2 && cols <= 8) {
            parsedSettings.gridColumns = cols as any;
          }
        }
        if (key === 'publicSearch') parsedSettings.publicSearch = val === 'true' || val === 'بله';
        if (key === 'customFooterText') parsedSettings.customFooterText = val;
        if (key === 'logoUrl') parsedSettings.logoUrl = val;
        if (key === 'backgroundUrl') parsedSettings.backgroundUrl = val || null;
        if (key === 'backgroundBlur') parsedSettings.backgroundBlur = val === 'true' || val === 'بله';
        if (key === 'backgroundOverlayOpacity') {
          const num = Number(val);
          if (!isNaN(num) && num >= 0 && num <= 90) parsedSettings.backgroundOverlayOpacity = num;
        }
        if (key === 'showTelemetryBar') parsedSettings.showTelemetryBar = val === 'true' || val === 'بله';
        if (key === 'telemetryPosition' && (val === 'top' || val === 'bottom')) {
          parsedSettings.telemetryPosition = val;
        }
      }
    });
  }

  return {
    applications: parsedApplications,
    categories: parsedCategories,
    settings: parsedSettings,
    stats: {
      appsCount: parsedApplications.length,
      categoriesCount: parsedCategories.length,
      hasSettings: Boolean(parsedSettings && Object.keys(parsedSettings).length > 0)
    }
  };
}

/**
 * Exports current dashboard data to formatted JSON file
 */
export function exportToJson(data: ExcelBackupData, filenamePrefix = 'homelab'): void {
  const payload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings: data.settings,
    categories: data.categories,
    applications: data.applications
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses JSON backup file text and handles various wrapper shapes
 */
export function parseJsonFile(content: string, existingCategories: Category[] = []): ParsedBackupResult {
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (err: any) {
    throw new Error('فایل JSON معتبر نیست یا ساختار آن خراب است');
  }

  const target = parsed.backup || parsed;
  let rawApps: any[] = [];
  let rawCats: any[] = [];
  let rawSettings: any = undefined;

  if (Array.isArray(target)) {
    rawApps = target;
  } else if (typeof target === 'object' && target !== null) {
    if (Array.isArray(target.applications)) rawApps = target.applications;
    if (Array.isArray(target.categories)) rawCats = target.categories;
    if (target.settings && typeof target.settings === 'object') rawSettings = target.settings;
  }

  // Categories map
  const categoriesMap = new Map<string, Category>();
  existingCategories.forEach(c => categoriesMap.set(c.id, c));
  existingCategories.forEach(c => categoriesMap.set(c.name.trim().toLowerCase(), c));

  const categories: Category[] = [];
  rawCats.forEach((cat: any, idx: number) => {
    if (!cat || typeof cat !== 'object') return;
    const name = String(cat.name || '').trim();
    if (!name) return;
    const id = String(cat.id || `cat_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`);
    const cObj: Category = {
      id,
      name,
      icon: cat.icon || 'folder',
      sortOrder: Number(cat.sortOrder) || idx + 1,
      description: cat.description ? String(cat.description) : undefined
    };
    categories.push(cObj);
    categoriesMap.set(id, cObj);
    categoriesMap.set(name.toLowerCase(), cObj);
  });

  const applications: Application[] = [];
  rawApps.forEach((app: any, idx: number) => {
    if (!app || typeof app !== 'object') return;
    const name = String(app.name || '').trim();
    const url = String(app.url || '').trim();
    if (!name || !url) return;

    const id = String(app.id || `app_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`);
    let categoryId = String(app.categoryId || '');

    if (!categoryId && categoriesMap.size > 0) {
      categoryId = existingCategories[0]?.id || categories[0]?.id || '';
    }

    applications.push({
      id,
      name,
      description: String(app.description || ''),
      url,
      categoryId,
      icon: String(app.icon || 'globe'),
      isPublic: app.isPublic !== false,
      isEnabled: app.isEnabled !== false,
      sortOrder: Number(app.sortOrder) || idx + 1,
      openInNewTab: app.openInNewTab !== false,
      accentColor: app.accentColor ? String(app.accentColor) : undefined,
      fileUrl: app.fileUrl ? String(app.fileUrl) : undefined,
      fileName: app.fileName ? String(app.fileName) : undefined,
      tags: Array.isArray(app.tags) ? app.tags.map(String) : undefined,
      dashboards: Array.isArray(app.dashboards) ? app.dashboards.join(', ') : 'public, admin'
    });
  });

  return {
    applications,
    categories,
    settings: rawSettings,
    stats: {
      appsCount: applications.length,
      categoriesCount: categories.length,
      hasSettings: Boolean(rawSettings && Object.keys(rawSettings).length > 0)
    }
  };
}

