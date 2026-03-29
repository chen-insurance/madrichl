import { lazy, Suspense } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/article/Breadcrumbs";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import InArticleCTA from "@/components/article/InArticleCTA";
import AuthorBox from "@/components/article/AuthorBox";
import MarkdownContent from "@/components/article/MarkdownContent";
import OptimizedImage from "@/components/common/OptimizedImage";
import { format } from "date-fns";
import { Loader2, Calendar, AlertTriangle } from "lucide-react";

const LeadForm = lazy(() => import("@/components/LeadForm"));
import { Alert, AlertDescription } from "@/components/ui/alert";

const Preview = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["preview-article", token],
    queryFn: async () => {
      if (!token) throw new Error("No preview token provided");

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("preview_token", token)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Article not found or invalid token");
      
      return data;
    },
    enabled: !!token,
    retry: false,
  });

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
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
              קישור התצוגה המקדימה לא תקף
            </h1>
            <p className="text-muted-foreground">
              הקישור פג תוקף או שהמאמר הוסר
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

  // Breadcrumb data for UI
  const categoryLabel = article.category || "חדשות";
  const breadcrumbItems = [
    { label: categoryLabel, href: `/category/${encodeURIComponent(categoryLabel)}` },
    { label: article.title },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>תצוגה מקדימה: {article.title} | המדריך לצרכן</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto">
          {/* Preview Warning Banner */}
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <AlertDescription className="text-yellow-600">
              זוהי תצוגה מקדימה של טיוטה. המאמר עדיין לא פורסם.
            </AlertDescription>
          </Alert>

          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            {/* Main Content */}
            <article className="min-w-0">
              {/* Featured Image */}
              {article.featured_image && (
                <div className="rounded-xl overflow-hidden mb-8">
                  <OptimizedImage
                    src={article.featured_image}
                    alt={article.title}
                    aspectRatio="video"
                    priority={true}
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-8">
                {article.category && (
                  <span className="inline-block text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
                    {article.category}
                  </span>
                )}
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(article.created_at), "dd/MM/yyyy")}
                    </span>
                  </div>
                  {article.author_name && (
                    <span className="text-foreground font-medium">
                      מאת: {article.author_name}
                    </span>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-foreground">
                {firstPart && <MarkdownContent content={firstPart} />}

                {contentParagraphs.length > 2 && <InArticleCTA />}

                {secondPart && <MarkdownContent content={secondPart} />}
              </div>

              {/* Author Box */}
              <AuthorBox
                authorName={article.author_name}
                authorBio={article.author_bio}
              />

              {/* Bottom Lead Form */}
              <div className="mt-12">
                <Suspense fallback={<div className="h-48 bg-muted rounded animate-pulse" />}>
                  <LeadForm
                    title="בדוק את זכאותך עכשיו"
                    subtitle="השאירו פרטים ומומחה יחזור אליכם ללא עלות"
                    variant="card"
                  />
                </Suspense>
              </div>
            </article>

            {/* Sidebar */}
            <ArticleSidebar currentSlug={article.slug} articleContent={article.content} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Preview;
