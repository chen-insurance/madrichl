import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import OptimizedImage from "@/components/common/OptimizedImage";

interface RelatedArticlesProps {
  currentSlug?: string;
  category?: string | null;
  articleId?: string;
  /** Embedding vector already fetched with the article — avoids an extra DB round-trip */
  articleEmbedding?: unknown;
}

const RelatedArticles = ({ currentSlug, category, articleId, articleEmbedding }: RelatedArticlesProps) => {
  const { data: relatedArticles } = useQuery({
    queryKey: ["related-articles", currentSlug, category, articleId],
    staleTime: 15 * 60 * 1000, // 15 minutes — related articles rarely change
    queryFn: async () => {
      // Try semantic similarity search first
      if (articleId) {
        try {
          // Use embedding passed from parent (already fetched with the article).
          // Only fall back to a separate DB fetch if it wasn't provided.
          let embedding = articleEmbedding;
          if (!embedding) {
            const { data: currentArticle } = await supabase
              .from("articles")
              .select("embedding")
              .eq("id", articleId)
              .maybeSingle();
            embedding = currentArticle?.embedding;
          }

          if (embedding) {
            const { data: semanticResults, error: semanticError } = await supabase.rpc(
              "match_articles",
              {
                query_embedding: embedding as string,
                match_threshold: 0.5,
                match_count: 3,
                exclude_slug: currentSlug || null,
              }
            );

            if (!semanticError && semanticResults && semanticResults.length >= 3) {
              return semanticResults;
            }
          }
        } catch {
          // fall through to category-based fallback
        }
      }

      // Fallback: Category-based matching
      let query = supabase
        .from("articles")
        .select("id, title, slug, published_at, featured_image, excerpt, category")
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .neq("slug", currentSlug || "");

      // If we have a category, prioritize same-category articles
      if (category) {
        query = query.eq("category", category);
      }

      const { data: categoryArticles, error: categoryError } = await query
        .order("published_at", { ascending: false })
        .limit(3);

      if (categoryError) throw categoryError;

      // If we got 3 articles from the same category, return them
      if (categoryArticles && categoryArticles.length >= 3) {
        return categoryArticles;
      }

      // Otherwise, fill with other articles
      const existingIds = categoryArticles?.map((a) => a.id) || [];
      const needed = 3 - (categoryArticles?.length || 0);

      if (needed > 0 && existingIds.length > 0) {
        const { data: otherArticles } = await supabase
          .from("articles")
          .select("id, title, slug, published_at, featured_image, excerpt, category")
          .eq("is_published", true)
          .lte("published_at", new Date().toISOString())
          .neq("slug", currentSlug || "")
          .not("id", "in", `(${existingIds.join(",")})`)
          .order("published_at", { ascending: false })
          .limit(needed);

        return [...(categoryArticles || []), ...(otherArticles || [])];
      }

      return categoryArticles;
    },
    enabled: !!currentSlug,
  });

  if (!relatedArticles || relatedArticles.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">
        כתבות נוספות שיעניינו אותך
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.slug}`}
            className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-md transition-shadow border border-border"
          >
            {article.featured_image && (
              <OptimizedImage
                src={article.featured_image}
                alt={article.title}
                aspectRatio="video"
                maxWidth={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                className="group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="p-4">
              {article.category && (
                <span className="inline-block text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded mb-2">
                  {article.category}
                </span>
              )}
              <h3 className="font-display font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                {article.title}
              </h3>
              {article.published_at && (
                <span className="text-xs text-muted-foreground mt-2 block">
                  {format(new Date(article.published_at), "dd/MM/yyyy")}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
