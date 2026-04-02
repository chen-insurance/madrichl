/**
 * Validates script sources against a whitelist of trusted domains.
 * Prevents injection of scripts from untrusted sources.
 */

const ALLOWED_SCRIPT_DOMAINS = [
  'www.googletagmanager.com',
  'googletagmanager.com',
  'www.google-analytics.com',
  'connect.facebook.net',
  'www.facebook.com',
  'snap.licdn.com',
  'static.hotjar.com',
  'cdn.segment.com',
  'js.hs-scripts.com',
  'js.hs-analytics.net',
  'bat.bing.com',
  'analytics.tiktok.com',
  's3.tradingview.com',
  'www.clarity.ms',
];

export function isAllowedScriptSrc(src: string): boolean {
  if (!src) return true; // Inline scripts are allowed (admin-only content)
  try {
    const url = new URL(src);
    return ALLOWED_SCRIPT_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
  } catch {
    return false; // Invalid URL = not allowed
  }
}

/**
 * Sanitizes HTML by removing script tags with untrusted sources.
 * Inline scripts and trusted external scripts are preserved.
 */
export function validateScriptElement(child: Element): boolean {
  if (child.tagName !== 'SCRIPT') return true;
  const src = child.getAttribute('src');
  if (!src) return true; // Inline scripts allowed
  return isAllowedScriptSrc(src);
}
