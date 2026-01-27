import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import LeadForm from "@/components/LeadForm";
import TableOfContents from "@/components/article/TableOfContents";
import TrendingArticles from "@/components/article/TrendingArticles";
import { format } from "date-fns";

interface ArticleSidebarProps {
  currentSlug?: string;
  articleContent?: string | null;
}

const ArticleSidebar = ({ currentSlug, articleContent }: ArticleSidebarProps) => {
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

      {/* Trending Articles (Last 7 Days) */}
      <TrendingArticles excludeSlug={currentSlug} limit={5} />

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
