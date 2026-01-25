import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/article/Breadcrumbs";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import InArticleCTA from "@/components/article/InArticleCTA";
import { formatDistanceToNow, format } from "date-fns";
import { he } from "date-fns/locale";
import { Loader2, Calendar, Clock } from "lucide-react";
import { useHeadScripts } from "@/hooks/useHeadScripts";
import { Fragment } from "react";

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  useHeadScripts();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

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

  const breadcrumbItems = [
    { label: "חדשות", href: "/news" },
    { label: article.title },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{article.seo_title || article.title} | המדריך לצרכן</title>
        <meta
          name="description"
          content={article.seo_description || article.excerpt || ""}
        />
        <meta property="og:title" content={article.seo_title || article.title} />
        <meta
          property="og:description"
          content={article.seo_description || article.excerpt || ""}
        />
        {article.featured_image && (
          <meta property="og:image" content={article.featured_image} />
        )}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://the-guide.co.il/news/${article.slug}`} />
      </Helmet>

      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            {/* Main Content */}
            <article className="min-w-0">
              {/* Featured Image */}
              {article.featured_image && (
                <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-secondary">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-8">
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                  {article.published_at && (
                    <>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(article.published_at), "dd בMMMM yyyy", {
                            locale: he,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(article.published_at), {
                            addSuffix: true,
                            locale: he,
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-foreground">
                {firstPart && <ReactMarkdown>{firstPart}</ReactMarkdown>}

                {/* In-Article CTA after 2nd paragraph */}
                {contentParagraphs.length > 2 && <InArticleCTA />}

                {secondPart && <ReactMarkdown>{secondPart}</ReactMarkdown>}
              </div>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  המידע במאמר זה נועד למטרות מידע כללי בלבד ואינו מהווה ייעוץ מקצועי.
                </p>
              </div>
            </article>

            {/* Sidebar */}
            <ArticleSidebar currentSlug={slug} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Article;