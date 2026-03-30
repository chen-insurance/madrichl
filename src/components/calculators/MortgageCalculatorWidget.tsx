import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, ArrowDown } from "lucide-react";

const MortgageCalculatorWidget = () => {
  const [mortgageAmount, setMortgageAmount] = useState<number>(900000);
  const [age, setAge] = useState<number>(35);
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);

  const calculatePrice = () => {
    // Base Price = (Mortgage Amount / 100,000) * 1.5
    let basePrice = (mortgageAmount / 100000) * 1.5;

    // Age Factor: Add 2 NIS for every year above 30
    if (age > 30) {
      basePrice += (age - 30) * 2;
    }

    // Smoker Factor: If "Yes", multiply total by 1.35
    if (isSmoker) {
      basePrice *= 1.35;
    }

    setResult(Math.round(basePrice));
  };

  const scrollToLeadForm = () => {
    const leadForm = document.getElementById('lead-form-section');
    
    if (leadForm) {
      leadForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('he-IL');
  };

  return (
    <Card className="w-full bg-muted/50 border-border" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-foreground">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          מחשבון בדיקת כדאיות - ביטוח משכנתא
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mortgage Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="mortgage-amount" className="text-sm font-medium">
            יתרת משכנתא (₪)
          </Label>
          <Input
            id="mortgage-amount"
            type="number"
            value={mortgageAmount}
            onChange={(e) => setMortgageAmount(Number(e.target.value))}
            placeholder="לדוגמה: 900,000"
            className="text-left"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            הזן את יתרת המשכנתא הנוכחית שלך
          </p>
        </div>

        {/* Age Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">גיל הלווה</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {age} שנים
            </span>
          </div>
          <Slider
            value={[age]}
            onValueChange={(value) => setAge(value[0])}
            min={20}
            max={75}
            step={1}
            className="w-full [direction:rtl]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>75</span>
            <span>20</span>
          </div>
        </div>

        {/* Smoker Toggle */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
          <Label className="text-sm font-medium">
            האם מעשן?
          </Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSmoker(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isSmoker 
                  ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              לא מעשן
            </button>
            <button
              type="button"
              onClick={() => setIsSmoker(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSmoker 
                  ? 'bg-red-100 text-red-700 border-2 border-red-500' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              מעשן
            </button>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculatePrice}
          className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          חשב כמה אני צריך לשלם
        </Button>

        {/* Result Section */}
        {result !== null && (
          <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border-2 border-primary/20 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">המחיר המשוער עבורך:</p>
              <p className="text-4xl font-bold text-primary">
                {formatNumber(result)} ₪
                <span className="text-lg font-normal text-muted-foreground mr-2">לחודש</span>
              </p>
            </div>

            <p className="text-center text-sm font-bold text-destructive bg-destructive/10 p-3 rounded-lg">
              משלם בבנק יותר? אפשר להוזיל את הביטוח משמעותית!
            </p>

            <Button
              onClick={scrollToLeadForm}
              className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              רוצה לבדוק את המחיר שלי
              <ArrowDown className="w-5 h-5" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              * ההערכה מבוססת על ממוצע שוק ומיועדת להתרשמות ראשונית בלבד
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MortgageCalculatorWidget;
