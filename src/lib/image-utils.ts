/**
 * Shared image optimization utilities.
 * Adds width, quality, and WebP format params to supported CDN URLs.
 *
 * Supported:  Supabase Storage, Unsplash
 * Unsupported: Google Storage, other external CDNs — returned unchanged.
 *              Call `canOptimizeUrl` before generating a srcset to avoid
 *              sending the same full-size URL for every breakpoint.
 */

/** Returns true only for URLs we can actually resize/convert server-side */
export const canOptimizeUrl = (url: string): boolean => {
  if (!url) return false;
  // Only Unsplash supports server-side resizing reliably.
  // Supabase Storage on Lovable Cloud does NOT support image transformations.
  return url.includes("images.unsplash.com");
};

export const optimizeImageUrl = (url: string, width: number, quality: number = 75): string => {
  if (!url) return url;
  // Unsplash — rewrite w/h/q params for proper sizing
  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${width}&q=${quality}&fm=webp&fit=crop&auto=format`;
  }
  // For all other sources (including Supabase Storage) return unchanged.
  // Supabase Storage on Lovable Cloud does not support image transformations.
  return url;
};

export const buildSrcSet = (url: string, widths = [320, 480, 640, 800, 1024, 1280]): string => {
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(", ");
};
