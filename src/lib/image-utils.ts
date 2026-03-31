/**
 * Shared image optimization utilities.
 * Adds width, quality, and WebP format params to Supabase Storage URLs.
 * Also optimizes Unsplash URLs with proper width/quality/format params.
 */

export const optimizeImageUrl = (url: string, width: number, quality: number = 70): string => {
  if (!url) return url;
  // Supabase Storage
  if (url.includes("supabase.co/storage")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }
  // Unsplash - rewrite w/h/q params for proper sizing
  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${width}&q=${quality}&fm=webp&fit=crop&auto=format`;
  }
  return url;
};

export const buildSrcSet = (url: string, widths = [320, 480, 640, 800, 1024, 1280]): string => {
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(", ");
};
