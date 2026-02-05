 import { ArrowLeft } from "lucide-react";
import { Library } from "lucide-react";
 import { Link } from "react-router-dom";
 import OptimizedImage from "@/components/common/OptimizedImage";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
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
   // Fetch featured article from database (marked as is_featured or most recent)
   const { data: dynamicFeatured } = useQuery({
     queryKey: ["featured-article"],
     queryFn: async () => {
       // First try to get an article marked as featured
       const { data: featured, error: featuredError } = await supabase
         .from("articles")
         .select("id, title, excerpt, slug, featured_image, published_at")
         .eq("is_published", true)
         .eq("is_featured", true)
         .lte("published_at", new Date().toISOString())
         .order("published_at", { ascending: false })
         .limit(1)
         .maybeSingle();
 
       if (!featuredError && featured) {
         return featured;
       }
 
       // Fallback: get the most recent article
       const { data: recent, error: recentError } = await supabase
         .from("articles")
         .select("id, title, excerpt, slug, featured_image, published_at")
         .eq("is_published", true)
         .lte("published_at", new Date().toISOString())
         .order("published_at", { ascending: false })
         .limit(1)
         .maybeSingle();
 
       if (recentError) throw recentError;
       return recent;
     },
     enabled: !featuredArticle, // Only fetch if not provided via props
   });
 
   // Use provided featured article or fetched one
   const mainArticle = featuredArticle || dynamicFeatured || {
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
       title: "מדריך השוואת ביטוחי בריאות: כל מה שצריך לדעת",
       excerpt: "השוואה מקיפה בין פוליסות ביטוח הבריאות המובילות",
       slug: "health-insurance-comparison",
       featured_image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
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
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-card shadow-medium hover:shadow-strong transition-all duration-300 h-full flex flex-col"
           >
            <div className="flex-1 overflow-hidden relative min-h-[300px]">
               <OptimizedImage
                 src={mainArticle.featured_image}
                 alt={mainArticle.title}
                 aspectRatio="video"
                 priority={true}
                className="group-hover:scale-105 transition-transform duration-500 !h-full object-cover"
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
 
           {/* Secondary Articles */}
          <div className="flex flex-col gap-4 h-full">
             {secondary.map((article, index) => (
               <Link
                 key={article.id}
                 to={`/news/${article.slug}`}
                className="group flex gap-4 bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in flex-1"
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
              
              {/* Explore All Card */}
              <Link
                to="/blog"
                className="group relative flex flex-col justify-center bg-primary rounded-xl p-5 shadow-soft hover:bg-primary/90 transition-all duration-300 overflow-hidden flex-1"
              >
                {/* Background Icon */}
                <Library className="absolute -left-4 -bottom-4 w-24 h-24 text-primary-foreground/10" />
                
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-primary-foreground text-base leading-snug mb-2">
                    לא מצאתם מה שחיפשתם?
                  </h3>
                  <p className="text-primary-foreground/80 text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    <span>למעבר למגזין המלא ולכל המדריכים</span>
                    <ArrowLeft className="w-4 h-4" />
                  </p>
                </div>
              </Link>
           </div>
         </div>
       </div>
     </section>
   );
 };
 
 export default HeroSection;
