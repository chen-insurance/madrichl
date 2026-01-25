import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LatestArticles from "@/components/home/LatestArticles";
import CategorySection from "@/components/home/CategorySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useHeadScripts } from "@/hooks/useHeadScripts";

const Index = () => {
  // Inject dynamic head scripts from site settings
  useHeadScripts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <LatestArticles />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
