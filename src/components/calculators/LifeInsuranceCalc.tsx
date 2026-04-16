import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, AlertTriangle, Loader2 } from "lucide-react";
import LeadForm from "@/components/LeadForm";

interface InsuranceRate {
  age: number;
  price_per_100k_male_smoker: number;
  price_per_100k_male_nonsmoker: number;
  price_per_100k_female_smoker: number;
  price_per_100k_female_nonsmoker: number;
}

// Age restriction constants
const MIN_AGE = 18;
const MAX_AGE = 67;
const WARNING_AGE_START = 55;

const LifeInsuranceCalc = () => {
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isSmoker, setIsSmoker] = useState(false);
  const [coverage, setCoverage] = useState(1000000);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Determine if age is in warning zone (55-60)
  const isWarningAge = age >= WARNING_AGE_START && age <= 60;

  // Calculate birth year from age for lead form
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;

  const { data: rates, isLoading } = useQuery({
    queryKey: ["life-insurance-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_insurance_rates")
        .select("*")
        .order("age", { ascending: true });
      if (error) throw error;
      return data as InsuranceRate[];
    },
  });

  const getRate = (targetAge: number, targetGender: "male" | "female", smoker: boolean): number => {
    if (!rates || rates.length === 0) return 0;
    
    // Find exact match or closest age
    const rate = rates.find(r => r.age === targetAge) || 
                 rates.reduce((prev, curr) => 
                   Math.abs(curr.age - targetAge) < Math.abs(prev.age - targetAge) ? curr : prev
                 );
    
    if (!rate) return 0;

    if (targetGender === "male") {
      return smoker ? rate.price_per_100k_male_smoker : rate.price_per_100k_male_nonsmoker;
    } else {
      return smoker ? rate.price_per_100k_female_smoker : rate.price_per_100k_female_nonsmoker;
    }
  };

  const monthlyPrice = useMemo(() => {
    const pricePerUnit = getRate(age, gender, isSmoker);
    return (pricePerUnit * coverage) / 100000;
  }, [age, gender, isSmoker, coverage, rates]);

  const smokerSavings = useMemo(() => {
    if (!isSmoker) return 0;
    const smokerPrice = getRate(age, gender, true);
    const nonSmokerPrice = getRate(age, gender, false);
    const monthlyDiff = ((smokerPrice - nonSmokerPrice) * coverage) / 100000;
    return monthlyDiff * 12;
  }, [age, gender, isSmoker, coverage, rates]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("he-IL").format(value);
  };

  const handleGetQuote = () => {
    setShowLeadForm(true);
  };

  const leadFormContext = `מחשבון ביטוח חיים: גיל ${age}, ${gender === "male" ? "גבר" : "אישה"}, ${isSmoker ? "מעשן/ת" : "לא מעשן/ת"}, כיסוי ${formatNumber(coverage)} ₪, מחיר משוער ${formatCurrency(monthlyPrice)}/חודש`;

  // Build extra data including the high-risk tag for warning ages
  const extraData = {
    calculator_type: "life_insurance",
    birth_year: birthYear,
    age,
    gender,
    is_smoker: isSmoker,
    coverage,
    estimated_monthly_price: monthlyPrice,
    ...(isWarningAge && { lead_risk_tag: "high_risk_hard_to_convert" }),
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Helmet>
        <title>מחשבון ביטוח חיים | המדריך לצרכן</title>
        <meta
          name="description"
          content="חשב את עלות ביטוח החיים שלך בקלות. הזן גיל, מין וסכום כיסוי וקבל הערכת מחיר חודשי מיידית. כלי חינמי לתכנון פיננסי."
        />
        <link rel="canonical" href="https://the-guide.co.il/Life_Insurance_Calc" />
        {/* Open Graph */}
        <meta property="og:title" content="מחשבון ביטוח חיים | המדריך לצרכן" />
        <meta property="og:description" content="חשב את עלות ביטוח החיים שלך בקלות. הזן גיל, מין וסכום כיסוי וקבל הערכת מחיר חודשי מיידית." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-guide.co.il/Life_Insurance_Calc" />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/hero-insurance.webp" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="מחשבון ביטוח חיים | המדריך לצרכן" />
        <meta name="twitter:description" content="חשב את עלות ביטוח החיים שלך בקלות. הזן גיל, מין וסכום כיסוי וקבל הערכת מחיר חודשי מיידית." />
        <meta name="twitter:image" content="https://the-guide.co.il/hero-insurance.webp" />
      </Helmet>
      <Card className="w-full max-w-xl mx-auto border-accent/20 shadow-lg">
        <CardHeader className="bg-gradient-navy text-cream rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-accent" />
            </div>
            <CardTitle className="font-display text-xl text-white">מחשבון ביטוח חיים</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Age Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">גיל</Label>
              <span className="text-lg font-semibold text-accent">{age}</span>
            </div>
            <Slider
              value={[age]}
              onValueChange={([v]) => setAge(v)}
              min={MIN_AGE}
              max={MAX_AGE}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{MIN_AGE}</span>
              <span>{MAX_AGE}</span>
            </div>
          </div>

          {/* Gender Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">מין</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={gender === "male" ? "default" : "outline"}
                onClick={() => setGender("male")}
                className={gender === "male" ? "bg-accent hover:bg-accent/90" : ""}
              >
                גבר
              </Button>
              <Button
                type="button"
                variant={gender === "female" ? "default" : "outline"}
                onClick={() => setGender("female")}
                className={gender === "female" ? "bg-accent hover:bg-accent/90" : ""}
              >
                אישה
              </Button>
            </div>
          </div>

          {/* Smoker Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">מעשן/ת?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={!isSmoker ? "default" : "outline"}
                onClick={() => setIsSmoker(false)}
                className={!isSmoker ? "bg-accent hover:bg-accent/90" : ""}
              >
                לא
              </Button>
              <Button
                type="button"
                variant={isSmoker ? "default" : "outline"}
                onClick={() => setIsSmoker(true)}
                className={isSmoker ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                כן
              </Button>
            </div>
          </div>

          {/* Coverage Slider + Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">סכום כיסוי</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={coverage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 500000;
                    setCoverage(Math.max(500000, Math.min(3000000, val)));
                  }}
                  className="w-32 text-left"
                  dir="ltr"
                />
                <span className="text-sm text-muted-foreground">₪</span>
              </div>
            </div>
            <Slider
              value={[coverage]}
              onValueChange={([v]) => setCoverage(v)}
              min={500000}
              max={3000000}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500,000 ₪</span>
              <span>3,000,000 ₪</span>
            </div>
          </div>

          {/* Result Display */}
          <div className="bg-secondary/50 rounded-xl p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">מחיר חודשי משוער</p>
            <p className="text-4xl font-bold text-accent">
              {formatCurrency(monthlyPrice)}
            </p>
            <p className="text-xs text-muted-foreground">
              לכיסוי של {formatNumber(coverage)} ₪
            </p>
          </div>

          {/* Smoker Warning */}
          {isSmoker && smokerSavings > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  הפסק לעשן ותחסוך {formatCurrency(smokerSavings)} בשנה!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  לא מעשנים משלמים כמעט חצי מהמחיר
                </p>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleGetQuote}
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
          >
            קבל הצעת מחיר לביטוח חיים
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            * המחירים הם הערכה בלבד ועשויים להשתנות בהתאם לתנאי הפוליסה
          </p>
        </CardContent>
      </Card>

      {/* Lead Form Modal */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-right">
              השאר פרטים לבדיקת מחיר
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            title="השאר פרטים לקבלת הצעה"
            subtitle={`גיל ${age} | ${gender === "male" ? "גבר" : "אישה"} | כיסוי ${formatNumber(coverage)} ₪`}
            variant="card"
            prefilledContext={leadFormContext}
            extraData={extraData}
            onSuccess={() => setShowLeadForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LifeInsuranceCalc;
