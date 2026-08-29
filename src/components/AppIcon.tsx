import React from 'react';
import * as LucideIcons from 'lucide-react';
import { getBuiltinIconById } from '../data/builtinIcons';

interface AppIconProps {
  icon: string;
  className?: string;
  accentColor?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ icon, className = 'w-6 h-6', accentColor }) => {
  // 1. Check if it's a custom uploaded icon URL (e.g. /uploads/icons/...)
  if (icon.startsWith('/uploads/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image')) {
    return (
      <img
        src={icon}
        alt="App Icon"
        className={`${className} object-contain`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // 2. Check if it's one of the 50+ built-in Linux / self-hosted icons
  const builtin = getBuiltinIconById(icon);
  if (builtin) {
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{ color: accentColor || builtin.color }}
        dangerouslySetInnerHTML={{ __html: builtin.svg }}
      />
    );
  }

  // 3. Fallback to Lucide Icons
  const IconComponent = (LucideIcons as Record<string, any>)[icon] || LucideIcons.Globe;
  return <IconComponent className={className} style={{ color: accentColor }} />;
};
