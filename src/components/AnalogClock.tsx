import React, { useState, useEffect } from 'react';
import { ClockType } from '../types';

interface AnalogClockProps {
  clockType?: ClockType;
  showDate?: boolean;
  showSeconds?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  clockType = 'analog',
  showDate = true,
  showSeconds = true
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (clockType === 'none') {
    return null;
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Angular calculations
  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1; // Smooth minute drift
  const hourDeg = (hours % 12) * 30 + minutes * 0.5; // Smooth hour drift

  const formattedDate = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedWeekday = time.toLocaleDateString(undefined, {
    weekday: 'short'
  });

  const formattedDigitalTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: false
  });

  return (
    <div id="analog-clock-container" className="flex items-center gap-3.5 select-none">
      {/* Frosted Glass Analog Dial */}
      {(clockType === 'analog' || clockType === 'both') && (
        <div className="flex flex-col items-center">
          <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full border border-slate-300/80 dark:border-white/20 bg-white/80 dark:bg-white/[0.08] backdrop-blur-md flex items-center justify-center shadow-inner">
            {/* Hour Hand */}
            <div
              className="absolute w-0.5 bg-slate-800 dark:bg-white rounded-full origin-bottom"
              style={{
                height: '12px',
                transform: `rotate(${hourDeg}deg)`,
                transformOrigin: 'bottom center',
                bottom: '50%'
              }}
            />

            {/* Minute Hand */}
            <div
              className="absolute w-0.5 bg-slate-500 dark:bg-slate-300 rounded-full origin-bottom"
              style={{
                height: '16px',
                transform: `rotate(${minuteDeg}deg)`,
                transformOrigin: 'bottom center',
                bottom: '50%'
              }}
            />

            {/* Center Pin */}
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full z-10 shadow-[0_0_6px_#3b82f6]" />

            {/* Seconds Hand */}
            {showSeconds && (
              <div
                className="absolute w-0.5 bg-blue-400 rounded-full origin-bottom shadow-xs"
                style={{
                  height: '16px',
                  transform: `rotate(${secondDeg}deg)`,
                  transformOrigin: 'bottom center',
                  bottom: '50%'
                }}
              />
            )}
          </div>
          {clockType === 'both' && (
            <span className="text-[10px] font-mono mt-1 text-slate-500 dark:text-slate-400">
              {formattedDigitalTime}
            </span>
          )}
        </div>
      )}

      {/* Date & Digital Readout */}
      <div className="text-left leading-tight">
        {clockType === 'digital' && (
          <span className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight block">
            {formattedDigitalTime}
          </span>
        )}
        {showDate && (
          <div className="flex flex-col">
            <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              {formattedWeekday}, {formattedDate}
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {formattedDigitalTime} UTC
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
