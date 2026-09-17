/**
 * Utility functions for formatting Persian numbers, dates, classes, and file sizes.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\d/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

export function formatPersianDate(
  input: string | Date | number | undefined | null,
  includeTime = true
): string {
  if (!input) return '';
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    };

    const formatted = new Intl.DateTimeFormat('fa-IR', options).format(d);
    return toPersianDigits(formatted);
  } catch {
    return String(input);
  }
}

export function formatBytes(bytes: number | undefined | null): string {
  if (!bytes || bytes <= 0) return toPersianDigits('0') + ' بایت';
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${toPersianDigits(val)} ${sizes[i]}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
