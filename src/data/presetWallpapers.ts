export interface PresetWallpaper {
  id: string;
  name: string;
  category: 'minimal' | 'dark' | 'cyber' | 'nature' | 'datacenter' | 'abstract' | 'gradient';
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

function createSvgDataUri(svgContent: string): string {
  const cleanSvg = svgContent.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
}

export const PRESET_WALLPAPERS: PresetWallpaper[] = [
  // 1. Dark Minimal & Grid
  {
    id: 'minimal-slate',
    name: 'Minimal Deep Slate',
    category: 'minimal',
    description: 'Clean dark slate backdrop with subtle carbon grid and radial vignette',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <radialGradient id="slateGrad" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="60%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <pattern id="slateGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" stroke-opacity="0.25"/>
            <circle cx="40" cy="40" r="1.5" fill="#64748b" fill-opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#slateGrad)"/>
        <rect width="100%" height="100%" fill="url(#slateGrid)"/>
      </svg>
    `)
  },
  {
    id: 'cyber-mesh',
    name: 'Cyber Mesh Grid',
    category: 'cyber',
    description: 'Matrix-inspired dark neon grid pattern with cyan glowing nodal intersections',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#050510"/>
            <stop offset="50%" stop-color="#0a0f24"/>
            <stop offset="100%" stop-color="#020308"/>
          </linearGradient>
          <pattern id="cyberGridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.12"/>
            <circle cx="60" cy="60" r="2" fill="#00f0ff" fill-opacity="0.4"/>
          </pattern>
          <radialGradient id="cyanCenter" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyberBg)"/>
        <rect width="100%" height="100%" fill="url(#cyberGridPattern)"/>
        <rect width="100%" height="100%" fill="url(#cyanCenter)"/>
      </svg>
    `)
  },
  {
    id: 'dark-abstract-waves',
    name: 'Dark Obsidian Waves',
    category: 'abstract',
    description: 'Sophisticated 3D dark fluid geometry and layered indigo ribbons',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="waveBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#090a16"/>
            <stop offset="100%" stop-color="#030408"/>
          </linearGradient>
          <linearGradient id="ribbon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.1"/>
          </linearGradient>
          <linearGradient id="ribbon2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#9333ea" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#waveBg)"/>
        <path d="M-100,500 C400,200 800,900 1300,450 C1600,200 1800,600 2100,400 L2100,1200 L-100,1200 Z" fill="url(#ribbon1)"/>
        <path d="M-100,700 C300,450 700,950 1200,650 C1700,350 1900,850 2100,600 L2100,1200 L-100,1200 Z" fill="url(#ribbon2)"/>
      </svg>
    `)
  },
  {
    id: 'deep-cosmic',
    name: 'Deep Cosmic Nebula',
    category: 'dark',
    description: 'Ultra dark star clusters and deep space glow with violet celestial aura',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="cosmicBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#05020a"/>
            <stop offset="50%" stop-color="#0d0720"/>
            <stop offset="100%" stop-color="#020108"/>
          </linearGradient>
          <radialGradient id="nebula1" cx="35%" cy="45%" r="45%">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.25"/>
            <stop offset="60%" stop-color="#3b82f6" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="nebula2" cx="75%" cy="65%" r="40%">
            <stop offset="0%" stop-color="#ec4899" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#cosmicBg)"/>
        <rect width="100%" height="100%" fill="url(#nebula1)"/>
        <rect width="100%" height="100%" fill="url(#nebula2)"/>
        <circle cx="200" cy="180" r="1.5" fill="#ffffff" fill-opacity="0.8"/>
        <circle cx="500" cy="120" r="1.2" fill="#ffffff" fill-opacity="0.6"/>
        <circle cx="950" cy="300" r="2.2" fill="#ffffff" fill-opacity="0.9"/>
        <circle cx="1400" cy="190" r="1.8" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="1650" cy="450" r="1.4" fill="#ffffff" fill-opacity="0.5"/>
        <circle cx="350" cy="720" r="2.0" fill="#ffffff" fill-opacity="0.8"/>
        <circle cx="850" cy="850" r="1.5" fill="#ffffff" fill-opacity="0.6"/>
        <circle cx="1300" cy="780" r="1.2" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="1750" cy="900" r="1.7" fill="#ffffff" fill-opacity="0.8"/>
      </svg>
    `)
  },

  // 2. Datacenter, Server & Hardware
  {
    id: 'datacenter-racks',
    name: 'Server Corridor',
    category: 'datacenter',
    description: 'Modern enterprise server racks with blinking activity LEDs and fiber pathways',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="dcBg" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#0a0e17"/>
            <stop offset="100%" stop-color="#020408"/>
          </linearGradient>
          <linearGradient id="rackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#111827"/>
            <stop offset="50%" stop-color="#1f2937"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#dcBg)"/>
        <!-- Perspective Rack Outlines -->
        <polygon points="0,0 450,300 450,780 0,1080" fill="url(#rackGrad)" stroke="#1e293b" stroke-width="2"/>
        <polygon points="1920,0 1470,300 1470,780 1920,1080" fill="url(#rackGrad)" stroke="#1e293b" stroke-width="2"/>
        <!-- Activity LEDs Left -->
        <circle cx="420" cy="380" r="3" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)"/>
        <circle cx="420" cy="410" r="3" fill="#06b6d4" filter="drop-shadow(0 0 6px #06b6d4)"/>
        <circle cx="420" cy="440" r="3" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)"/>
        <circle cx="420" cy="470" r="3" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)"/>
        <circle cx="420" cy="530" r="3" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)"/>
        <!-- Activity LEDs Right -->
        <circle cx="1500" cy="380" r="3" fill="#06b6d4" filter="drop-shadow(0 0 6px #06b6d4)"/>
        <circle cx="1500" cy="410" r="3" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)"/>
        <circle cx="1500" cy="440" r="3" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)"/>
        <circle cx="1500" cy="500" r="3" fill="#6366f1" filter="drop-shadow(0 0 6px #6366f1)"/>
        <!-- Central Pathway Glow -->
        <polygon points="450,780 1470,780 1600,1080 320,1080" fill="#0f172a" fill-opacity="0.6"/>
        <line x1="960" y1="300" x2="960" y2="1080" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="8 8"/>
      </svg>
    `)
  },
  {
    id: 'cyber-circuit-glow',
    name: 'Motherboard Optics',
    category: 'datacenter',
    description: 'High-tech silicon wafer and electronic PCB trace glow',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="pcbBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#02120e"/>
            <stop offset="50%" stop-color="#041f17"/>
            <stop offset="100%" stop-color="#010a08"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcbBg)"/>
        <!-- PCB Traces -->
        <g stroke="#10b981" stroke-width="2" fill="none" stroke-opacity="0.35" stroke-linecap="round">
          <path d="M 100 100 L 400 100 L 550 250 L 900 250"/>
          <path d="M 200 300 L 450 300 L 550 400 L 800 400 L 950 550 L 1200 550"/>
          <path d="M 700 150 L 950 150 L 1100 300 L 1500 300"/>
          <path d="M 300 700 L 600 700 L 750 850 L 1100 850 L 1300 650 L 1700 650"/>
          <path d="M 900 900 L 1200 900 L 1400 700 L 1800 700"/>
        </g>
        <g fill="#34d399" fill-opacity="0.8">
          <circle cx="100" cy="100" r="5"/>
          <circle cx="900" cy="250" r="5"/>
          <circle cx="1200" cy="550" r="6"/>
          <circle cx="1500" cy="300" r="5"/>
          <circle cx="1700" cy="650" r="6"/>
          <circle cx="1800" cy="700" r="5"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'fiber-optics',
    name: 'Fiber Optic Stream',
    category: 'datacenter',
    description: 'High-speed gigabit optical data pulses and glowing transmission rays',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="fiberBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#030712"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#fiberBg)"/>
        <g stroke-linecap="round" fill="none">
          <path d="M-100,200 Q700,50 1200,450 T2100,700" stroke="#00f0ff" stroke-width="3" stroke-opacity="0.6"/>
          <path d="M-100,350 Q800,200 1300,600 T2100,850" stroke="#3b82f6" stroke-width="4" stroke-opacity="0.4"/>
          <path d="M-100,100 Q600,-50 1100,300 T2100,550" stroke="#a855f7" stroke-width="2.5" stroke-opacity="0.5"/>
          <path d="M-100,500 Q900,350 1400,750 T2100,1000" stroke="#06b6d4" stroke-width="3" stroke-opacity="0.4"/>
        </g>
      </svg>
    `)
  },

  // 3. Cyberpunk, Neon & Tech
  {
    id: 'neon-city-night',
    name: 'Neon Horizon Grid',
    category: 'cyber',
    description: 'Vibrant midnight horizon with cyan and magenta accents and glowing sun ring',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="synthSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0f0728"/>
            <stop offset="60%" stop-color="#2d0a4e"/>
            <stop offset="100%" stop-color="#ff007f"/>
          </linearGradient>
          <linearGradient id="synthSun" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffde59"/>
            <stop offset="100%" stop-color="#ff007f"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="60%" fill="url(#synthSky)"/>
        <!-- Synthwave Sun -->
        <circle cx="960" cy="550" r="160" fill="url(#synthSun)"/>
        <!-- Ground Plane -->
        <rect y="60%" width="100%" height="40%" fill="#090114"/>
        <!-- Horizontal Grid Lines -->
        <g stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.3">
          <line x1="0" y1="650" x2="1920" y2="650"/>
          <line x1="0" y1="700" x2="1920" y2="700"/>
          <line x1="0" y1="770" x2="1920" y2="770"/>
          <line x1="0" y1="860" x2="1920" y2="860"/>
          <line x1="0" y1="970" x2="1920" y2="970"/>
        </g>
        <!-- Vanishing Lines -->
        <g stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.25">
          <line x1="960" y1="648" x2="100" y2="1080"/>
          <line x1="960" y1="648" x2="400" y2="1080"/>
          <line x1="960" y1="648" x2="700" y2="1080"/>
          <line x1="960" y1="648" x2="960" y2="1080"/>
          <line x1="960" y1="648" x2="1220" y2="1080"/>
          <line x1="960" y1="648" x2="1520" y2="1080"/>
          <line x1="960" y1="648" x2="1820" y2="1080"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'quantum-hexagons',
    name: 'Quantum Hex Grid',
    category: 'cyber',
    description: 'Futuristic geometric glowing honeycombs in deep cobalt & turquoise',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="qBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#030c1e"/>
            <stop offset="100%" stop-color="#02040a"/>
          </linearGradient>
          <pattern id="hexPattern" width="112" height="194" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
            <path d="M 28 0 L 0 48.5 L 28 97 L 84 97 L 112 48.5 L 84 0 Z M 84 97 L 56 145.5 L 84 194 L 140 194 L 168 145.5 L 140 97 Z" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-opacity="0.18"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#qBg)"/>
        <rect width="100%" height="100%" fill="url(#hexPattern)"/>
        <!-- Accent Glow Node -->
        <circle cx="960" cy="540" r="280" fill="#38bdf8" fill-opacity="0.08" filter="blur(80px)"/>
      </svg>
    `)
  },
  {
    id: 'abstract-purple-flow',
    name: 'Cybernetic Flow',
    category: 'cyber',
    description: 'Deep violet and electric blue fluid ribbons and organic waveforms',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="flowBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090514"/>
            <stop offset="100%" stop-color="#020108"/>
          </linearGradient>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.4"/>
            <stop offset="50%" stop-color="#2563eb" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#flowBg)"/>
        <path d="M 0,300 C 400,600 800,100 1300,500 C 1600,700 1800,200 1920,400 L 1920,1080 L 0,1080 Z" fill="url(#flowGrad)"/>
      </svg>
    `)
  },

  // 4. Nature, Mountains & Atmosphere
  {
    id: 'mountain-mist',
    name: 'Nordic Mountain Mist',
    category: 'nature',
    description: 'Moody alpine peak covered in low hanging cloud cover and twilight sky',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="nordicSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="60%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#nordicSky)"/>
        <!-- Background Mountain Range -->
        <polygon points="100,1080 600,450 1100,1080" fill="#1e293b" fill-opacity="0.7"/>
        <polygon points="800,1080 1350,380 1900,1080" fill="#0f172a" fill-opacity="0.85"/>
        <!-- Foreground Peak -->
        <polygon points="-200,1080 400,520 1000,1080" fill="#090d16"/>
        <polygon points="650,1080 1150,560 1750,1080" fill="#020617"/>
        <!-- Mist layer -->
        <rect y="720" width="100%" height="360" fill="#1e293b" fill-opacity="0.4"/>
      </svg>
    `)
  },
  {
    id: 'aurora-borealis',
    name: 'Arctic Aurora Night',
    category: 'nature',
    description: 'Emerald green northern lights over icy mountains and starfields',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="auroraSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#030b14"/>
            <stop offset="100%" stop-color="#071a2e"/>
          </linearGradient>
          <linearGradient id="auroraGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.1"/>
            <stop offset="30%" stop-color="#34d399" stop-opacity="0.45"/>
            <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#auroraSky)"/>
        <!-- Aurora Curtains -->
        <path d="M 0,200 Q 500,400 960,250 T 1920,350 L 1920,600 Q 1400,450 960,600 T 0,450 Z" fill="url(#auroraGlow)"/>
        <!-- Silhouette Mountains -->
        <polygon points="0,1080 350,750 700,1080 1100,700 1600,1080 1920,800 1920,1080" fill="#01060e"/>
      </svg>
    `)
  },
  {
    id: 'dark-pine-forest',
    name: 'Evergreen Canopy',
    category: 'nature',
    description: 'Misty coniferous forest shrouded in cool morning fog and navy dusk',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0b1726"/>
            <stop offset="60%" stop-color="#13273d"/>
            <stop offset="100%" stop-color="#1a3552"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#forestSky)"/>
        <!-- Distant Tree Row -->
        <path d="M 0,850 L 80,720 L 160,850 L 240,700 L 320,850 L 420,690 L 520,850 L 620,730 L 720,850 L 840,680 L 960,850 L 1080,710 L 1200,850 L 1320,690 L 1440,850 L 1560,730 L 1680,850 L 1800,700 L 1920,850 L 1920,1080 L 0,1080 Z" fill="#0c1d2e" fill-opacity="0.8"/>
        <!-- Foreground Dense Silhouettes -->
        <path d="M 0,950 L 120,780 L 240,950 L 380,750 L 500,950 L 660,770 L 800,950 L 960,740 L 1100,950 L 1260,760 L 1400,950 L 1580,750 L 1720,950 L 1860,770 L 1920,950 L 1920,1080 L 0,1080 Z" fill="#040910"/>
      </svg>
    `)
  },
  {
    id: 'starry-milkyway',
    name: 'Milky Way Galaxy',
    category: 'dark',
    description: 'Stunning celestial panorama above a silhouette horizon',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="spaceBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#020409"/>
            <stop offset="100%" stop-color="#090d16"/>
          </linearGradient>
          <linearGradient id="milkyBand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.15"/>
            <stop offset="50%" stop-color="#c084fc" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#spaceBg)"/>
        <!-- Galaxy Diagonal Stream -->
        <polygon points="0,0 700,0 1920,900 1920,1080 1200,1080 0,200" fill="url(#milkyBand)"/>
      </svg>
    `)
  },

  // 5. Clean Gradients & Architectural Minimal
  {
    id: 'twilight-gradient',
    name: 'Deep Twilight Fade',
    category: 'gradient',
    description: 'Smooth midnight indigo to dark purple silk gradient',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="twilightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="50%" stop-color="#311042"/>
            <stop offset="100%" stop-color="#030712"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#twilightGrad)"/>
      </svg>
    `)
  },
  {
    id: 'emerald-aurora-gradient',
    name: 'Dark Emerald Silk',
    category: 'gradient',
    description: 'Deep forest green to teal velvet hue',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="50%" stop-color="#062c23"/>
            <stop offset="100%" stop-color="#02140e"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#emeraldGrad)"/>
      </svg>
    `)
  },
  {
    id: 'charcoal-monolith',
    name: 'Charcoal Monolith',
    category: 'minimal',
    description: 'Brutalist concrete architecture with soft directional shadow',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="charcoalBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#charcoalBg)"/>
        <polygon points="600,0 1320,0 1100,1080 380,1080" fill="#27272a" fill-opacity="0.3"/>
      </svg>
    `)
  },
  {
    id: 'sapphire-drift',
    name: 'Sapphire Void',
    category: 'gradient',
    description: 'Deep royal blue to pitch black oceanic radial gradient',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <radialGradient id="sapphireGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="60%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#sapphireGrad)"/>
      </svg>
    `)
  },
  {
    id: 'golden-hour-dunes',
    name: 'Desert Dusk Ridges',
    category: 'nature',
    description: 'Minimalist wind-swept sand dunes under evening sky',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="duneSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1c120c"/>
            <stop offset="50%" stop-color="#3d1d0e"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <linearGradient id="dune1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#451a03"/>
            <stop offset="100%" stop-color="#1e0b02"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#duneSky)"/>
        <path d="M 0,650 Q 500,480 1100,750 T 1920,600 L 1920,1080 L 0,1080 Z" fill="url(#dune1)"/>
        <path d="M 0,850 Q 600,680 1300,900 T 1920,800 L 1920,1080 L 0,1080 Z" fill="#140601"/>
      </svg>
    `)
  },
  {
    id: 'glass-prism-refraction',
    name: 'Prismatic Glass',
    category: 'abstract',
    description: 'Geometric frosted glass facets reflecting subtle iridescent light',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
        <defs>
          <linearGradient id="prismBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#prismBg)"/>
        <polygon points="300,100 800,200 650,750 150,550" fill="#38bdf8" fill-opacity="0.12" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.2"/>
        <polygon points="800,200 1450,150 1300,800 650,750" fill="#818cf8" fill-opacity="0.15" stroke="#818cf8" stroke-width="1" stroke-opacity="0.25"/>
        <polygon points="1450,150 1850,350 1700,950 1300,800" fill="#c084fc" fill-opacity="0.1" stroke="#c084fc" stroke-width="1" stroke-opacity="0.2"/>
      </svg>
    `)
  }
];
