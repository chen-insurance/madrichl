/**
 * Shared image optimization utilities.
 * Adds width, quality, and WebP format params to supported CDN URLs.
 *
 * Supported:  Supabase Storage (via /render/image/), Unsplash
 * Unsupported: external CDNs (manuscdn, google) — returned unchanged.
 */

const SUPABASE_PUBLIC_OBJECT = "/storage/v1/object/public/";
const SUPABASE_RENDER_IMAGE = "/storage/v1/render/image/public/";

const isSupabaseStorage = (url: string): boolean =>
  url.includes(".supabase.co") && url.includes(SUPABASE_PUBLIC_OBJECT);

const isUnsplash = (url: string): boolean => url.includes("images.unsplash.com");

/** Returns true only for URLs we can actually resize/convert server-side */
export const canOptimizeUrl = (url: string): boolean => {
  if (!url) return false;
  return isUnsplash(url) || isSupabaseStorage(url);
};

export const optimizeImageUrl = (url: string, width: number, quality: number = 75): string => {
  if (!url) return url;

  // Unsplash — rewrite w/h/q params for proper sizing
  if (isUnsplash(url)) {
    const base = url.split("?")[0];
    return `${base}?w=${width}&q=${quality}&fm=webp&fit=crop&auto=format`;
  }

  // Supabase Storage — use the render/image endpoint for on-the-fly resizing
  if (isSupabaseStorage(url)) {
    const transformed = url
      .split("?")[0]
      .replace(SUPABASE_PUBLIC_OBJECT, SUPABASE_RENDER_IMAGE);
    return `${transformed}?width=${width}&quality=${quality}&resize=contain`;
  }

  return url;
};

export const buildSrcSet = (url: string, widths = [320, 480, 640, 800, 1024, 1280]): string => {
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(", ");
};
