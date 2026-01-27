import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LatestArticles from "@/components/home/LatestArticles";
import CategorySection from "@/components/home/CategorySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import MarketTicker from "@/components/home/MarketTicker";
import ComparisonTable from "@/components/market/ComparisonTable";
import { useHeadScripts } from "@/hooks/useHeadScripts";

const Index = () => {
  // Inject dynamic head scripts from site settings
  useHeadScripts();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>המדריך לצרכן | מגזין ביטוח ופיננסים</title>
        <meta
          name="description"
          content="המדריך לצרכן - המקור המהימן שלך למידע על ביטוח ופיננסים בישראל. מדריכים, חדשות וניתוחים לטובת הצרכן."
        />
        <link rel="canonical" href="https://the-guide.co.il" />
      </Helmet>

      <MarketTicker />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ComparisonTable />
        <CategorySection />
        <LatestArticles />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
