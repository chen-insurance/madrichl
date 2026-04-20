import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreadcrumbSchema from "@/components/article/BreadcrumbSchema";
import ArticleCard from "@/components/home/ArticleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronLeft, Search, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

interface CategorySeoContent {
  intro: string;
  faq: { q: string; a: string }[];
}

const CATEGORY_SEO: Record<string, CategorySeoContent> = {
  "health-insurance": {
    intro: "ביטוח בריאות פרטי הוא אחד ההחלטות הפיננסיות החשובות ביותר שתקבלו. המדריכים שלנו יעזרו לכם להבין את ההבדל בין ביטוח מושלם למקיף, מה כוסה על ידי קופת החולים ומה לא, וכיצד לבחור פוליסה שמתאימה לצרכים שלכם.",
    faq: [
      { q: "מה ההבדל בין ביטוח בריאות מושלם למקיף?", a: "ביטוח מושלם מכסה ניתוחים בלבד ועולה כ-50-120 ₪ לחודש. ביטוח מקיף מוסיף כיסוי לתרופות שאינן בסל, מחלות קשות ושירותי בריאות נוספים — ועולה כ-100-300 ₪ לחודש. רוב המומחים ממליצים על מקיף אם אפשרי." },
      { q: "האם כדאי לקנות ביטוח בריאות פרטי בנוסף לקופת החולים?", a: "כן ברוב המקרים. קופת החולים מכסה את הבסיס אך לא ניתוחים פרטיים, תרופות יקרות מחוץ לסל, ורופאי מומחה לבחירתכם. ביטוח פרטי ממלא את הפער הזה." },
      { q: "מתי כדאי לרכוש ביטוח בריאות?", a: "ככל שצעירים יותר — הפרמיה זולה יותר. מומלץ לרכוש לפני גיל 40 כדי לנעול מחיר נמוך. רכישה אחרי אירוע בריאותי תביא לחריגות בפוליסה." },
      { q: "האם אפשר לשנות ביטוח בריאות?", a: "כן. ניתן לעבור מחברה לחברה בכל עת, אך מחלות קיימות עלולות להיחרג בפוליסה החדשה. מומלץ להשוות לפני מעבר ולוודא רצף ביטוחי." },
    ],
  },
  "life-insurance": {
    intro: "ביטוח חיים מגן על המשפחה שלכם במקרה של פטירה מוקדמת. בישראל, ביטוח חיים משמש גם כביטוח משכנתא חובה מהבנק — אבל האם אתם משלמים יותר מדי? המדריכים שלנו ינחו אתכם להבין את הכיסויים, להשוות מחירים ולחסוך.",
    faq: [
      { q: "כמה ביטוח חיים אני צריך?", a: "הכלל המקובל: כיסוי שווה ל-5-10 שנות הכנסה. אם יש לכם משכנתא — הביטוח חייב לכסות לפחות את יתרת ההלוואה. עם ילדים קטנים, מומלץ על 7-10 שנות הכנסה." },
      { q: "מה ההבדל בין ביטוח חיים ריסק לביטוח חיים עם חיסכון?", a: "ריסק משלם רק במוות — זול ויעיל. ביטוח עם חיסכון (קרן או תיק) משלב ביטוח עם השקעה — יקר יותר ולא תמיד משתלם. רוב המומחים ממליצים להפריד בין ביטוח לחיסכון." },
      { q: "האם הבנק חייב לקבל כל ביטוח חיים?", a: "לא. הבנק חייב לקבל כל פוליסה שעומדת בדרישות המינימום שלו. בישראל, תוכלו לרכוש ביטוח חיים זול יותר מחברה חיצונית ולהמציא אותו לבנק — ולחסוך 20-40%." },
      { q: "כמה עולה ביטוח חיים למשכנתא?", a: "עבור משכנתא של 1 מיליון ₪ לגיל 35 לא מעשן: כ-120-180 ₪ לחודש. לגיל 45: כ-200-320 ₪. מחיר הבנק לרוב יקר ב-30% ממחיר השוק." },
    ],
  },
  "car-insurance": {
    intro: "ביטוח רכב בישראל כולל ביטוח חובה (חוקי) וביטוח מקיף (רשות). המחיר תלוי בגיל הנהג, שנות הוותק, סוג הרכב ועוד. המדריכים שלנו יעזרו לכם להבין מה כיסוי חיוני ולחסוך על הפרמיה.",
    faq: [
      { q: "מה ההבדל בין ביטוח חובה לביטוח מקיף?", a: "חובה מכסה נזקי גוף בלבד (פציעות) — חובה לפי חוק ועולה כ-2,000-3,500 ₪ לשנה. מקיף מכסה גם נזקי רכוש לרכב שלכם ולאחרים — אופציונלי ועולה 2,000-8,000 ₪ לשנה." },
      { q: "האם ביטוח מקיף שווה את המחיר?", a: "תלוי בגיל הרכב ובערכו. רכב עד גיל 7 שנים ששווה מעל 30,000 ₪ — כן. רכב ישן ששוויו נמוך מ-30,000 ₪ — ייתכן שלא משתלם. חשבו: האם יש לכם כרית ביטחון לקנות רכב חדש אם זה ייהרס?" },
      { q: "כיצד ניתן להוזיל ביטוח רכב?", a: "הגדלת השתתפות עצמית, הוספת נהג בעל ותק רב כנהג ראשי, ביטוח עם קילומטראז' מוגבל, חבילה עם ביטוח דירה, והשוואת מחירים בין חברות — כל אחד מהם יכול להוזיל ב-10-20%." },
      { q: "מה קורה אם נהגתי עם ביטוח פג תוקף?", a: "מדובר בעבירה פלילית. בנוסף, אתם חשופים לתביעות אישיות כבדות במקרה תאונה. חשוב לעדכן ביטוח לפני פקיעת התוקף." },
    ],
  },
  "property-insurance": {
    intro: "ביטוח דירה מגן על הנכס הגדול ביותר ברשותכם. בישראל, ביטוח מבנה הוא חובה למשכנתא, וביטוח תכולה מומלץ לכל דייר ובעלים. המדריכים שלנו יסבירו מה כדאי לכסות ואיך לא לשלם יותר מדי.",
    faq: [
      { q: "מה ההבדל בין ביטוח מבנה לביטוח תכולה?", a: "מבנה מכסה את המבנה הפיזי של הדירה — קירות, תשתיות, כלים סניטריים. תכולה מכסה את הריהוט והחפצים בפנים. שניהם חשובים — מבנה מוכרח למשכנתא, תכולה מומלץ לכולם." },
      { q: "כמה עולה ביטוח דירה?", a: "ביטוח מבנה ל-100 מ\"ר: כ-100-200 ₪ לחודש. הוספת תכולה: עוד 30-80 ₪ לחודש. צד שלישי (אחריות כלפי שכנים): עוד 20-40 ₪. חבילה כוללת: כ-150-320 ₪ לחודש." },
      { q: "מה זה ביטוח צד שלישי בדירה?", a: "כיסוי לנזקים שגרמתם לצדדים שלישיים — שכנים, אורחים וכו'. לדוגמה: צינור פרץ אצלכם והציף את הדירה מתחת. ביטוח צד שלישי מכסה את הנזק לשכן — חיוני!" },
      { q: "האם שוכרי דירה צריכים ביטוח?", a: "כן! שוכרים לא צריכים ביטוח מבנה (של הבעלים) אבל כן צריכים ביטוח תכולה וצד שלישי. ביטוח לשוכרים עולה כ-50-100 ₪ לחודש." },
    ],
  },
  "pension": {
    intro: "פנסיה, קרנות השתלמות וקופות גמל הן כלי החיסכון החשובים ביותר לישראלים. ההחלטות שתקבלו עכשיו — מסלול השקעה, בחירת קרן, ניצול הטבות מס — יקבעו את גובה הפנסיה שתקבלו. המדריכים שלנו יסייעו לכם לייעל את הכסף שלכם.",
    faq: [
      { q: "מה ההבדל בין קרן פנסיה לקופת גמל?", a: "קרן פנסיה משלבת חיסכון + ביטוח אובדן כושר עבודה + ביטוח שאירים. קופת גמל היא חיסכון טהור לגיל 60, ניתנת להשקעה גמישה יותר. שכירים לרוב מפקידים לפנסיה; עצמאים יכולים לבחור בין השניים." },
      { q: "איך בוחרים מסלול השקעה בפנסיה?", a: "כלל האצבע: עד גיל 50 — מסלול מנייתי (תשואה גבוהה, תנודתי); גיל 50-60 — מסלול מאוזן; מעל 60 — מסלול סולידי. בדקו את תשואות הקרן ב-3 ו-5 שנים אחרונות." },
      { q: "מה זה קרן השתלמות ולמה היא כדאית?", a: "קרן השתלמות היא חיסכון נזיל (לאחר 6 שנים) עם הטבת מס משמעותית — פטור מלא ממס רווחי הון. עצמאים יכולים לנכות את ההפקדה מהכנסה. זה כלי החיסכון האטרקטיבי ביותר בישראל." },
      { q: "איך אדע אם הפנסיה שלי מספיקה?", a: "ה'כלל' הוא לחסוך 10-15% מהכנסה לפנסיה. בדקו באתר 'הר הכסף' מה כבר צברתם, ובאיזה קצב הצבירה צומחת. מומלץ לבדוק עם יועץ פנסיוני אחת לכמה שנים." },
    ],
  },
  "employer-insurance": {
    intro: "ביטוח אחריות מקצועית מגן על עצמאים ועסקים מפני תביעות בגין רשלנות מקצועית. מטפלים, רופאים, עורכי דין, יועצים ועסקים — כולם זקוקים לכיסוי מתאים. בנוסף, עצמאים בישראל צריכים ביטוחי א.כ.ע, בריאות, פנסיה וקרן השתלמות — המדריכים שלנו יסבירו הכל.",
    faq: [
      { q: "מי צריך ביטוח אחריות מקצועית?", a: "כל מי שנותן שירות מקצועי: מטפלים, פסיכולוגים, עורכי דין, רואי חשבון, מהנדסים, יועצים, מאמנים, ספאים, מספרות ועוד. אם לקוח יכול לתבוע אתכם על טעות — אתם צריכים ביטוח." },
      { q: "מה ההבדל בין Claims Made ל-Occurrence?", a: "Claims Made מכסה תביעות שהוגשו בתקופת הפוליסה — חייבים חידוש מתמיד. Occurrence מכסה אירועים שקרו בתקופת הפוליסה — גם אם הגישו תביעה אחרי. מרבית הביטוחים בישראל הם Claims Made." },
      { q: "כמה עולה ביטוח אחריות מקצועית?", a: "מטפל/פסיכולוג עם פרקטיקה קטנה: 800-2,500 ₪ לשנה. רופא: 2,000-15,000 ₪. עורך דין: 1,500-10,000 ₪. המחיר תלוי בהיקף הכיסוי, ניסיון מקצועי ורמת הסיכון." },
      { q: "האם ביטוח אחריות מקצועית מכסה גם עבודה בזום?", a: "רוב הפוליסות כן מכסות טיפול מרחוק, אך יש לוודא זאת במפורש בפוליסה. חשוב לציין בפוליסה אם אתם מטפלים גם בחו\"ל (לקוחות מחוץ לישראל) כי זה עלול לשנות את הכיסוי." },
      { q: "אילו ביטוחים עצמאים חייבים לרכוש בישראל?", a: "ביטוח לאומי (חובה), ביטוח רכב חובה, ופנסיה לאחר שנה. מומלץ בנוסף: ביטוח א.כ.ע פרטי (הפנסיה לא מספיקה), ביטוח בריאות, אחריות מקצועית וקרן השתלמות לחיסכון והטבת מס." },
    ],
  },
};

const CategoryFAQ = ({ slug }: { slug: string }) => {
  const content = CATEGORY_SEO[slug];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!content) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="bg-secondary/30 rounded-2xl p-6 md:p-8 mb-10">
        <p className="text-base text-foreground leading-relaxed">{content.intro}</p>
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-6">שאלות נפוצות</h2>
      <div className="space-y-3">
        {content.faq.map((item, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-right font-semibold text-foreground hover:bg-secondary/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ARTICLES_PER_PAGE = 12;

interface CategoryArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: string | null;
  is_published?: boolean;
}

// Map direct paths to category slugs
const PATH_TO_SLUG_MAP: Record<string, string> = {
  "/health-insurance": "health-insurance",
  "/life-insurance": "life-insurance",
  "/car-insurance": "car-insurance",
  "/property-insurance": "property-insurance",
  "/pension": "pension",
  "/employer-insurance": "employer-insurance",
};

const CategoryArchive = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine the category slug - either from URL param or from direct path mapping
  const slug = paramSlug || PATH_TO_SLUG_MAP[location.pathname];

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch all articles for this category (we'll filter client-side for search)
  const { data: allArticles, isLoading: articlesLoading, isError: articlesError } = useQuery({
    queryKey: ["category-all-articles", category?.id],
    queryFn: async (): Promise<CategoryArticle[]> => {
      // First try to get articles via the junction table
      const { data: junctionArticles, error: junctionError } = await supabase
        .from("article_categories")
        .select(`
          article_id,
          articles!inner (
            id, title, slug, excerpt, featured_image, published_at, category, is_published
          )
        `)
        .eq("category_id", category?.id);

      if (!junctionError && junctionArticles && junctionArticles.length > 0) {
        return (junctionArticles
          .map((item) => item.articles) as CategoryArticle[])
          .filter((article) =>
            article.is_published &&
            new Date(article.published_at ?? 0) <= new Date()
          )
          .sort((a, b) =>
            new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
          );
      }

      // Fallback: query by legacy category name field
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image, published_at, category")
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .eq("category", category?.name)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CategoryArticle[];
    },
    enabled: !!category?.id,
  });

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!allArticles) return [];
    if (!searchQuery.trim()) return allArticles;

    const query = searchQuery.toLowerCase();
    return allArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query))
    );
  }, [allArticles, searchQuery]);

  // Paginate filtered results
  const paginatedArticles = useMemo(() => {
    const from = (currentPage - 1) * ARTICLES_PER_PAGE;
    const to = from + ARTICLES_PER_PAGE;
    return filteredArticles.slice(from, to);
  }, [filteredArticles, currentPage]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            קטגוריה לא נמצאה
          </h1>
          <p className="text-muted-foreground mb-8">
            הקטגוריה שחיפשת אינה קיימת במערכת.
          </p>
          <Link to="/">
            <Button>חזרה לדף הבית</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{category.name} | המדריך לצרכן</title>
        <meta
          name="description"
          content={category.description || `כל המאמרים בקטגוריית ${category.name} - המדריך לצרכן`}
        />
        <link rel="canonical" href={`https://the-guide.co.il/category/${slug}`} />
        <meta property="og:title" content={`${category.name} | המדריך לצרכן`} />
        <meta property="og:description" content={category.description || `כל המאמרים בקטגוריית ${category.name} - המדריך לצרכן`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://the-guide.co.il/category/${slug}`} />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/hero-insurance.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${category.name} | המדריך לצרכן`} />
        <meta name="twitter:description" content={category.description || `כל המאמרים בקטגוריית ${category.name}`} />
        <meta name="twitter:image" content="https://the-guide.co.il/hero-insurance.webp" />
        {allArticles && allArticles.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `${category.name} - המדריך לצרכן`,
              url: `https://the-guide.co.il/category/${slug}`,
              description: category.description || `כל המאמרים בקטגוריית ${category.name}`,
              inLanguage: "he",
              mainEntity: {
                "@type": "ItemList",
                itemListElement: (allArticles as any[]).slice(0, 50).map((a: any, i: number) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `https://the-guide.co.il/news/${a.slug}`,
                  name: a.title,
                })),
              },
            })}
          </script>
        )}
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "ראשי", url: "/" },
          { name: category.name, url: `/category/${slug}` },
        ]}
      />

      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Category Header with SEO Content */}
        <div className="mb-10">
          <nav className="text-sm text-muted-foreground mb-4" aria-label="ניווט ארכיון">
            <Link to="/" className="hover:text-accent transition-colors">
              דף הבית
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground" aria-current="page">{category.name}</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              {category.description}
            </p>
          )}

          {/* Search Bar */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder={`חיפוש ב${category.name}...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-12 py-5 rounded-full border-2 border-border focus:border-accent"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} מאמרים
            {searchQuery && ` עבור "${searchQuery}"`}
          </p>
        </div>

        {/* Articles Grid */}
        {articlesError ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-6">שגיאה בטעינת המאמרים. אנא נסה שוב.</p>
            <Button onClick={() => window.location.reload()}>נסה שוב</Button>
          </div>
        ) : articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : paginatedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  slug={article.slug}
                  featured_image={article.featured_image || undefined}
                  published_at={article.published_at || new Date().toISOString()}
                  category={article.category || category.name}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2" aria-label="ניווט דפים">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="עמוד קודם"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>

                {getPaginationNumbers().map((page, index) => (
                  <div key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-muted-foreground" aria-hidden="true">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page as number)}
                        aria-label={`עמוד ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="עמוד הבא"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-6">
              {searchQuery
                ? `לא נמצאו מאמרים התואמים לחיפוש "${searchQuery}"`
                : "אין עדיין מאמרים בקטגוריה זו."}
            </p>
            {searchQuery ? (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                נקה חיפוש
              </Button>
            ) : (
              <Link to="/">
                <Button>חזרה לדף הבית</Button>
              </Link>
            )}
          </div>
        )}
        {/* Category SEO Intro + FAQ */}
        <CategoryFAQ slug={slug || ""} />
      </main>

      <Footer />
    </div>
  );
};

export default CategoryArchive;
