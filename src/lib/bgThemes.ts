export interface BgPatternTheme {
  id: string;
  name: string;
  enName: string;
  accentDotColor: string; // The central indicator dot shown in swatch
  lightBaseBg: string; // Base background hex / class
  darkBaseBg: string;
  // CSS background image / gradients / SVG patterns
  lightPatternCss: string;
  darkPatternCss: string;
  lightPatternSize?: string;
  darkPatternSize?: string;
  lightPatternPosition?: string;
  darkPatternPosition?: string;
}

// Helper to encode SVG into valid CSS data URI
function svgUri(svgString: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svgString)}")`;
}

export const BG_PATTERN_THEMES: BgPatternTheme[] = [
  // 1. آبی کهکشانی ساده (طرح پیش‌فرض درخواستی - بدون هیچ طرح در زمینه)
  {
    id: 'cosmic-sky',
    name: 'آبی کهکشانی ساده (پیش‌فرض)',
    enName: 'Pure Cosmic Sky',
    accentDotColor: '#0284C7',
    lightBaseBg: '#F0F7FF',
    darkBaseBg: '#050D1A',
    lightPatternCss: 'none',
    darkPatternCss: 'none'
  },

  // 2. زیگزاگ نعنایی
  {
    id: 'mint-zigzag',
    name: 'زیگزاگ نعنایی',
    enName: 'Mint Chevron',
    accentDotColor: '#059669',
    lightBaseBg: '#F4FBF7',
    darkBaseBg: '#03140C',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='24' viewBox='0 0 48 24'><path d='M0 12 L12 0 L24 12 L36 0 L48 12 L36 24 L24 12 L12 24 Z' fill='#34D399' opacity='0.4'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='24' viewBox='0 0 48 24'><path d='M0 12 L12 0 L24 12 L36 0 L48 12 L36 24 L24 12 L12 24 Z' fill='#059669' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '48px 24px',
    darkPatternSize: '48px 24px'
  },

  // 3. راه‌راه مورب آسمانی
  {
    id: 'sky-stripes',
    name: 'راه‌راه مورب آبی',
    enName: 'Sky Diagonal',
    accentDotColor: '#0284C7',
    lightBaseBg: '#F3F9FF',
    darkBaseBg: '#041424',
    lightPatternCss:
      'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(2, 132, 199, 0.12) 12px, rgba(2, 132, 199, 0.12) 16px)',
    darkPatternCss:
      'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(56, 189, 248, 0.12) 12px, rgba(56, 189, 248, 0.12) 16px)'
  },

  // 4. خال‌خالی مرجانی
  {
    id: 'coral-dots',
    name: 'خال‌خالی مرجانی',
    enName: 'Coral Polka',
    accentDotColor: '#E11D48',
    lightBaseBg: '#FFF5F6',
    darkBaseBg: '#170308',
    lightPatternCss:
      'radial-gradient(rgba(244, 63, 94, 0.3) 3px, transparent 3px)',
    darkPatternCss:
      'radial-gradient(rgba(251, 113, 133, 0.3) 3px, transparent 3px)',
    lightPatternSize: '32px 32px',
    darkPatternSize: '32px 32px',
    lightPatternPosition: '0 0, 16px 16px',
    darkPatternPosition: '0 0, 16px 16px'
  },

  // 5. ماتریس نقطه‌ای مینیمال
  {
    id: 'slate-matrix',
    name: 'ماتریس نقطه‌ای مینیمال',
    enName: 'Minimal Matrix',
    accentDotColor: '#475569',
    lightBaseBg: '#F8FAFC',
    darkBaseBg: '#0B0F19',
    lightPatternCss: 'radial-gradient(rgba(100, 116, 139, 0.35) 1.8px, transparent 1.8px)',
    darkPatternCss: 'radial-gradient(rgba(148, 163, 184, 0.35) 1.8px, transparent 1.8px)',
    lightPatternSize: '18px 18px',
    darkPatternSize: '18px 18px'
  },

  // 6. شطرنجی مهندسی / گراف
  {
    id: 'graph-grid',
    name: 'شطرنجی مهندسی',
    enName: 'Graph Grid',
    accentDotColor: '#78716C',
    lightBaseBg: '#FAFAF9',
    darkBaseBg: '#100E0D',
    lightPatternCss:
      'linear-gradient(rgba(203, 213, 225, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.5) 1px, transparent 1px)',
    darkPatternCss:
      'linear-gradient(rgba(68, 64, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(68, 64, 60, 0.5) 1px, transparent 1px)',
    lightPatternSize: '22px 22px',
    darkPatternSize: '22px 22px'
  },

  // 7. حلقه‌های متمرکز فیروزه‌ای
  {
    id: 'teal-rings',
    name: 'حلقه‌های فیروزه‌ای',
    enName: 'Teal Ripples',
    accentDotColor: '#0D9488',
    lightBaseBg: '#F2FBF9',
    darkBaseBg: '#031613',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><circle cx='22' cy='22' r='14' fill='none' stroke='#2DD4BF' stroke-width='1.4' opacity='0.45'/><circle cx='22' cy='22' r='6' fill='none' stroke='#0D9488' stroke-width='1.2' stroke-dasharray='2,2' opacity='0.4'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><circle cx='22' cy='22' r='14' fill='none' stroke='#14B8A6' stroke-width='1.4' opacity='0.45'/><circle cx='22' cy='22' r='6' fill='none' stroke='#2DD4BF' stroke-width='1.2' stroke-dasharray='2,2' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '44px 44px',
    darkPatternSize: '44px 44px'
  },

  // 8. جناغی هلویی
  {
    id: 'peach-chevron',
    name: 'جناغی هلویی',
    enName: 'Peach Herringbone',
    accentDotColor: '#EA580C',
    lightBaseBg: '#FFF8F0',
    darkBaseBg: '#170802',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='24' viewBox='0 0 48 24'><path d='M0 16 L24 4 L48 16' fill='none' stroke='#FB923C' stroke-width='2' stroke-linecap='round' opacity='0.4'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='24' viewBox='0 0 48 24'><path d='M0 16 L24 4 L48 16' fill='none' stroke='#C2410C' stroke-width='2' stroke-linecap='round' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '48px 24px',
    darkPatternSize: '48px 24px'
  },

  // 9. شبکه یاسی
  {
    id: 'lilac-blueprint',
    name: 'شبکه یاسی',
    enName: 'Lilac Blueprint',
    accentDotColor: '#6366F1',
    lightBaseBg: '#F7F6FF',
    darkBaseBg: '#09081B',
    lightPatternCss:
      'linear-gradient(rgba(196, 181, 253, 0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(196, 181, 253, 0.45) 1px, transparent 1px)',
    darkPatternCss:
      'linear-gradient(rgba(67, 56, 202, 0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(67, 56, 202, 0.45) 1px, transparent 1px)',
    lightPatternSize: '26px 26px',
    darkPatternSize: '26px 26px'
  },

  // 10. امواج بنفش
  {
    id: 'lavender-waves',
    name: 'امواج بنفش',
    enName: 'Lavender Waves',
    accentDotColor: '#9333EA',
    lightBaseBg: '#FAF7FF',
    darkBaseBg: '#12041D',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='50' height='24' viewBox='0 0 50 24'><path d='M0 12 C12.5 0, 12.5 24, 25 12 C37.5 0, 37.5 24, 50 12' fill='none' stroke='#C084FC' stroke-width='2' opacity='0.4'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='50' height='24' viewBox='0 0 50 24'><path d='M0 12 C12.5 0, 12.5 24, 25 12 C37.5 0, 37.5 24, 50 12' fill='none' stroke='#7E22CE' stroke-width='2' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '50px 24px',
    darkPatternSize: '50px 24px'
  },

  // 11. خال‌خالی استودیو
  {
    id: 'classic-dots',
    name: 'خال‌خالی استودیو',
    enName: 'Studio Dots',
    accentDotColor: '#3B82F6',
    lightBaseBg: '#F3F6FA',
    darkBaseBg: '#0B1220',
    lightPatternCss: 'radial-gradient(rgba(100, 116, 139, 0.35) 2px, transparent 2px)',
    darkPatternCss: 'radial-gradient(rgba(148, 163, 184, 0.35) 2px, transparent 2px)',
    lightPatternSize: '22px 22px',
    darkPatternSize: '22px 22px'
  },

  // 12. لوزی شکوفه‌ای
  {
    id: 'blossom-diamonds',
    name: 'لوزی شکوفه‌ای',
    enName: 'Blossom Rhombus',
    accentDotColor: '#C026D3',
    lightBaseBg: '#FEF5F9',
    darkBaseBg: '#160313',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'><polygon points='17,3 31,17 17,31 3,17' fill='none' stroke='#F472B6' stroke-width='1.2' opacity='0.4'/><circle cx='17' cy='17' r='2' fill='#C026D3' opacity='0.45'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'><polygon points='17,3 31,17 17,31 3,17' fill='none' stroke='#A21CAF' stroke-width='1.2' opacity='0.4'/><circle cx='17' cy='17' r='2' fill='#E879F9' opacity='0.45'/></svg>`
    ),
    lightPatternSize: '34px 34px',
    darkPatternSize: '34px 34px'
  },

  // 13. چهارخانه زیتونی
  {
    id: 'olive-gingham',
    name: 'چهارخانه زیتونی',
    enName: 'Olive Gingham',
    accentDotColor: '#65A30D',
    lightBaseBg: '#F8FDE9',
    darkBaseBg: '#0D1402',
    lightPatternCss:
      'repeating-linear-gradient(0deg, rgba(163, 230, 53, 0.25) 0px, rgba(163, 230, 53, 0.25) 12px, transparent 12px, transparent 24px), repeating-linear-gradient(90deg, rgba(163, 230, 53, 0.25) 0px, rgba(163, 230, 53, 0.25) 12px, transparent 12px, transparent 24px)',
    darkPatternCss:
      'repeating-linear-gradient(0deg, rgba(101, 163, 13, 0.25) 0px, rgba(101, 163, 13, 0.25) 12px, transparent 12px, transparent 24px), repeating-linear-gradient(90deg, rgba(101, 163, 13, 0.25) 0px, rgba(101, 163, 13, 0.25) 12px, transparent 12px, transparent 24px)'
  },

  // 14. حباب‌های ابری
  {
    id: 'cyan-bubbles',
    name: 'حباب‌های ابری',
    enName: 'Cyan Bubbles',
    accentDotColor: '#0891B2',
    lightBaseBg: '#EEFCFF',
    darkBaseBg: '#02161B',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><circle cx='10' cy='10' r='6' fill='#22D3EE' opacity='0.45'/><circle cx='32' cy='28' r='8' fill='#06B6D4' opacity='0.35'/><circle cx='35' cy='10' r='4' fill='#0891B2' opacity='0.4'/><circle cx='12' cy='36' r='5' fill='#22D3EE' opacity='0.45'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><circle cx='10' cy='10' r='6' fill='#0891B2' opacity='0.4'/><circle cx='32' cy='28' r='8' fill='#0284C7' opacity='0.35'/><circle cx='35' cy='10' r='4' fill='#38BDF8' opacity='0.4'/><circle cx='12' cy='36' r='5' fill='#0891B2' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '44px 44px',
    darkPatternSize: '44px 44px'
  },

  // 15. موزاییک پیکسلی رز
  {
    id: 'rose-pixel',
    name: 'موزاییک پیکسلی رز',
    enName: 'Rose Mosaic',
    accentDotColor: '#E11D48',
    lightBaseBg: '#FFF3F5',
    darkBaseBg: '#170308',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect x='4' y='4' width='7' height='7' rx='1.5' fill='#FB7185' opacity='0.45'/><rect x='19' y='19' width='7' height='7' rx='1.5' fill='#FB7185' opacity='0.45'/><rect x='21' y='5' width='5' height='5' rx='1' fill='#E11D48' opacity='0.4'/><rect x='5' y='21' width='5' height='5' rx='1' fill='#E11D48' opacity='0.4'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect x='4' y='4' width='7' height='7' rx='1.5' fill='#BE123C' opacity='0.45'/><rect x='19' y='19' width='7' height='7' rx='1.5' fill='#BE123C' opacity='0.45'/><rect x='21' y='5' width='5' height='5' rx='1' fill='#F43F5E' opacity='0.4'/><rect x='5' y='21' width='5' height='5' rx='1' fill='#F43F5E' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '32px 32px',
    darkPatternSize: '32px 32px'
  },

  // 16. لانه زنبوری کهربایی
  {
    id: 'amber-honeycomb',
    name: 'لانه زنبوری کهربایی',
    enName: 'Amber Honeycomb',
    accentDotColor: '#D97706',
    lightBaseBg: '#FFFDF0',
    darkBaseBg: '#140D02',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='42' height='72.74' viewBox='0 0 42 72.74'><path d='M0 12.12 L21 0 L42 12.12 L42 36.37 L21 48.49 L0 36.37 Z M0 48.49 L21 36.37 L42 48.49 L42 72.74 L21 84.86 L0 72.74 Z' fill='none' stroke='#F59E0B' stroke-width='1.2' opacity='0.35'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='42' height='72.74' viewBox='0 0 42 72.74'><path d='M0 12.12 L21 0 L42 12.12 L42 36.37 L21 48.49 L0 36.37 Z M0 48.49 L21 36.37 L42 48.49 L42 72.74 L21 84.86 L0 72.74 Z' fill='none' stroke='#B45309' stroke-width='1.2' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '42px 72.74px',
    darkPatternSize: '42px 72.74px'
  },

  // 17. مکعب‌های ایزومتریک زمردی
  {
    id: 'emerald-isometric',
    name: 'ایزومتریک زمردی',
    enName: 'Emerald Prism',
    accentDotColor: '#059669',
    lightBaseBg: '#F2FDF7',
    darkBaseBg: '#02160E',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='69.28' viewBox='0 0 40 69.28'><polygon points='20,0 40,11.54 20,23.09 0,11.54' fill='none' stroke='#34D399' stroke-width='1.2' opacity='0.4'/><polygon points='20,34.64 40,46.18 20,57.73 0,46.18' fill='none' stroke='#10B981' stroke-width='1.2' opacity='0.35'/><line x1='20' y1='23.09' x2='20' y2='34.64' stroke='#34D399' stroke-width='1' opacity='0.3'/><line x1='20' y1='57.73' x2='20' y2='69.28' stroke='#10B981' stroke-width='1' opacity='0.3'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='69.28' viewBox='0 0 40 69.28'><polygon points='20,0 40,11.54 20,23.09 0,11.54' fill='none' stroke='#059669' stroke-width='1.2' opacity='0.45'/><polygon points='20,34.64 40,46.18 20,57.73 0,46.18' fill='none' stroke='#047857' stroke-width='1.2' opacity='0.4'/><line x1='20' y1='23.09' x2='20' y2='34.64' stroke='#059669' stroke-width='1' opacity='0.3'/><line x1='20' y1='57.73' x2='20' y2='69.28' stroke='#047857' stroke-width='1' opacity='0.3'/></svg>`
    ),
    lightPatternSize: '40px 69.28px',
    darkPatternSize: '40px 69.28px'
  },

  // 18. صورت فلکی کهکشانی
  {
    id: 'indigo-constellation',
    name: 'صورت فلکی کهکشانی',
    enName: 'Celestial Constellation',
    accentDotColor: '#4F46E5',
    lightBaseBg: '#F3F4FF',
    darkBaseBg: '#08091E',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><circle cx='10' cy='12' r='2' fill='#6366F1' opacity='0.45'/><circle cx='48' cy='18' r='2.5' fill='#818CF8' opacity='0.45'/><circle cx='30' cy='45' r='2' fill='#4F46E5' opacity='0.45'/><circle cx='52' cy='48' r='1.5' fill='#6366F1' opacity='0.4'/><line x1='10' y1='12' x2='48' y2='18' stroke='#818CF8' stroke-width='0.8' stroke-dasharray='2,2' opacity='0.35'/><line x1='48' y1='18' x2='30' y2='45' stroke='#818CF8' stroke-width='0.8' stroke-dasharray='2,2' opacity='0.35'/><line x1='30' y1='45' x2='52' y2='48' stroke='#6366F1' stroke-width='0.8' stroke-dasharray='2,2' opacity='0.35'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><circle cx='10' cy='12' r='2' fill='#818CF8' opacity='0.5'/><circle cx='48' cy='18' r='2.5' fill='#A5B4FC' opacity='0.55'/><circle cx='30' cy='45' r='2' fill='#C7D2FE' opacity='0.5'/><circle cx='52' cy='48' r='1.5' fill='#818CF8' opacity='0.45'/><line x1='10' y1='12' x2='48' y2='18' stroke='#6366F1' stroke-width='0.8' stroke-dasharray='2,2' opacity='0.4'/><line x1='48' y1='18' x2='30' y2='45' stroke='#6366F1' stroke-width='0.8' stroke-dasharray='2,2' opacity='0.4'/><line x1='30' y1='45' x2='52' y2='48' stroke='#4F46E5' stroke-width='0.8' stroke-dasharray='2,2' opacity='0.4'/></svg>`
    ),
    lightPatternSize: '60px 60px',
    darkPatternSize: '60px 60px'
  },

  // 19. هاشور زرین غروب
  {
    id: 'sunset-crosshatch',
    name: 'هاشور زرین غروب',
    enName: 'Sunset Crosshatch',
    accentDotColor: '#F59E0B',
    lightBaseBg: '#FFFDF5',
    darkBaseBg: '#181202',
    lightPatternCss:
      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 158, 11, 0.1) 10px, rgba(245, 158, 11, 0.1) 12px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(245, 158, 11, 0.1) 10px, rgba(245, 158, 11, 0.1) 12px)',
    darkPatternCss:
      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(217, 119, 6, 0.15) 10px, rgba(217, 119, 6, 0.15) 12px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(217, 119, 6, 0.15) 10px, rgba(217, 119, 6, 0.15) 12px)'
  },

  // 20. شفق اقیانوسی
  {
    id: 'ocean-aurora',
    name: 'شفق اقیانوسی',
    enName: 'Ocean Aurora',
    accentDotColor: '#06B6D4',
    lightBaseBg: '#F0FDFA',
    darkBaseBg: '#021517',
    lightPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'><path d='M0 15 Q15 0 30 15 T60 15' fill='none' stroke='#2DD4BF' stroke-width='1.4' opacity='0.4'/><path d='M0 25 Q15 10 30 25 T60 25' fill='none' stroke='#06B6D4' stroke-width='1.2' opacity='0.35'/></svg>`
    ),
    darkPatternCss: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'><path d='M0 15 Q15 0 30 15 T60 15' fill='none' stroke='#14B8A6' stroke-width='1.4' opacity='0.4'/><path d='M0 25 Q15 10 30 25 T60 25' fill='none' stroke='#0891B2' stroke-width='1.2' opacity='0.35'/></svg>`
    ),
    lightPatternSize: '60px 30px',
    darkPatternSize: '60px 30px'
  }
];

// Alias for backwards compatibility
export const BG_THEMES = BG_PATTERN_THEMES;
export type BgThemeOption = BgPatternTheme;

export const STORAGE_KEY_BG_THEME = 'homelab_bg_theme_v2';

// Default: آبی کهکشانی ساده (بدون هیچ طرحی در زمینه)
export const DEFAULT_BG_THEME_ID = 'cosmic-sky';

export function getStoredBgTheme(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BG_THEME);
    if (saved && BG_PATTERN_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return DEFAULT_BG_THEME_ID;
}

export function setStoredBgTheme(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_BG_THEME, themeId);
  } catch {
    // ignore
  }
}
