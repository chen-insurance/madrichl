import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/common/OptimizedImage";

interface FeaturedArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featured_image: string;
  published_at: string;
}

interface HeroSectionProps {
  featuredArticle?: FeaturedArticle;
  secondaryArticles?: FeaturedArticle[];
}

const HeroSection = ({ featuredArticle, secondaryArticles = [] }: HeroSectionProps) => {
  // Fallback data for demo
  const mainArticle = featuredArticle || {
    id: "1",
    title: "רפורמת הביטוח 2025: כל מה שצריך לדעת על השינויים הצפויים",
    excerpt: "משרד האוצר מפרסם טיוטה חדשה לרפורמה בענף הביטוח שצפויה לשנות את פני השוק. הרפורמה כוללת שינויים מהותיים בתחום הפנסיה והביטוח הסיעודי.",
    slug: "insurance-reform-2025",
    featured_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop",
    published_at: new Date().toISOString(),
  };

  const secondary = secondaryArticles.length > 0 ? secondaryArticles : [
    {
      id: "2",
      title: "חברות הביטוח מדווחות על רווחי שיא ברבעון השלישי",
      excerpt: "רווחי חברות הביטוח עלו ב-25% בהשוואה לרבעון המקביל אשתקד",
      slug: "insurance-profits-q3",
      featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      published_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "ביטוח הסייבר: הצורך הגובר של העסקים הקטנים",
      excerpt: "עלייה של 40% בפניות לביטוח סייבר מעסקים קטנים ובינוניים",
      slug: "cyber-insurance-smb",
      featured_image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop",
      published_at: new Date().toISOString(),
    },
  ];

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Featured Article */}
          <Link
            to={`/news/${mainArticle.slug}`}
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-card shadow-medium hover:shadow-strong transition-all duration-300"
          >
            <div className="aspect-[16/10] md:aspect-[16/9] overflow-hidden relative">
              <OptimizedImage
                src={mainArticle.featured_image}
                alt={mainArticle.title}
                aspectRatio="video"
                priority={true}
                className="group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8">
              <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4">
                כתבה ראשית
              </span>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-cream leading-tight mb-3">
                {mainArticle.title}
              </h2>
              <p className="text-cream/80 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">
                {mainArticle.excerpt}
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
                <span>קרא עוד</span>
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Secondary Articles + CTA */}
          <div className="flex flex-col gap-4">
            {secondary.map((article, index) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="group flex gap-4 bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-lg">
                  <OptimizedImage
                    src={article.featured_image}
                    alt={article.title}
                    aspectRatio="square"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}

            {/* Lead Form CTA Card */}
            <div className="bg-gradient-navy rounded-xl p-5 text-cream animate-fade-in" style={{ animationDelay: "200ms" }}>
              <h3 className="font-display font-bold text-lg mb-2">בדוק את זכאותך להטבות</h3>
              <ul className="text-cream/80 text-sm mb-4 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <span>השוואת מחירים חינם</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <span>ייעוץ מקצועי ללא התחייבות</span>
                </li>
              </ul>
              <Button 
                variant="gold" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  const leadForm = document.querySelector('#lead-form-section');
                  if (leadForm) {
                    leadForm.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/contact';
                  }
                }}
              >
                בדוק זכאות עכשיו
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
