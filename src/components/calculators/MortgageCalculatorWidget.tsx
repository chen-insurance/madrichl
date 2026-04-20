import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingDown, ShieldCheck, Home } from "lucide-react";

const MortgageCalculatorWidget = () => {
  const [mortgageAmount, setMortgageAmount] = useState<number>(900000);
  const [age, setAge] = useState<number>(35);
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [result, setResult] = useState<{ life: number; property: number; total: number; bankPrice: number } | null>(null);

  const calculatePrice = () => {
    // Life insurance component — based on Israeli market rates
    // Base: ~130 ₪/month per million at age 30, non-smoker
    const lifeBase = (mortgageAmount / 1_000_000) * 130;
    const ageMultiplier = 1 + Math.max(0, age - 30) * 0.048;
    const smokerMultiplier = isSmoker ? 1.35 : 1;
    const lifeComponent = Math.round(lifeBase * ageMultiplier * smokerMultiplier);

    // Property damage component — relatively fixed by asset value
    const propertyComponent = Math.round((mortgageAmount / 1_000_000) * 145);

    const total = lifeComponent + propertyComponent;

    // Banks typically charge 25-35% more than direct market
    const bankPrice = Math.round(total * 1.3);

    setResult({ life: lifeComponent, property: propertyComponent, total, bankPrice });
  };

  const scrollToLeadForm = () => {
    const leadForm = document.getElementById("lead-form-section");
    if (leadForm) {
      leadForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const formatNumber = (num: number) =>
    num.toLocaleString("he-IL");

  const savings = result ? result.bankPrice - result.total : 0;

  return (
    <Card className="w-full bg-muted/50 border-border" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-foreground">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          מחשבון ביטוח משכנתא
        </CardTitle>
        <p className="text-sm text-muted-foreground">חשב את עלות הביטוח ובדק כמה אפשר לחסוך</p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Mortgage Amount */}
        <div className="space-y-2">
          <Label htmlFor="mortgage-amount" className="text-sm font-medium">
            יתרת משכנתא (₪)
          </Label>
          <Input
            id="mortgage-amount"
            type="number"
            value={mortgageAmount}
            onChange={(e) => setMortgageAmount(Math.max(100000, Number(e.target.value)))}
            placeholder="900,000"
            className="text-left"
            dir="ltr"
          />
        </div>

        {/* Age Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">גיל הלווה הצעיר יותר</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {age} שנים
            </span>
          </div>
          <Slider
            value={[age]}
            onValueChange={(value) => setAge(value[0])}
            min={20}
            max={70}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20</span>
            <span>70</span>
          </div>
        </div>

        {/* Smoker Toggle */}
        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
          <Label className="text-sm font-medium">האם אחד הלווים מעשן?</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSmoker(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !isSmoker
                  ? "bg-green-100 text-green-700 border-2 border-green-500 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              לא
            </button>
            <button
              type="button"
              onClick={() => setIsSmoker(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSmoker
                  ? "bg-red-100 text-red-700 border-2 border-red-500 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              כן
            </button>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculatePrice}
          className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          חשב את המחיר שלי
        </Button>

        {/* Result Section */}
        {result !== null && (
          <div className="mt-2 space-y-4">
            {/* Main result */}
            <div className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground text-center mb-1">עלות ביטוח משכנתא בשוק הפתוח</p>
              <p className="text-4xl font-bold text-primary text-center">
                {formatNumber(result.total)}
                <span className="text-lg font-normal text-muted-foreground"> ₪/חודש</span>
              </p>

              {/* Breakdown */}
              <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ביטוח חיים למשכנתא
                  </span>
                  <span className="font-medium">{formatNumber(result.life)} ₪</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" /> ביטוח מבנה
                  </span>
                  <span className="font-medium">{formatNumber(result.property)} ₪</span>
                </div>
              </div>
            </div>

            {/* Bank comparison */}
            <div className="p-4 bg-destructive/8 border border-destructive/20 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-destructive">מחיר דרך הבנק</span>
                <span className="text-lg font-bold text-destructive">{formatNumber(result.bankPrice)} ₪/חודש</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                <TrendingDown className="w-4 h-4" />
                <span>חיסכון אפשרי: {formatNumber(savings)} ₪/חודש ({formatNumber(savings * 12)} ₪ בשנה)</span>
              </div>
            </div>

            <Button
              onClick={scrollToLeadForm}
              className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              בדוק כמה תחסוך עכשיו — חינם
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              * ההערכה מבוססת על ממוצע שוק. המחיר הסופי נקבע לפי בריאות, מטבע ותנאי הלוואה.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MortgageCalculatorWidget;
