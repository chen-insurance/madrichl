/**
 * Shared Supabase Storage image optimization utilities.
 * Adds width, quality, and WebP format params to Supabase Storage URLs.
 */

export const optimizeImageUrl = (url: string, width: number, quality: number = 80): string => {
  if (!url) return url;
  if (url.includes("supabase.co/storage")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }
  return url;
};

export const buildSrcSet = (url: string, widths = [320, 640, 768, 1024, 1280]): string => {
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(", ");
};
