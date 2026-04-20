import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Car, TrendingDown, AlertTriangle } from "lucide-react";

const CarInsuranceCalc = () => {
  const [driverAge, setDriverAge] = useState<number>(35);
  const [yearsExperience, setYearsExperience] = useState<number>(10);
  const [carYear, setCarYear] = useState<number>(2020);
  const [carValue, setCarValue] = useState<number>(80000);
  const [result, setResult] = useState<{
    mandatory: number;
    comprehensive: number;
    total: number;
    savings: number;
  } | null>(null);

  const currentYear = new Date().getFullYear();

  const calculatePrice = () => {
    // Mandatory (חובה) base: ~2,400 ₪/year
    let mandatory = 2400;
    // Young drivers pay more
    if (driverAge < 24) mandatory *= 1.6;
    else if (driverAge < 28) mandatory *= 1.3;
    else if (driverAge < 35) mandatory *= 1.1;
    // New drivers pay more
    if (yearsExperience < 2) mandatory *= 1.5;
    else if (yearsExperience < 5) mandatory *= 1.2;

    // Comprehensive (מקיף) — based on car value, age
    const carAge = currentYear - carYear;
    const baseRate = 0.04; // ~4% of car value per year
    const ageDiscount = Math.min(0.5, carAge * 0.05); // older cars cheaper
    let comprehensive = carValue * (baseRate - ageDiscount * baseRate);
    // Young driver surcharge
    if (driverAge < 24) comprehensive *= 1.5;
    else if (driverAge < 28) comprehensive *= 1.25;
    if (yearsExperience < 2) comprehensive *= 1.4;
    else if (yearsExperience < 5) comprehensive *= 1.15;

    comprehensive = Math.max(1200, Math.round(comprehensive / 100) * 100);
    mandatory = Math.round(mandatory / 100) * 100;
    const total = mandatory + comprehensive;
    const savings = Math.round(total * 0.15); // avg 15% savings possible

    setResult({ mandatory, comprehensive, total, savings });
  };

  const scrollToLeadForm = () => {
    const el = document.getElementById("lead-form-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const fmt = (n: number) => n.toLocaleString("he-IL");

  const isYoungDriver = driverAge < 25 || yearsExperience < 3;
  const isOldCar = currentYear - carYear > 10;

  return (
    <Card className="w-full bg-muted/50 border-border" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-foreground">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" />
          </div>
          מחשבון ביטוח רכב
        </CardTitle>
        <p className="text-sm text-muted-foreground">חשב את עלות ביטוח הרכב השנתי שלך</p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Driver Age */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">גיל הנהג הצעיר</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {driverAge} שנים
            </span>
          </div>
          <Slider
            value={[driverAge]}
            onValueChange={(v) => setDriverAge(v[0])}
            min={17} max={75} step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>17</span><span>75</span>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">שנות ותק</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {yearsExperience} שנים
            </span>
          </div>
          <Slider
            value={[yearsExperience]}
            onValueChange={(v) => setYearsExperience(v[0])}
            min={0} max={40} step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 (חדש)</span><span>40+</span>
          </div>
        </div>

        {/* Car Year */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">שנת הרכב</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {carYear}
            </span>
          </div>
          <Slider
            value={[carYear]}
            onValueChange={(v) => setCarYear(v[0])}
            min={2005} max={currentYear} step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2005</span><span>{currentYear}</span>
          </div>
        </div>

        {/* Car Value */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">שווי הרכב בשוק (₪)</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {fmt(carValue)} ₪
            </span>
          </div>
          <Slider
            value={[carValue]}
            onValueChange={(v) => setCarValue(v[0])}
            min={20000} max={300000} step={5000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20,000 ₪</span><span>300,000 ₪</span>
          </div>
        </div>

        {isYoungDriver && (
          <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">נהג צעיר/חדש — מחיר יקר יותר. כדאי להוסיף נהג ותיק לפוליסה.</p>
          </div>
        )}

        <Button
          onClick={calculatePrice}
          className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          חשב את המחיר שלי
        </Button>

        {result !== null && (
          <div className="mt-2 space-y-4">
            <div className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground text-center mb-1">עלות ביטוח רכב שנתית משוערת</p>
              <p className="text-4xl font-bold text-primary text-center">
                {fmt(result.total)}
                <span className="text-lg font-normal text-muted-foreground"> ₪/שנה</span>
              </p>
              <p className="text-sm text-center text-muted-foreground mt-1">
                ({fmt(Math.round(result.total / 12))} ₪/חודש)
              </p>

              <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ביטוח חובה</span>
                  <span className="font-medium">{fmt(result.mandatory)} ₪/שנה</span>
                </div>
                {!isOldCar && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ביטוח מקיף (מומלץ)</span>
                    <span className="font-medium">{fmt(result.comprehensive)} ₪/שנה</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400">
                <TrendingDown className="w-4 h-4" />
                <span>חיסכון אפשרי בהשוואת מחירים: {fmt(result.savings)} ₪/שנה</span>
              </div>
            </div>

            <Button
              onClick={scrollToLeadForm}
              className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              קבל הצעת מחיר טובה יותר — חינם
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              * ההערכה מבוססת על ממוצע שוק. המחיר הסופי תלוי בחברת הביטוח, כיסויים ורשומת תאונות.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarInsuranceCalc;
