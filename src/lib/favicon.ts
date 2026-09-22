/**
 * Utility to dynamically update the browser tab's favicon and title
 * to match the user's custom uploaded portal logo and title in Google Chrome,
 * Firefox, Edge, and Safari.
 */
export function updateFaviconAndTitle(logoUrl?: string | null, title?: string) {
  if (typeof document === 'undefined') return;

  // 1. Update Document Title
  const resolvedTitle = (title && title.trim()) ? title.trim() : 'پورتال شیراز';
  document.title = resolvedTitle;

  // 2. Resolve Favicon URL
  const targetHref = logoUrl && logoUrl.trim() ? logoUrl.trim() : '/favicon.ico';

  // 3. Update or create standard favicon links
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];

  rels.forEach((rel) => {
    let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }

    // Determine type attribute if applicable
    if (targetHref.endsWith('.svg') || targetHref.includes('image/svg+xml')) {
      link.type = 'image/svg+xml';
    } else if (targetHref.endsWith('.png')) {
      link.type = 'image/png';
    } else if (targetHref.endsWith('.jpg') || targetHref.endsWith('.jpeg')) {
      link.type = 'image/jpeg';
    } else if (targetHref.endsWith('.webp')) {
      link.type = 'image/webp';
    } else if (targetHref.endsWith('.ico')) {
      link.type = 'image/x-icon';
    } else {
      link.removeAttribute('type');
    }

    // Assign href
    link.href = targetHref;
  });
}
