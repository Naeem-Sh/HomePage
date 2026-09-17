// Utility functions for homelab network privacy and display sanitization

/**
 * Checks if a string contains raw IP addresses, localhosts, or explicit port numbers.
 */
export function containsIpOrPort(input: string): boolean {
  if (!input) return false;
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?\b/;
  const localhostRegex = /\b(localhost|127\.0\.0\.1)(:\d{1,5})?\b/i;
  const portRegex = /:\d{2,5}(\/|$|\?)/;
  return ipRegex.test(input) || localhostRegex.test(input) || portRegex.test(input);
}

/**
 * Sanitizes URLs or paths to prevent exposing private IPs and host ports in public views.
 */
export function sanitizePublicAddress(url: string, role?: string): string {
  if (!url) return '';
  if (role === 'admin') return url;

  if (url.startsWith('\\\\') || url.startsWith('smb://') || url.startsWith('nfs://')) {
    return 'smb://[protected-storage]/share';
  }
  if (url.startsWith('file://') || url.startsWith('/')) {
    return 'file://[protected-volume]/resource';
  }
  if (url.startsWith('https://')) {
    return 'https://[protected-service.local]';
  }
  return 'http://[protected-service.local]';
}

/**
 * Returns a friendly, non-revealing label for public service targets.
 */
export function getFriendlyServiceLabel(url: string): string {
  if (!url) return 'سرویس هوم‌لب';
  if (url.startsWith('\\\\') || url.startsWith('smb://') || url.startsWith('nfs://')) {
    return 'اشتراک شبکه محافظت‌شده';
  }
  if (url.toLowerCase().endsWith('.pdf') || url.startsWith('file://')) {
    return 'سند و مستندات';
  }
  if (url.startsWith('https://')) {
    return 'سرویس امن HTTPS';
  }
  return 'سرویس داخلی شبکه';
}
