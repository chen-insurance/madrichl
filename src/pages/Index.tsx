import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LatestArticles from "@/components/home/LatestArticles";
import CategorySection from "@/components/home/CategorySection";
import MarketTicker from "@/components/home/MarketTicker";
import ComparisonTable from "@/components/market/ComparisonTable";
import { useHeadScripts } from "@/hooks/useHeadScripts";

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
      </Helmet>

      <MarketTicker />
      <Header />
      <main className="flex-1">
        <HeroSection
          featuredArticle={heroArticle || undefined}
          secondaryArticles={secondaryArticles || undefined}
        />
        <ComparisonTable />
        <CategorySection />
        <LatestArticles articles={latestArticles || undefined} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
