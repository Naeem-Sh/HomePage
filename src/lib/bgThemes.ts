export interface BgThemeOption {
  id: string;
  name: string;
  enName: string;
  previewGradient: string;
  lightBaseBg: string;
  darkBaseBg: string;
  // Orb configurations for Ambient background
  lightOrbs: {
    orb1: string;
    orb2: string;
    orb3: string;
  };
  darkOrbs: {
    orb1: string;
    orb2: string;
    orb3: string;
  };
}

export const BG_THEMES: BgThemeOption[] = [
  {
    id: 'cosmic',
    name: 'کیهانی',
    enName: 'Cosmic Blue',
    previewGradient: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #06b6d4 100%)',
    lightBaseBg: 'bg-[#F4F6FB]',
    darkBaseBg: 'bg-[#060911]',
    lightOrbs: {
      orb1: 'from-blue-200/50 via-sky-100/35 to-transparent',
      orb2: 'from-indigo-200/40 via-purple-100/25 to-transparent',
      orb3: 'from-cyan-200/40 via-sky-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-blue-900/30 via-indigo-950/20 to-transparent',
      orb2: 'from-indigo-900/25 via-violet-950/15 to-transparent',
      orb3: 'from-cyan-950/25 via-sky-950/15 to-transparent'
    }
  },
  {
    id: 'emerald',
    name: 'زمردی',
    enName: 'Forest Emerald',
    previewGradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    lightBaseBg: 'bg-[#EDFAF3]',
    darkBaseBg: 'bg-[#02160E]',
    lightOrbs: {
      orb1: 'from-emerald-200/55 via-teal-100/35 to-transparent',
      orb2: 'from-green-200/45 via-emerald-100/25 to-transparent',
      orb3: 'from-teal-200/40 via-mint-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-emerald-900/35 via-teal-950/22 to-transparent',
      orb2: 'from-green-900/28 via-emerald-950/18 to-transparent',
      orb3: 'from-teal-900/30 via-green-950/18 to-transparent'
    }
  },
  {
    id: 'ruby',
    name: 'یاقوتی',
    enName: 'Crimson Ruby',
    previewGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #fda4af 100%)',
    lightBaseBg: 'bg-[#FFF0F3]',
    darkBaseBg: 'bg-[#18040A]',
    lightOrbs: {
      orb1: 'from-rose-200/55 via-pink-100/35 to-transparent',
      orb2: 'from-red-200/45 via-rose-100/25 to-transparent',
      orb3: 'from-pink-200/40 via-red-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-rose-900/35 via-pink-950/22 to-transparent',
      orb2: 'from-red-900/30 via-rose-950/20 to-transparent',
      orb3: 'from-pink-900/28 via-red-950/18 to-transparent'
    }
  },
  {
    id: 'amber',
    name: 'کهربایی',
    enName: 'Golden Amber',
    previewGradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
    lightBaseBg: 'bg-[#FFF9EA]',
    darkBaseBg: 'bg-[#170B01]',
    lightOrbs: {
      orb1: 'from-amber-200/55 via-yellow-100/35 to-transparent',
      orb2: 'from-orange-200/40 via-amber-100/25 to-transparent',
      orb3: 'from-yellow-200/45 via-orange-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-amber-900/35 via-yellow-950/22 to-transparent',
      orb2: 'from-orange-900/30 via-amber-950/20 to-transparent',
      orb3: 'from-yellow-900/28 via-stone-950/18 to-transparent'
    }
  },
  {
    id: 'violet',
    name: 'بنفش رویال',
    enName: 'Royal Violet',
    previewGradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c084fc 100%)',
    lightBaseBg: 'bg-[#F7F2FE]',
    darkBaseBg: 'bg-[#10051D]',
    lightOrbs: {
      orb1: 'from-purple-200/55 via-violet-100/35 to-transparent',
      orb2: 'from-indigo-200/45 via-purple-100/25 to-transparent',
      orb3: 'from-violet-200/45 via-fuchsia-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-purple-900/35 via-violet-950/24 to-transparent',
      orb2: 'from-indigo-900/30 via-purple-950/20 to-transparent',
      orb3: 'from-violet-900/28 via-fuchsia-950/18 to-transparent'
    }
  },
  {
    id: 'sunset',
    name: 'غروب نارنجی',
    enName: 'Sunset Coral',
    previewGradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
    lightBaseBg: 'bg-[#FFF5ED]',
    darkBaseBg: 'bg-[#180701]',
    lightOrbs: {
      orb1: 'from-orange-200/55 via-amber-100/35 to-transparent',
      orb2: 'from-rose-200/40 via-orange-100/25 to-transparent',
      orb3: 'from-amber-200/45 via-red-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-orange-900/35 via-red-950/22 to-transparent',
      orb2: 'from-rose-900/28 via-orange-950/20 to-transparent',
      orb3: 'from-amber-900/30 via-red-950/18 to-transparent'
    }
  },
  {
    id: 'cyan',
    name: 'فیروزه‌ای',
    enName: 'Electric Cyan',
    previewGradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
    lightBaseBg: 'bg-[#ECFCFF]',
    darkBaseBg: 'bg-[#02141A]',
    lightOrbs: {
      orb1: 'from-cyan-200/55 via-sky-100/35 to-transparent',
      orb2: 'from-teal-200/45 via-cyan-100/25 to-transparent',
      orb3: 'from-sky-200/45 via-blue-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-cyan-900/35 via-teal-950/22 to-transparent',
      orb2: 'from-teal-900/30 via-sky-950/20 to-transparent',
      orb3: 'from-sky-900/28 via-cyan-950/18 to-transparent'
    }
  },
  {
    id: 'pink',
    name: 'شکوفه صورتی',
    enName: 'Sakura Blossom',
    previewGradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)',
    lightBaseBg: 'bg-[#FEF1F7]',
    darkBaseBg: 'bg-[#180412]',
    lightOrbs: {
      orb1: 'from-pink-200/55 via-fuchsia-100/35 to-transparent',
      orb2: 'from-rose-200/45 via-pink-100/25 to-transparent',
      orb3: 'from-fuchsia-200/40 via-purple-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-pink-900/35 via-fuchsia-950/22 to-transparent',
      orb2: 'from-rose-900/30 via-pink-950/20 to-transparent',
      orb3: 'from-fuchsia-900/28 via-purple-950/18 to-transparent'
    }
  },
  {
    id: 'carbon',
    name: 'کربنی تیره',
    enName: 'Midnight Carbon',
    previewGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    lightBaseBg: 'bg-[#F6F7F9]',
    darkBaseBg: 'bg-[#05070A]',
    lightOrbs: {
      orb1: 'from-slate-200/50 via-gray-100/30 to-transparent',
      orb2: 'from-zinc-200/40 via-slate-100/25 to-transparent',
      orb3: 'from-gray-200/45 via-neutral-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-slate-800/25 via-slate-900/15 to-transparent',
      orb2: 'from-zinc-800/20 via-neutral-900/12 to-transparent',
      orb3: 'from-gray-800/22 via-slate-950/15 to-transparent'
    }
  },
  {
    id: 'mocha',
    name: 'اسپرسو موکا',
    enName: 'Espresso Mocha',
    previewGradient: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    lightBaseBg: 'bg-[#FAF4EE]',
    darkBaseBg: 'bg-[#150A04]',
    lightOrbs: {
      orb1: 'from-amber-200/45 via-orange-100/30 to-transparent',
      orb2: 'from-stone-200/40 via-amber-100/20 to-transparent',
      orb3: 'from-orange-200/35 via-stone-100/20 to-transparent'
    },
    darkOrbs: {
      orb1: 'from-amber-900/30 via-stone-950/22 to-transparent',
      orb2: 'from-stone-900/28 via-amber-950/18 to-transparent',
      orb3: 'from-orange-950/25 via-stone-900/16 to-transparent'
    }
  }
];

export const STORAGE_KEY_BG_THEME = 'homelab_bg_theme';

export function getStoredBgTheme(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BG_THEME);
    if (saved && BG_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'cosmic'; // Default
}

export function setStoredBgTheme(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_BG_THEME, themeId);
  } catch {
    // ignore
  }
}
