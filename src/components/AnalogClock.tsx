import React, { useState, useEffect } from 'react';
import { ClockType } from '../types';
import { toPersianDigits } from '../lib/utils';

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

  const formattedJalaliDate = toPersianDigits(
    time.toLocaleDateString('fa-IR', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  );

  const formattedWeekday = time.toLocaleDateString('fa-IR', {
    weekday: 'long'
  });

  // Gregorian Date (تاریخ میلادی)
  const formattedGregorianEn = time.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedGregorianFa = toPersianDigits(
    time.toLocaleDateString('fa-IR-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  );

  // Islamic Lunar Hijri Date (تاریخ هجری قمری)
  let formattedHijriDate = '';
  try {
    formattedHijriDate = toPersianDigits(
      new Intl.DateTimeFormat('fa-IR-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(time)
    );
  } catch {
    try {
      formattedHijriDate = toPersianDigits(
        new Intl.DateTimeFormat('fa-IR-u-ca-islamic', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(time)
      );
    } catch {
      formattedHijriDate = '';
    }
  }

  const formattedDigitalTime = toPersianDigits(
    time.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: false
    })
  );

  return (
    <div id="header-clock-date-widget" className="flex items-center gap-3 select-none text-right" dir="rtl">
      {/* Frosted Glass Analog Dial */}
      {(clockType === 'analog' || clockType === 'both') && (
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300/80 dark:border-white/20 bg-white/80 dark:bg-white/[0.08] backdrop-blur-md flex items-center justify-center shadow-inner">
            {/* Hour Hand */}
            <div
              className="absolute w-0.5 bg-slate-800 dark:bg-white rounded-full origin-bottom"
              style={{
                height: '11px',
                transform: `rotate(${hourDeg}deg)`,
                transformOrigin: 'bottom center',
                bottom: '50%'
              }}
            />

            {/* Minute Hand */}
            <div
              className="absolute w-0.5 bg-slate-500 dark:bg-slate-300 rounded-full origin-bottom"
              style={{
                height: '15px',
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
                  height: '15px',
                  transform: `rotate(${secondDeg}deg)`,
                  transformOrigin: 'bottom center',
                  bottom: '50%'
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Persian, Gregorian & Hijri Dates with Digital Clock */}
      <div className="flex flex-col text-start leading-snug justify-center">
        {showDate && (
          <div className="flex flex-col">
            {/* Primary Solar Hijri Date (شمسی) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                {formattedWeekday}، {formattedJalaliDate}
              </span>
            </div>

            {/* Gregorian (میلادی) & Islamic Lunar Hijri (قمری) */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              <span title={`تاریخ میلادی: ${formattedGregorianFa} (${formattedGregorianEn})`}>
                {formattedGregorianEn}
              </span>
              {formattedHijriDate && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span title="تاریخ هجری قمری">
                    {formattedHijriDate}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-tight" dir="rtl">
            {formattedDigitalTime}
          </span>
          {clockType === 'both' && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              ساعت رسمی
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
