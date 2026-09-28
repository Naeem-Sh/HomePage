import React from 'react';
import { BG_PATTERN_THEMES, BgPatternTheme, DEFAULT_BG_THEME_ID } from '../lib/bgThemes';

interface AmbientSpatialBackgroundProps {
  className?: string;
  themeId?: string;
}

export const AmbientSpatialBackground: React.FC<AmbientSpatialBackgroundProps> = ({
  className = '',
  themeId = DEFAULT_BG_THEME_ID
}) => {
  const activeTheme: BgPatternTheme =
    BG_PATTERN_THEMES.find((t) => t.id === themeId) || BG_PATTERN_THEMES[0]; // cosmic-sky fallback

  return (
    <div
      id="portal-ambient-pattern-background"
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
    >
      {/* Light Mode Base Layer */}
      <div
        className="block dark:hidden absolute inset-0 transition-colors duration-300"
        style={{
          backgroundColor: activeTheme.lightBaseBg
        }}
      />

      {/* Light Mode Soft Pattern Layer - Calibrated opacity for clean readability */}
      <div
        className="block dark:hidden absolute inset-0 transition-all duration-300 opacity-25"
        style={{
          backgroundImage: activeTheme.lightPatternCss,
          backgroundSize: activeTheme.lightPatternSize || 'auto',
          backgroundPosition: activeTheme.lightPatternPosition || '0 0',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Dark Mode Base Layer */}
      <div
        className="hidden dark:block absolute inset-0 transition-colors duration-300"
        style={{
          backgroundColor: activeTheme.darkBaseBg
        }}
      />

      {/* Dark Mode Soft Pattern Layer - Gentle ambient texture */}
      <div
        className="hidden dark:block absolute inset-0 transition-all duration-300 opacity-20"
        style={{
          backgroundImage: activeTheme.darkPatternCss,
          backgroundSize: activeTheme.darkPatternSize || 'auto',
          backgroundPosition: activeTheme.darkPatternPosition || '0 0',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Soft gradient ambient overlay to keep the center reading area clear and clean */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.04] dark:to-black/30 pointer-events-none" />
    </div>
  );
};
