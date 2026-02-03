import LeadForm from "@/components/LeadForm";
import TableOfContents from "@/components/article/TableOfContents";
import TrendingArticles from "@/components/article/TrendingArticles";

interface ArticleSidebarProps {
  currentSlug?: string;
  articleContent?: string | null;
}

const ArticleSidebar = ({ currentSlug, articleContent }: ArticleSidebarProps) => {
  return (
    <aside className="space-y-6 sticky top-24">
      {/* Table of Contents */}
      <TableOfContents content={articleContent || null} />

      {/* Lead Form - Hidden on mobile, shown only on desktop */}
      <div className="hidden lg:block">
        <LeadForm
          title="בדוק את זכאותך"
          subtitle="גלו כמה אתם יכולים לחסוך"
          variant="sidebar"
        />
      </div>

      {/* Trending Articles (Last 7 Days) */}
      <TrendingArticles excludeSlug={currentSlug} limit={5} />
    </aside>
  );
};

export default ArticleSidebar;
