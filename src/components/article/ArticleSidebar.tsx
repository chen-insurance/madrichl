import { lazy, Suspense } from "react";
import TableOfContents from "@/components/article/TableOfContents";

// Lazy-load heavy sidebar components (GlobalLeadForm pulls zod/react-hook-form, TrendingArticles does RPC)
const GlobalLeadForm = lazy(() => import("@/components/GlobalLeadForm"));
const TrendingArticles = lazy(() => import("@/components/article/TrendingArticles"));

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
        <Suspense fallback={<div className="h-48 bg-muted rounded animate-pulse" />}>
          <GlobalLeadForm variant="compact" />
        </Suspense>
      </div>

      {/* Trending Articles (Last 7 Days) */}
      <Suspense fallback={null}>
        <TrendingArticles excludeSlug={currentSlug} limit={5} />
      </Suspense>
    </aside>
  );
};

export default ArticleSidebar;
