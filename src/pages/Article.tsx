import { lazy, Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";
import { optimizeImageUrl } from "@/lib/image-utils";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/article/Breadcrumbs";
import BreadcrumbSchema from "@/components/article/BreadcrumbSchema";
import ArticleSchema from "@/components/article/ArticleSchema";
import MobileTableOfContents from "@/components/article/MobileTableOfContents";
import OptimizedImage from "@/components/common/OptimizedImage";
import MarkdownContentWithCTA from "@/components/article/MarkdownContentWithCTA";
import { format } from "date-fns";
import { Loader2, Calendar, Clock } from "lucide-react";
import { useHeadScripts } from "@/hooks/useHeadScripts";
import { useArticleView } from "@/hooks/useArticleView";
import { useContentTracker } from "@/hooks/useContentTracker";
import { getReadingTime } from "@/lib/reading-time";
import { useContentTracker } from "@/hooks/useContentTracker";

// Lazy-load below-fold / heavy components (zod, react-hook-form, accordion, RPC calls)
const ArticleSidebar = lazy(() => import("@/components/article/ArticleSidebar"));
const GlobalLeadForm = lazy(() => import("@/components/GlobalLeadForm"));
const RelatedArticles = lazy(() => import("@/components/article/RelatedArticles"));
const FAQSection = lazy(() => import("@/components/article/FAQSection"));
const FAQSchema = lazy(() => import("@/components/article/FAQSchema"));
const InArticleCTA = lazy(() => import("@/components/article/InArticleCTA"));
const AuthorBox = lazy(() => import("@/components/article/AuthorBox"));

interface FAQItem {
  question: string;
  answer: string;
}

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  useHeadScripts();

  // Check for redirect first
  const { data: redirect, isLoading: isRedirectLoading } = useQuery({
    queryKey: ["redirect-check", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("redirects")
        .select("new_slug")
        .eq("old_slug", slug)
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug && !redirect,
  });

  // Track article view (with debounce)
  useArticleView(article?.id);

  // Track content engagement (scroll depth, time on page)
  useContentTracker({ articleId: article?.id || "", enabled: !!article });

  // Handle redirect
  if (redirect) {
    return <Navigate to={`/news/${redirect.new_slug}`} replace />;
  }

  if (isLoading || isRedirectLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              הכתבה לא נמצאה
            </h1>
            <p className="text-muted-foreground">
              הכתבה שחיפשתם אינה קיימת או שהוסרה
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Split content into paragraphs to insert CTA after 2nd paragraph
  const contentParagraphs = article.content?.split("\n\n") || [];
  const firstPart = contentParagraphs.slice(0, 2).join("\n\n");
  const secondPart = contentParagraphs.slice(2).join("\n\n");

  // Parse FAQ items from database
  const faqItems: FAQItem[] = article.faq_items && Array.isArray(article.faq_items)
    ? (article.faq_items as unknown as FAQItem[])
    : [];

  // Breadcrumb data for UI and Schema
  const categoryLabel = article.category || "חדשות";
  const breadcrumbItems = [
    { label: categoryLabel, href: `/category/${encodeURIComponent(categoryLabel)}` },
    { label: article.title },
  ];

  const breadcrumbSchemaItems = [
    { name: "ראשי", url: "/" },
    { name: categoryLabel, url: `/category/${encodeURIComponent(categoryLabel)}` },
    { name: article.title, url: `/news/${article.slug}` },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{article.seo_title || article.title} | המדריך לצרכן</title>
        <meta
          name="description"
          content={article.seo_description || article.excerpt || ""}
        />
        {/* Open Graph */}
        <meta property="og:title" content={article.seo_title || article.title} />
        <meta
          property="og:description"
          content={article.seo_description || article.excerpt || ""}
        />
        <meta property="og:image" content={optimizeImageUrl(article.featured_image || "https://the-guide.co.il/og-default.png", 1200, 85)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://the-guide.co.il/news/${article.slug}`} />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.seo_title || article.title} />
        <meta name="twitter:description" content={article.seo_description || article.excerpt || ""} />
        <meta name="twitter:image" content={optimizeImageUrl(article.featured_image || "https://the-guide.co.il/og-default.png", 1200, 85)} />
        {/* Canonical */}
        <link rel="canonical" href={`https://the-guide.co.il/news/${article.slug}`} />
      </Helmet>

      {/* Structured Data */}
      <ArticleSchema article={article} />
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <Suspense fallback={null}>
        {faqItems.length > 0 && <FAQSchema items={faqItems} />}
      </Suspense>

      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            {/* Main Content */}
            <article className="min-w-0">
              {/* Featured Image - with aspect-ratio for CLS prevention, eager loading for LCP */}
              {article.featured_image && (
                <div className="rounded-xl overflow-hidden mb-6 md:mb-8 -mx-4 md:mx-0">
                  <OptimizedImage
                    src={article.featured_image}
                    alt={article.image_alt_text || article.title}
                    aspectRatio="video"
                    priority={true}
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-6 md:mb-8 px-0">
                {article.category && (
                  <span className="inline-block text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
                    {article.category}
                  </span>
                )}
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-snug mb-4">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                  {article.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(article.published_at), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                  {article.author_name && (
                    <span className="text-foreground font-medium">
                      מאת: {article.author_name}
                    </span>
                  )}
                </div>
              </header>

              {/* Mobile Table of Contents */}
              <MobileTableOfContents content={article.content} />

              {/* Article Content with CTA blocks and custom heading IDs for TOC */}
              <div className="article-content rich-text-content w-full max-w-none text-right">
                {firstPart && <MarkdownContentWithCTA content={firstPart} />}

                {/* In-Article CTA after 2nd paragraph */}
                <Suspense fallback={null}>
                  {contentParagraphs.length > 2 && <InArticleCTA />}
                </Suspense>

                {secondPart && <MarkdownContentWithCTA content={secondPart} />}
              </div>

              {/* Author Box - E-E-A-T */}
              <Suspense fallback={null}>
                <AuthorBox
                  authorName={article.author_name}
                  authorBio={article.author_bio}
                />
              </Suspense>

              {/* FAQ Section */}
              <Suspense fallback={null}>
                {faqItems.length > 0 && <FAQSection items={faqItems} />}
              </Suspense>

              {/* Bottom Lead Form (Mobile & Desktop) */}
              <div id="lead-form-section" className="mt-12">
                <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
                  <GlobalLeadForm />
                </Suspense>
              </div>

              {/* Related Articles - Semantic similarity when available */}
              <Suspense fallback={null}>
                <RelatedArticles
                  currentSlug={slug}
                  category={article.category}
                  articleId={article.id}
                />
              </Suspense>

              {/* Article Footer */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  המידע במאמר זה נועד למטרות מידע כללי בלבד ואינו מהווה ייעוץ מקצועי.
                </p>
              </div>
            </article>

            {/* Sidebar */}
            <Suspense fallback={<div className="space-y-6"><div className="h-48 bg-muted rounded animate-pulse" /></div>}>
              <ArticleSidebar currentSlug={slug} articleContent={article.content} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Article;
