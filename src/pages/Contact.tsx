import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { Phone, Mail, MapPin } from "lucide-react";

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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="צור קשר | המדריך לצרכן" />
        <meta name="twitter:description" content="צרו קשר עם המדריך לצרכן - מגזין הביטוח והפיננסים המוביל בישראל." />
      </Helmet>

      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                צור קשר
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                יש לכם שאלה? רוצים לבדוק את הביטוח שלכם? השאירו פרטים ונחזור אליכם בהקדם
              </p>
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
                  <ul className="space-y-2 text-sm">
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
                </div>
              </div>

              {/* Lead Form */}
              <div>
                <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
                  <GlobalLeadForm />
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
