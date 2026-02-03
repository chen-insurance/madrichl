import { Link } from "react-router-dom";
import ArticleCard from "./ArticleCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  published_at: string;
}

interface LatestArticlesProps {
  articles?: Article[];
}

const LatestArticles = ({ articles }: LatestArticlesProps) => {
  // Demo data
  const demoArticles: Article[] = [
    {
      id: "1",
      title: "השוואת ביטוחי סיעוד: המדריך המלא ל-2025",
      excerpt: "כל מה שצריך לדעת לפני שבוחרים ביטוח סיעודי - השוואה בין כל חברות הביטוח הגדולות",
      slug: "nursing-insurance-comparison-2025",
      featured_image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "2",
      title: "הפנסיה שלכם בסכנה? בדקו את אלה הדברים עכשיו",
      excerpt: "רשות שוק ההון מזהירה: אלפי ישראלים מפסידים כסף בגלל ניהול לקוי של קרנות הפנסיה",
      slug: "pension-risks-check",
      featured_image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "3",
      title: "מהפכת הבינה המלאכותית בתביעות ביטוח",
      excerpt: "חברות הביטוח משקיעות מיליארדים בטכנולוגיות AI לזיהוי הונאות ועיבוד תביעות",
      slug: "ai-insurance-claims-revolution",
      featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "4",
      title: "ביטוח רכב 2025: עליות מחירים צפויות",
      excerpt: "הערכות בשוק מצביעות על עלייה של עד 15% בפרמיות ביטוח הרכב בשנה הקרובה",
      slug: "car-insurance-2025-prices",
      featured_image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: "5",
      title: "קרנות ההשתלמות: השקעה חכמה או מלכודת?",
      excerpt: "סקירה מקיפה של ביצועי קרנות ההשתלמות ומה כדאי לבדוק לפני שמצטרפים",
      slug: "training-funds-review",
      featured_image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: "6",
      title: "ביטוח דירה: הטעויות הנפוצות שעולות לכם ביוקר",
      excerpt: "מומחי ביטוח חושפים את השגיאות שגורמות לדחיית תביעות ביטוח דירה",
      slug: "home-insurance-mistakes",
      featured_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  const displayArticles = articles || demoArticles;

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              כתבות אחרונות
            </h2>
            <p className="text-muted-foreground">
              העדכונים החמים ביותר מעולם הביטוח והפנסיה
            </p>
          </div>
          <Link to="/blog">
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              <span>כל הכתבות</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map((article, index) => (
            <div
              key={article.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ArticleCard {...article} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/blog">
            <Button variant="outline" className="w-full">
              כל הכתבות
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
