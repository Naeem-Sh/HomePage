/**
 * SVG Sanitizer to prevent XSS and malicious script execution in uploaded SVGs
 */
export function sanitizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    throw new Error('Invalid SVG content');
  }

  // Check if it really is SVG
  if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
    throw new Error('Uploaded file is not a valid SVG document');
  }

  let clean = svgContent;

  // 1. Remove XML/HTML comments that could hide payload
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Remove script tags completely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 3. Remove dangerous HTML tags inside SVG (foreignObject, iframe, object, embed, applet, form, input)
  clean = clean.replace(/<\/?(foreignObject|iframe|object|embed|applet|form|input|button|textarea|select|link|meta)\b[^>]*>/gi, '');

  // 4. Remove all on* event handler attributes (onload, onclick, onerror, onmouseover, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // 5. Remove javascript:, data:text/html, vbscript: URLs in href/xlink:href/src
  clean = clean.replace(/\s+(?:xlink:)?href\s*=\s*["']\s*(?:javascript|vbscript|data:\s*text\/html)[^"']*["']/gi, '');
  clean = clean.replace(/\s+src\s*=\s*["']\s*(?:javascript|vbscript|data:\s*text\/html)[^"']*["']/gi, '');

  // 6. Remove CSS expression() or javascript in style tags/attributes
  clean = clean.replace(/expression\s*\([^)]*\)/gi, '');
  clean = clean.replace(/url\s*\(\s*["']?\s*javascript:[^)]*["']?\s*\)/gi, '');

  return clean;
}
