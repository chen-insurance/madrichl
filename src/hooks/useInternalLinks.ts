import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ArticleLink {
  title: string;
  slug: string;
}

interface GlossaryLink {
  term_name: string;
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
 * Fetches all glossary terms for internal linking within articles.
 */
export function useGlossaryLinks() {
  const { data: terms } = useQuery({
    queryKey: ["internal-links-glossary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("term_name, slug")
        .order("term_name");
      if (error) throw error;
      return (data || []) as GlossaryLink[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Sort by term length (longest first) to avoid partial matches
  return (terms || []).sort((a, b) => b.term_name.length - a.term_name.length);
}

/**
 * Injects internal links into content text (supports both HTML and Markdown).
 * - Only links each article title once (first occurrence)
 * - Skips titles inside headings, existing links, or shortcodes
 * - Uses lookaround for Hebrew text (no \b word boundaries)
 */
export function injectInternalLinks(
  content: string,
  articles: ArticleLink[],
  glossaryTerms: GlossaryLink[] = []
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
        replacement = `<a href="/news/${article.slug}" class="internal-link internal-link--article">${linkText}</a>`;
      } else {
        replacement = `[${linkText}](/news/${article.slug})`;
      }

      result = result.substring(0, match.index) + replacement + result.substring(match.index + linkText.length);
      linked.add(article.slug);

      if (linked.size >= 5) break;
    }
  }

  // Glossary term linking (up to 5 additional glossary links)
  let glossaryLinked = 0;
  for (const term of glossaryTerms) {
    if (glossaryLinked >= 5) break;
    if (term.term_name.length < 3) continue;

    const escapedTerm = term.term_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<=[\\s>،.,:;]|^)(${escapedTerm})(?=[\\s<،.,:;?!]|$)`, "i");

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      const before = result.substring(Math.max(0, match.index - 300), match.index);

      if (/<[^>]*$/.test(before)) continue;
      if (/<a\s[^>]*>[^<]*$/i.test(before)) continue;
      if (/<h[1-6][^>]*>[^<]*$/i.test(before)) continue;
      if (/^#{1,6}\s.*$/m.test(before.split("\n").pop() || "")) continue;
      if (/\[[^\]]*$/.test(before)) continue;

      const linkText = match[1];
      let replacement: string;

      if (isHtml) {
        replacement = `<a href="/glossary/${term.slug}" title="מילון מונחים: ${term.term_name}" style="color: inherit; text-decoration: underline; text-decoration-style: dotted;">${linkText}</a>`;
      } else {
        replacement = `[${linkText}](/glossary/${term.slug} "מילון מונחים: ${term.term_name}")`;
      }

      result = result.substring(0, match.index) + replacement + result.substring(match.index + linkText.length);
      glossaryLinked++;
    }
  }

  return result;
}
