import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownContentWithCTA from "@/components/article/MarkdownContentWithCTA";
import logoIcon from "@/assets/logo-icon.png";

// Extract the first image URL from HTML/Markdown content for preloading
const extractFirstImageUrl = (content: string | null): string | null => {
  if (!content) return null;
  // Try HTML img tag first
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch) return htmlMatch[1];
  // Try markdown image
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (mdMatch) return mdMatch[1];
  return null;
};

// Build optimized URL for preload
const getPreloadUrl = (url: string, width: number): string => {
  if (url.includes("supabase.co/storage")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}width=${width}&quality=80&format=webp`;
  }
  return url;
};

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["static-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const isLandingPage = page?.is_landing_page || false;

  // Extract hero image for preloading (LCP optimization)
  const heroImageUrl = useMemo(() => {
    if (!page?.content) return null;
    return extractFirstImageUrl(page.content);
  }, [page?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {!isLandingPage && <Header />}
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-2/3 mb-6" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-3/4 mb-3" />
        </main>
        {!isLandingPage && <Footer />}
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            העמוד לא נמצא
          </h1>
          <p className="text-muted-foreground mb-8">
            העמוד שחיפשת אינו קיים או לא פורסם עדיין.
          </p>
          <Link to="/">
            <Button>חזרה לדף הבית</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Landing Page Mode - Clean, focused layout
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{page.seo_title || page.title} | המדריך לצרכן</title>
          <meta
            name="description"
            content={page.seo_description || `${page.title} - המדריך לצרכן`}
          />
          <link rel="canonical" href={`https://the-guide.co.il/${slug}`} />
          {/* Only preload hero image for desktop - mobile uses CSS gradient */}
          {heroImageUrl && (
            <link
              rel="preload"
              as="image"
              href={getPreloadUrl(heroImageUrl, 800)}
              imageSrcSet={`${getPreloadUrl(heroImageUrl, 800)} 800w, ${getPreloadUrl(heroImageUrl, 1280)} 1280w`}
              imageSizes="(max-width: 768px) 0px, (max-width: 1024px) 50vw, 800px"
              media="(min-width: 768px)"
            />
          )}
        </Helmet>

        <main className="min-h-screen flex items-center justify-center py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Brand Logo */}
            <div className="text-center mb-8 pt-5">
              <Link to="/" className="inline-flex items-center gap-3 justify-center">
                <img 
                  src={logoIcon} 
                  alt="המדריך לצרכן" 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                />
                <div className="text-right">
                  <h2 className="font-display font-bold text-lg md:text-xl text-foreground">המדריך לצרכן</h2>
                  <p className="text-xs text-muted-foreground">מגזין ביטוח ופיננסים</p>
                </div>
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-8">
              {page.title}
            </h1>

            {/* Content with widget support */}
            <article className="prose prose-lg max-w-none rtl">
              {page.content ? (
                <MarkdownContentWithCTA content={page.content} />
              ) : (
                <p className="text-muted-foreground text-center">אין תוכן לעמוד זה.</p>
              )}
            </article>
          </div>
        </main>
      </div>
    );
  }

  // Normal Page Layout
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{page.seo_title || page.title} | המדריך לצרכן</title>
        <meta
          name="description"
          content={page.seo_description || `${page.title} - המדריך לצרכן`}
        />
        <link rel="canonical" href={`https://the-guide.co.il/${slug}`} />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent transition-colors">
            דף הבית
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{page.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl font-display font-bold text-foreground mb-8">
          {page.title}
        </h1>

        {/* Content with widget support */}
        <article className="prose prose-lg max-w-none rtl">
          {page.content ? (
            <MarkdownContentWithCTA content={page.content} />
          ) : (
            <p className="text-muted-foreground">אין תוכן לעמוד זה.</p>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default StaticPage;
