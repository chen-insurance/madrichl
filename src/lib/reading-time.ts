/**
 * Calculate estimated reading time for Hebrew content.
 * Average Hebrew reading speed: ~200 words per minute.
 */
export function getReadingTime(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
