import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ShieldAlert, TrendingDown, AlertTriangle } from "lucide-react";

const DisabilityInsuranceCalc = () => {
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [salary, setSalary] = useState(15000);
  const [pensionCoverage, setPensionCoverage] = useState(75);
  const [result, setResult] = useState<{
    monthlyBenefit: number;
    pensionBenefit: number;
    gap: number;
    premiumLow: number;
    premiumHigh: number;
    yearsToRetirement: number;
    totalExposure: number;
  } | null>(null);

  const calculate = () => {
    const maxBenefit = Math.round(salary * 0.75 / 1000) * 1000;
    const pensionBenefit = Math.round((salary * pensionCoverage) / 100 / 1000) * 1000;
    const gap = Math.max(0, maxBenefit - pensionBenefit);

    // Base rate per 1,000 ₪ monthly benefit
    let baseRatePer1k = gender === "male" ? 18 : 24;
    if (age < 30) baseRatePer1k *= 0.7;
    else if (age < 35) baseRatePer1k *= 0.85;
    else if (age < 40) baseRatePer1k *= 1.0;
    else if (age < 45) baseRatePer1k *= 1.3;
    else if (age < 50) baseRatePer1k *= 1.7;
    else if (age < 55) baseRatePer1k *= 2.2;
    else baseRatePer1k *= 2.9;

    const gapIn1k = gap / 1000;
    const premiumLow = Math.round(gapIn1k * baseRatePer1k * 0.85 / 10) * 10;
    const premiumHigh = Math.round(gapIn1k * baseRatePer1k * 1.15 / 10) * 10;

    const yearsToRetirement = Math.max(0, 67 - age);
    const totalExposure = gap * 12 * yearsToRetirement;

    setResult({ monthlyBenefit: maxBenefit, pensionBenefit, gap, premiumLow, premiumHigh, yearsToRetirement, totalExposure });
  };

  const scrollToLeadForm = () => {
    const el = document.getElementById("lead-form-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const fmt = (n: number) => n.toLocaleString("he-IL");
  const hasGap = result && result.gap > 0;

  return (
    <Card className="my-8 border-2 border-primary/20 shadow-lg" dir="rtl">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-primary text-xl">
          <ShieldAlert className="w-6 h-6" />
          מחשבון פער ביטוח אובדן כושר עבודה
        </CardTitle>
        <p className="text-sm text-muted-foreground">גלו כמה הפנסיה מכסה — וכמה נשאר פתוח</p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Gender */}
        <div>
          <Label className="text-base font-semibold">מין</Label>
          <div className="flex gap-3 mt-2">
            {(["male", "female"] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${gender === g ? "border-primary bg-primary text-white" : "border-border hover:border-primary/50"}`}
              >
                {g === "male" ? "גבר" : "אישה"}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div>
          <Label className="text-base font-semibold">גיל: <span className="text-primary">{age}</span></Label>
          <Slider
            min={25} max={60} step={1}
            value={[age]}
            onValueChange={([v]) => setAge(v)}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>60</span><span>25</span>
          </div>
        </div>

        {/* Salary */}
        <div>
          <Label className="text-base font-semibold">שכר ברוטו חודשי: <span className="text-primary">{fmt(salary)} ₪</span></Label>
          <Slider
            min={5000} max={50000} step={1000}
            value={[salary]}
            onValueChange={([v]) => setSalary(v)}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>50,000 ₪</span><span>5,000 ₪</span>
          </div>
        </div>

        {/* Pension coverage % */}
        <div>
          <Label className="text-base font-semibold">
            כיסוי א.כ.ע בפנסיה: <span className="text-primary">{pensionCoverage}% מהשכר</span>
          </Label>
          <Slider
            min={0} max={75} step={5}
            value={[pensionCoverage]}
            onValueChange={([v]) => setPensionCoverage(v)}
            className="mt-3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            לא בטוחים? בדקו במסמכי הפנסיה שלכם. הממוצע: 50-60%
          </p>
        </div>

        <Button onClick={calculate} className="w-full text-base py-5">
          חשב את הפער שלי
        </Button>

        {result && (
          <div className="space-y-4 pt-2 border-t">
            <h3 className="font-bold text-lg text-center">תוצאות החישוב</h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">קצבה מקסימלית</p>
                <p className="font-bold text-blue-700">{fmt(result.monthlyBenefit)} ₪</p>
                <p className="text-xs">75% מהשכר</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">כיסוי הפנסיה</p>
                <p className="font-bold text-green-700">{fmt(result.pensionBenefit)} ₪</p>
                <p className="text-xs">לפי הפרמטרים</p>
              </div>
              <div className={`rounded-lg p-3 ${hasGap ? "bg-red-50" : "bg-green-50"}`}>
                <p className="text-xs text-muted-foreground">פער לא מכוסה</p>
                <p className={`font-bold ${hasGap ? "text-red-700" : "text-green-700"}`}>
                  {fmt(result.gap)} ₪
                </p>
                <p className="text-xs">לחודש</p>
              </div>
            </div>

            {hasGap ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800">יש לכם פער שצריך לכסות</p>
                      <p className="text-sm text-amber-700 mt-1">
                        פוליסה לכיסוי הפער של <strong>{fmt(result.gap)} ₪/חודש</strong> תעלה בין{" "}
                        <strong>{fmt(result.premiumLow)}</strong> ל-<strong>{fmt(result.premiumHigh)} ₪/חודש</strong>.
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        החשיפה הכוללת שלכם עד גיל פרישה ({result.yearsToRetirement} שנה):{" "}
                        <strong>{fmt(result.totalExposure)} ₪</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">
                      עלות הביטוח הנדרש (<strong>{fmt(result.premiumHigh)} ₪/חודש</strong>) לעומת הפער שאתם חשופים אליו (
                      <strong>{fmt(result.gap)} ₪/חודש</strong>) — יחס של 1:{Math.round(result.gap / result.premiumHigh)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-green-800">הפנסיה שלכם מכסה את מלוא הקצבה</p>
                <p className="text-sm text-green-700 mt-1">מומלץ לוודא שהגדרת הזכאות בפנסיה היא "עיסוק ספציפי"</p>
              </div>
            )}

            <Button onClick={scrollToLeadForm} variant="default" className="w-full text-base py-5 bg-green-600 hover:bg-green-700">
              קבלו הצעת מחיר לכיסוי הפער — חינם
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              * החישוב הוא אומדן בלבד. מחירים בפועל תלויים בבדיקות רפואיות, מקצוע ותנאי הפוליסה.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisabilityInsuranceCalc;
