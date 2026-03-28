import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ArticleLink {
  title: string;
  slug: string;
}

/**
 * Fetches all published article titles and slugs for internal linking.
 * Results are cached for 30 minutes to minimize API calls.
 */
export function useInternalLinks(currentSlug?: string) {
  const { data: articles } = useQuery({
    queryKey: ["internal-links-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("title, slug")
        .eq("is_published", true)
        .order("title");
      if (error) throw error;
      return (data || []) as ArticleLink[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Filter out current article, sort by title length (longest first) to avoid partial matches
  const linkableArticles = (articles || [])
    .filter((a) => a.slug !== currentSlug)
    .sort((a, b) => b.title.length - a.title.length);

  return linkableArticles;
}

/**
 * Injects internal links into content text (supports both HTML and Markdown).
 * - Only links each article title once (first occurrence)
 * - Skips titles inside headings, existing links, or shortcodes
 * - Uses lookaround for Hebrew text (no \b word boundaries)
 */
export function injectInternalLinks(
  content: string,
  articles: ArticleLink[]
): string {
  if (!content || articles.length === 0) return content;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  const linked = new Set<string>();
  let result = content;

  for (const article of articles) {
    if (linked.has(article.slug)) continue;
    if (article.title.length < 6) continue;

    const escapedTitle = article.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Use non-word-char boundaries instead of \b for Hebrew support
    const regex = new RegExp(`(?<=[\\s>،.,:;]|^)(${escapedTitle})(?=[\\s<،.,:;?!]|$)`, "i");

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      const before = result.substring(Math.max(0, match.index - 300), match.index);
      const after = result.substring(match.index + match[1].length, match.index + match[1].length + 50);

      // Skip if inside an HTML tag attribute or <a>/<h1-h6> element
      if (/<[^>]*$/.test(before)) continue;
      if (/<a\s[^>]*>[^<]*$/i.test(before)) continue;
      if (/<h[1-6][^>]*>[^<]*$/i.test(before)) continue;
      // Skip if inside markdown heading or link
      if (/^#{1,6}\s.*$/m.test(before.split("\n").pop() || "")) continue;
      if (/\[[^\]]*$/.test(before)) continue;

      const linkText = match[1];
      let replacement: string;

      if (isHtml) {
        replacement = `<a href="/news/${article.slug}" style="color: inherit; text-decoration: underline;">${linkText}</a>`;
      } else {
        replacement = `[${linkText}](/news/${article.slug})`;
      }

      result = result.substring(0, match.index) + replacement + result.substring(match.index + linkText.length);
      linked.add(article.slug);

      if (linked.size >= 5) break;
    }
  }

  return result;
}
