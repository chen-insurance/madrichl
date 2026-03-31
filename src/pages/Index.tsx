import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LatestArticles from "@/components/home/LatestArticles";
import CategorySection from "@/components/home/CategorySection";


// Lazy load heavy below-fold components (ComparisonTable pulls in Dialog, LeadForm, zod, react-hook-form)
const ComparisonTable = lazy(() => import("@/components/market/ComparisonTable"));

const Index = () => {
  // Inject dynamic head scripts from site settings
  useHeadScripts();

  // Fetch homepage settings
  const { data: homepageSettings } = useQuery({
    queryKey: ["homepage-settings-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_article_id", "pinned_categories", "homepage_headline"]);

      if (error) throw error;

      const settingsMap: Record<string, string | null> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    },
  });

  // Fetch hero article if set
  const { data: heroArticle } = useQuery({
    queryKey: ["hero-article", homepageSettings?.hero_article_id],
    queryFn: async () => {
      if (!homepageSettings?.hero_article_id) return null;

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, excerpt, slug, featured_image, published_at")
        .eq("id", homepageSettings.hero_article_id)
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!homepageSettings?.hero_article_id,
  });

  // Fetch latest articles (optionally filtered by pinned categories)
  const { data: latestArticles } = useQuery({
    queryKey: ["latest-articles", homepageSettings?.pinned_categories],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, title, excerpt, slug, featured_image, published_at, category_id")
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(6);

      // If pinned categories are set, filter by them
      if (homepageSettings?.pinned_categories) {
        try {
          const pinnedIds = JSON.parse(homepageSettings.pinned_categories);
          if (Array.isArray(pinnedIds) && pinnedIds.length > 0) {
            query = query.in("category_id", pinnedIds);
          }
        } catch {
          // Invalid JSON, ignore filter
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch secondary articles for hero (excluding the main hero article)
  const { data: secondaryArticles } = useQuery({
    queryKey: ["secondary-articles", homepageSettings?.hero_article_id],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, title, excerpt, slug, featured_image, published_at")
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
       .limit(2);

      if (homepageSettings?.hero_article_id) {
        query = query.neq("id", homepageSettings.hero_article_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const headline = homepageSettings?.homepage_headline || "המדריך לצרכן | מגזין ביטוח ופיננסים";

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{headline}</title>
        <meta
          name="description"
          content="המדריך לצרכן - המקור המהימן שלך למידע על ביטוח ופיננסים בישראל. מדריכים, חדשות וניתוחים לטובת הצרכן."
        />
        <link rel="canonical" href="https://the-guide.co.il" />
        <meta property="og:title" content={headline} />
        <meta property="og:description" content="המדריך לצרכן - המקור המהימן שלך למידע על ביטוח ופיננסים בישראל. מדריכים, חדשות וניתוחים לטובת הצרכן." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-guide.co.il" />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={headline} />
        <meta name="twitter:description" content="המדריך לצרכן - המקור המהימן שלך למידע על ביטוח ופיננסים בישראל." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "המדריך לצרכן",
            url: "https://the-guide.co.il",
            description: "המדריך לצרכן - המקור המהימן שלך למידע על ביטוח ופיננסים בישראל",
            inLanguage: "he",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://the-guide.co.il/blog?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "המדריך לצרכן",
            url: "https://the-guide.co.il",
            logo: "https://the-guide.co.il/logo.png",
            description: "מגזין ביטוח ופיננסים מוביל בישראל",
            sameAs: [],
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "*2580",
              contactType: "customer service",
              availableLanguage: "Hebrew",
            },
          })}
        </script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <HeroSection
          featuredArticle={heroArticle || undefined}
          secondaryArticles={secondaryArticles || undefined}
        />
        <Suspense fallback={<div className="py-10"><div className="container mx-auto"><div className="animate-pulse space-y-4"><div className="h-10 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div></div></div>}>
          <ComparisonTable />
        </Suspense>
        <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}>
          <CategorySection />
        </div>
        <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}>
          <LatestArticles articles={latestArticles || undefined} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
