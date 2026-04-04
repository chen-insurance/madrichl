import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LeadForm from "@/components/LeadForm";
import LifeInsuranceCalc from "@/components/calculators/LifeInsuranceCalc";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>הדף לא נמצא | המדריך לצרכן</title>
        <meta name="description" content="העמוד שחיפשת אינו קיים. חזרו לדף הבית של המדריך לצרכן - מגזין ביטוח ופיננסים." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 mb-6">
              <Search className="w-12 h-12 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              אופס! העמוד לא נמצא
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-6">
              אבל אל דאגה, אנחנו עדיין יכולים לעזור לך לחסוך.
            </p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                חזרה לדף הבית
              </Button>
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Lead Form */}
            <div>
              <LeadForm
                title="בדוק את זכאותך עכשיו"
                subtitle="השאירו פרטים ומומחה יחזור אליכם ללא עלות"
                variant="card"
              />
            </div>

            {/* Calculator */}
            <div>
              <LifeInsuranceCalc />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
