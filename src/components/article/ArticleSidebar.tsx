import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import LeadForm from "@/components/LeadForm";
import TableOfContents from "@/components/article/TableOfContents";
import { format } from "date-fns";

interface ArticleSidebarProps {
  currentSlug?: string;
  articleContent?: string | null;
}

const ArticleSidebar = ({ currentSlug, articleContent }: ArticleSidebarProps) => {
  // Fetch most read articles (for now, just latest published)
  const { data: popularArticles } = useQuery({
    queryKey: ["popular-articles", currentSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, published_at, featured_image")
        .eq("is_published", true)
        .neq("slug", currentSlug || "")
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <aside className="space-y-6 sticky top-24">
      {/* Table of Contents */}
      <TableOfContents content={articleContent || null} />

      {/* Lead Form */}
      <LeadForm
        title="בדוק את זכאותך"
        subtitle="גלו כמה אתם יכולים לחסוך"
        variant="sidebar"
      />

      {/* Most Read Articles */}
      <div className="bg-card rounded-xl p-5 shadow-soft">
        <h3 className="font-display font-bold text-lg text-foreground mb-4 pb-3 border-b border-border">
          הנקראים ביותר
        </h3>
        <div className="space-y-4">
          {popularArticles?.map((article, index) => (
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
                {article.published_at && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(article.published_at), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {(!popularArticles || popularArticles.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              אין מאמרים נוספים כרגע
            </p>
          )}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-gradient-navy rounded-xl p-5 text-cream">
        <h3 className="font-display font-bold text-lg mb-2">הישארו מעודכנים</h3>
        <p className="text-cream/70 text-sm mb-4">
          קבלו את החדשות החשובות ישירות למייל
        </p>
        <Link to="/#newsletter">
          <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            הרשמה לניוזלטר
          </button>
        </Link>
      </div>
    </aside>
  );
};

export default ArticleSidebar;
