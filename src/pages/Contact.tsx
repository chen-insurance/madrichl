import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { Phone, Mail, MapPin, Clock, Users, Star } from "lucide-react";

const GlobalLeadForm = lazy(() => import("@/components/GlobalLeadForm"));

const Contact = () => {
  

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>צור קשר | המדריך לצרכן</title>
        <meta
          name="description"
          content="צרו קשר עם המדריך לצרכן - מגזין הביטוח והפיננסים המוביל בישראל. נשמח לעזור לכם בכל שאלה."
        />
        <link rel="canonical" href="https://the-guide.co.il/contact" />
        <meta property="og:title" content="צור קשר | המדריך לצרכן" />
        <meta property="og:description" content="צרו קשר עם המדריך לצרכן - מגזין הביטוח והפיננסים המוביל בישראל." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-guide.co.il/contact" />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/hero-insurance.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="צור קשר | המדריך לצרכן" />
        <meta name="twitter:description" content="צרו קשר עם המדריך לצרכן - מגזין הביטוח והפיננסים המוביל בישראל." />
        <meta name="twitter:image" content="https://the-guide.co.il/hero-insurance.webp" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "המדריך לצרכן",
            url: "https://the-guide.co.il",
            logo: "https://the-guide.co.il/logo.png",
            description: "מגזין ביטוח ופיננסים מוביל בישראל",
            email: "info@the-guide.co.il",
            telephone: "*2580",
            address: {
              "@type": "PostalAddress",
              addressLocality: "תל אביב",
              addressCountry: "IL",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "*2580",
              email: "info@the-guide.co.il",
              contactType: "customer service",
              availableLanguage: "Hebrew",
              hoursAvailable: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
                  opens: "09:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Friday"],
                  opens: "09:00",
                  closes: "13:00",
                },
              ],
            },
          })}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                בדיקת ביטוח חינם — תוך שעה
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                השאירו פרטים ומומחה ביטוח יחזור אליכם בהקדם עם השוואת מחירים מותאמת אישית
              </p>
              {/* Social proof strip */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-accent" />
                  <span>+2,500 לקוחות מרוצים</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-accent" />
                  <span>דירוג 4.9 מ-5</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>חזרה תוך שעה בימי עסקים</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h2 className="font-display font-bold text-xl text-foreground mb-6">
                    פרטי התקשרות
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">טלפון</p>
                        <a
                          href="tel:*2580"
                          className="font-medium text-foreground hover:text-accent transition-colors"
                          dir="ltr"
                        >
                          *2580
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">אימייל</p>
                        <a
                          href="mailto:info@the-guide.co.il"
                          className="font-medium text-foreground hover:text-accent transition-colors"
                        >
                          info@the-guide.co.il
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">כתובת</p>
                        <p className="font-medium text-foreground">
                          תל אביב, ישראל
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-navy rounded-xl p-6 text-cream">
                  <h3 className="font-display font-bold text-lg mb-2">
                    שעות פעילות
                  </h3>
                  <p className="text-cream/70 text-sm mb-4">
                    אנחנו זמינים עבורכם:
                  </p>
                  <ul className="space-y-2 text-sm mb-5">
                    <li className="flex justify-between">
                      <span className="text-cream/70">ימים א׳-ה׳</span>
                      <span>09:00 - 18:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-cream/70">יום ו׳</span>
                      <span>09:00 - 13:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-cream/70">שבת</span>
                      <span>סגור</span>
                    </li>
                  </ul>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-accent text-sm font-semibold mb-1">⚡ זמן תגובה ממוצע</p>
                    <p className="text-cream/80 text-sm">פחות משעה בימי עסקים</p>
                  </div>
                </div>

                {/* Why us */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-3">
                  <h3 className="font-display font-bold text-base text-foreground">למה לבחור בנו?</h3>
                  {[
                    "השוואה בין עשרות חברות ביטוח",
                    "ייעוץ אובייקטיבי ללא עמלה מהלקוח",
                    "חיסכון ממוצע של 30% על הפוליסה הקיימת",
                    "מעל 10 שנות ניסיון בשוק הביטוח",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <span className="text-accent font-bold mt-0.5">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Form */}
              <div>
                <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
                  <GlobalLeadForm
                    title="קבלו הצעת מחיר מותאמת אישית"
                    subtitle="ממלאים פרטים → מומחה מחזיר שיחה → חוסכים כסף"
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
