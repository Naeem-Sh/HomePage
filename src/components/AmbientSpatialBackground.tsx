import React from 'react';
import { BG_THEMES, BgThemeOption } from '../lib/bgThemes';

interface AmbientSpatialBackgroundProps {
  className?: string;
  themeId?: string;
}

export const AmbientSpatialBackground: React.FC<AmbientSpatialBackgroundProps> = ({
  className = '',
  themeId = 'cosmic'
}) => {
  const activeTheme: BgThemeOption =
    BG_THEMES.find((t) => t.id === themeId) || BG_THEMES[0];

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500 ${className}`}
    >
      {/* Dark Mode Background Light Fields */}
      <div className={`hidden dark:block absolute inset-0 ${activeTheme.darkBaseBg} transition-colors duration-500`}>
        {/* Soft Celestial Field 1 */}
        <div
          className={`absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br ${activeTheme.darkOrbs.orb1} blur-[120px] animate-spatial-1 transition-all duration-700`}
        />

        {/* Soft Field 2 */}
        <div
          className={`absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl ${activeTheme.darkOrbs.orb2} blur-[130px] animate-spatial-2 transition-all duration-700`}
        />

        {/* Soft Horizon Glow 3 */}
        <div
          className={`absolute -bottom-[20%] left-[20%] w-[60vw] h-[45vw] rounded-full bg-gradient-to-t ${activeTheme.darkOrbs.orb3} blur-[140px] animate-spatial-3 transition-all duration-700`}
        />

        {/* Subtle Frosted Geometric Film Overlay */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-overlay"
        />
      </div>

      {/* Light Mode Background Light Fields */}
      <div className={`block dark:hidden absolute inset-0 ${activeTheme.lightBaseBg} transition-colors duration-500`}>
        {/* Soft Light Field 1 */}
        <div
          className={`absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br ${activeTheme.lightOrbs.orb1} blur-[100px] animate-spatial-1 transition-all duration-700`}
        />

        {/* Soft Field 2 */}
        <div
          className={`absolute top-[30%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl ${activeTheme.lightOrbs.orb2} blur-[110px] animate-spatial-2 transition-all duration-700`}
        />

        {/* Soft Field 3 */}
        <div
          className={`absolute -bottom-[15%] left-[25%] w-[55vw] h-[40vw] rounded-full bg-gradient-to-t ${activeTheme.lightOrbs.orb3} blur-[120px] animate-spatial-3 transition-all duration-700`}
        />

        {/* Subtle Soft Micro Pattern */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#00000006_1px,transparent_1px)] [background-size:24px_24px] opacity-60"
        />
      </div>
    </div>
  );
};
