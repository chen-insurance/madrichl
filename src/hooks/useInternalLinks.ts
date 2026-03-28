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
 * Injects internal links into content text.
 * - Only links each article title once (first occurrence)
 * - Skips titles inside headings, existing links, or shortcodes
 * - Case-insensitive matching for Hebrew
 */
export function injectInternalLinks(
  content: string,
  articles: ArticleLink[]
): string {
  if (!content || articles.length === 0) return content;

  // Track which articles we've already linked
  const linked = new Set<string>();
  let result = content;

  for (const article of articles) {
    if (linked.has(article.slug)) continue;

    // Skip very short titles (< 4 chars) to avoid false matches
    if (article.title.length < 4) continue;

    // Escape special regex chars in title
    const escapedTitle = article.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match title not inside:
    // - HTML tags (< >)
    // - Existing links [text](url) or <a> tags  
    // - Headings (## or <h2>)
    // - Shortcodes {{ }}
    const regex = new RegExp(
      `(?<![#<\\[{/])\\b(${escapedTitle})\\b(?![\\]}>})`,
      "i"
    );

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      // Check context: skip if inside a heading line, link, or HTML tag
      const before = result.substring(Math.max(0, match.index - 200), match.index);
      
      // Skip if inside a markdown heading
      if (/^#{1,6}\s.*$/m.test(before.split("\n").pop() || "")) continue;
      // Skip if inside an existing markdown link
      if (/\[[^\]]*$/.test(before)) continue;
      // Skip if inside an HTML tag
      if (/<[^>]*$/.test(before)) continue;

      const linkText = match[1];
      const replacement = `[${linkText}](/news/${article.slug})`;
      result = result.substring(0, match.index) + replacement + result.substring(match.index + linkText.length);
      linked.add(article.slug);

      // Limit to 5 internal links per article to keep it natural
      if (linked.size >= 5) break;
    }
  }

  return result;
}
