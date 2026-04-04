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
  return url.includes("supabase.co/storage") || url.includes("images.unsplash.com");
};

export const optimizeImageUrl = (url: string, width: number, quality: number = 75): string => {
  if (!url) return url;
  // Supabase Storage — supports width / quality / format params
  if (url.includes("supabase.co/storage")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }
  // Unsplash — rewrite w/h/q params for proper sizing
  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${width}&q=${quality}&fm=webp&fit=crop&auto=format`;
  }
  // For all other sources return the original URL unchanged.
  // Do NOT generate a srcset for these — every entry would be the same file.
  return url;
};

export const buildSrcSet = (url: string, widths = [320, 480, 640, 800, 1024, 1280]): string => {
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(", ");
};
