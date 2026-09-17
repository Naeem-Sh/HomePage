import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { getBuiltinIconById } from '../data/builtinIcons';

export interface AppIconProps {
  icon: string;
  className?: string;
  accentColor?: string;
  fillContainer?: boolean;
}

export function isImageIcon(icon?: string): boolean {
  if (!icon) return false;
  return (
    icon.startsWith('/uploads/') ||
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('data:image') ||
    /\.(png|jpe?g|svg|webp|gif|ico|bmp)(\?.*)?$/i.test(icon)
  );
}

export const AppIcon: React.FC<AppIconProps> = ({ icon, className = 'w-6 h-6', accentColor, fillContainer = false }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [icon]);

  if (!icon) {
    return <LucideIcons.Globe className={className} style={{ color: accentColor }} />;
  }

  // 1. Check if it's a custom uploaded icon URL (e.g. /uploads/icons/..., /uploads/..., or external image)
  if (!hasError && isImageIcon(icon)) {
    // Strip restrictive small fixed dimensions (w-4, w-5, etc.) so image can scale to fill at least 90% of frame
    const cleanClassName = (className || '')
      .replace(/\b(w-[3-8]|h-[3-8]|w-10|h-10|w-12|h-12|w-6\.5|h-6\.5)\b/g, '')
      .trim();

    return (
      <img
        src={icon}
        alt="App Icon"
        className={`w-[92%] h-[92%] max-w-[95%] max-h-[95%] object-contain rounded-lg transition-transform duration-200 select-none ${cleanClassName}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  // 2. Check if it's one of the built-in Linux / self-hosted SVG icons
  const builtin = getBuiltinIconById(icon);
  if (builtin) {
    return (
      <div
        className={`${className} flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain [&>svg]:block`}
        style={{ color: accentColor || builtin.color }}
        dangerouslySetInnerHTML={{ __html: builtin.svg }}
      />
    );
  }

  // 3. Fallback to Lucide Icons
  const IconComponent = (LucideIcons as Record<string, any>)[icon] || LucideIcons.Globe;
  return <IconComponent className={`${className} shrink-0`} style={{ color: accentColor }} />;
};
