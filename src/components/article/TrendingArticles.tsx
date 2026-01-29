import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { TrendingUp, Eye } from "lucide-react";

interface TrendingArticlesProps {
  excludeSlug?: string;
  limit?: number;
}

const TrendingArticles = ({ excludeSlug, limit = 5 }: TrendingArticlesProps) => {
  const { data: trendingArticles, isLoading } = useQuery({
    queryKey: ["trending-articles", excludeSlug, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_trending_articles", {
        p_limit: limit,
        p_exclude_slug: excludeSlug || null,
      });

      if (error) {
        console.error("Error fetching trending articles:", error);
        // Fallback to simple query if RPC fails
        const { data: fallbackData } = await supabase
          .from("articles")
          .select("id, title, slug, published_at, featured_image, view_count")
          .eq("is_published", true)
          .lte("published_at", new Date().toISOString())
          .neq("slug", excludeSlug || "")
          .order("view_count", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(limit);
        return fallbackData;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-5 shadow-soft animate-pulse">
        <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded mb-3"></div>
        ))}
      </div>
    );
  }

  if (!trendingArticles || trendingArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-lg text-foreground">
          פופולרי השבוע
        </h3>
      </div>
      <div className="space-y-4">
        {trendingArticles.map((article, index) => (
          <Link
            key={article.id}
            to={`/news/${article.slug}`}
            className="flex gap-3 group"
          >
            <span className="text-2xl font-display font-bold text-accent/30 group-hover:text-accent transition-colors">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {article.view_count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {article.view_count}
                  </span>
                )}
                {article.published_at && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(article.published_at), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingArticles;
