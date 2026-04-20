import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreadcrumbSchema from "@/components/article/BreadcrumbSchema";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, Home, Heart, Shield } from "lucide-react";

const LifeInsuranceCalc = lazy(() => import("@/components/calculators/LifeInsuranceCalc"));
const MortgageCalculatorWidget = lazy(() => import("@/components/calculators/MortgageCalculatorWidget"));
const CarInsuranceCalc = lazy(() => import("@/components/calculators/CarInsuranceCalc"));

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "האם המחשבונים מדויקים?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "המחשבונים מבוססים על ממוצעי שוק עדכניים בישראל. המחיר הסופי נקבע לפי מצב בריאות, גורמי סיכון ותנאי הפוליסה. ההערכות מדויקות ב-80-90% לרוב הלקוחות.",
      },
    },
    {
      "@type": "Question",
      name: "כמה עולה ביטוח חיים למשכנתא?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "עבור משכנתא של 900,000 ₪ לגיל 35 לא מעשן: כ-260-320 ₪ לחודש (ביטוח חיים + מבנה). הבנק גובה בדרך כלל 30% יותר ממחיר השוק הפתוח.",
      },
    },
    {
      "@type": "Question",
      name: "מה כיסוי ביטוח חיים מומלץ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "הכלל הנפוץ: כיסוי שווה ל-5-10 שנות הכנסה. אם יש לכם משכנתא, הכיסוי חייב לכסות לפחות את יתרת ההלוואה. עם ילדים קטנים — מומלץ על 7-10 שנות הכנסה.",
      },
    },
  ],
};

const CalcCard = ({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Calculator;
  title: string;
  description: string;
  color: string;
}) => (
  <div className={`flex items-start gap-3 p-4 rounded-xl ${color}`}>
    <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

const Calculators = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>מחשבוני ביטוח חינמיים | המדריך לצרכן</title>
        <meta
          name="description"
          content="מחשבוני ביטוח חינמיים: מחשבון ביטוח חיים, מחשבון ביטוח משכנתא ועוד. חשב את עלות הביטוח שלך בשניות וגלה כמה אתה יכול לחסוך."
        />
        <link rel="canonical" href="https://the-guide.co.il/calculators" />
        <meta property="og:title" content="מחשבוני ביטוח חינמיים | המדריך לצרכן" />
        <meta property="og:description" content="מחשבוני ביטוח חינמיים: מחשבון ביטוח חיים, מחשבון ביטוח משכנתא ועוד." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-guide.co.il/calculators" />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/hero-insurance.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "ראשי", url: "/" },
          { name: "מחשבוני ביטוח", url: "/calculators" },
        ]}
      />

      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <nav className="text-sm text-muted-foreground mb-4" aria-label="ניווט">
            <Link to="/" className="hover:text-accent transition-colors">דף הבית</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">מחשבוני ביטוח</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            מחשבוני ביטוח חינמיים
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            חשבו את עלות הביטוח שלכם בשניות, הבינו כמה אתם משלמים ביחס לשוק, וגלו כמה ניתן לחסוך.
          </p>

          {/* Quick nav */}
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="#life-calc" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              <Shield className="w-4 h-4" /> ביטוח חיים
            </a>
            <span className="text-muted-foreground">·</span>
            <a href="#mortgage-calc" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              <Home className="w-4 h-4" /> משכנתא
            </a>
            <span className="text-muted-foreground">·</span>
            <a href="#car-calc" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              <Heart className="w-4 h-4" /> ביטוח רכב
            </a>
          </div>
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <CalcCard
            icon={Calculator}
            title="מחירים ריאליים"
            description="מבוססים על ממוצעי שוק עדכניים 2026"
            color="bg-secondary/50"
          />
          <CalcCard
            icon={Heart}
            title="חינמי לחלוטין"
            description="ללא הרשמה, ללא מחויבות"
            color="bg-secondary/50"
          />
          <CalcCard
            icon={Shield}
            title="בדיקת מחיר אישית"
            description="השוו מול מחיר הבנק וחסכו"
            color="bg-secondary/50"
          />
        </div>

        {/* Calculators */}
        <div className="space-y-16">
          {/* Life Insurance Calculator */}
          <section id="life-calc">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                מחשבון ביטוח חיים
              </h2>
              <p className="text-muted-foreground">
                חשב את עלות ביטוח החיים לפי גיל, מין, עישון וסכום כיסוי — בדיוק לפי תעריפי השוק הישראלי.
              </p>
            </div>
            <div className="max-w-xl">
              <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
                <LifeInsuranceCalc />
              </Suspense>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              רוצים ללמוד עוד?{" "}
              <Link to="/news/life-insurance-mortgage-guide-2026" className="text-accent hover:underline">
                קראו את המדריך המלא לביטוח חיים ומשכנתא
              </Link>
            </p>
          </section>

          {/* Mortgage Insurance Calculator */}
          <section id="mortgage-calc">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                מחשבון ביטוח משכנתא
              </h2>
              <p className="text-muted-foreground">
                גלו כמה תשלמו על ביטוח משכנתא (חיים + מבנה) וכמה הבנק גובה ביחס לשוק הפתוח.
              </p>
            </div>
            <div className="max-w-xl">
              <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
                <MortgageCalculatorWidget />
              </Suspense>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              רוצים ללמוד עוד?{" "}
              <Link to="/news/mortgage-home-insurance-guide-2026" className="text-accent hover:underline">
                קראו את המדריך לביטוח משכנתא ודירה
              </Link>
            </p>
          </section>

          {/* Car Insurance Calculator */}
          <section id="car-calc">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                מחשבון ביטוח רכב
              </h2>
              <p className="text-muted-foreground">
                חשב את עלות ביטוח הרכב לפי גיל הנהג, שנות ותק, שנת הרכב ושוויו — וגלה כמה אפשר לחסוך.
              </p>
            </div>
            <div className="max-w-xl">
              <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
                <CarInsuranceCalc />
              </Suspense>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              רוצים ללמוד עוד?{" "}
              <Link to="/news/car-insurance-price-guide-2026" className="text-accent hover:underline">
                קראו את מדריך מחירי ביטוח רכב 2026
              </Link>
            </p>
          </section>
        </div>

        {/* FAQ */}
        <div className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">שאלות נפוצות</h2>
          <div className="space-y-4 max-w-2xl">
            {faqSchema.mainEntity.map((item, i) => (
              <div key={i} className="bg-secondary/30 rounded-xl p-5">
                <p className="font-semibold text-foreground mb-2">{item.name}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related links */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">מדריכי ביטוח קשורים</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "ביטוח חיים ומשכנתא", slug: "life-insurance-mortgage-guide-2026" },
              { label: "מדריך ביטוח דירה 2026", slug: "home-insurance-guide-2026" },
              { label: "ביטוח בריאות פרטי", slug: "not-mushlam" },
              { label: "מדריך פנסיה מקיף", slug: "pension-complete-guide-israel-2026" },
            ].map((link) => (
              <Link
                key={link.slug}
                to={`/news/${link.slug}`}
                className="px-4 py-2 text-sm bg-secondary rounded-full text-foreground hover:bg-accent/20 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Calculators;
