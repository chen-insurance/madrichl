import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Shield } from "lucide-react";

const leadSchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים").max(100, "שם ארוך מדי"),
  phone: z.string().trim().regex(/^05\d{8}$/, "מספר טלפון לא תקין (דוגמה: 0501234567)"),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255, "אימייל ארוך מדי"),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  title?: string;
  subtitle?: string;
  variant?: "sidebar" | "inline" | "card";
  sourceUrl?: string;
}

const LeadForm = ({ 
  title = "רוצים לחסוך בביטוח?",
  subtitle = "השאירו פרטים ונחזור אליכם עם הצעה מותאמת אישית",
  variant = "card",
  sourceUrl 
}: LeadFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [utmData, setUtmData] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  // Capture UTM parameters from session storage
  useEffect(() => {
    const storedUtm = sessionStorage.getItem("utm_data");
    if (storedUtm) {
      try {
        setUtmData(JSON.parse(storedUtm));
      } catch (e) {
        console.error("Failed to parse UTM data");
      }
    }
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        source_url: sourceUrl || window.location.href,
        utm_data: utmData,
      });

      if (error) throw error;

      setIsSuccess(true);
      reset();
      toast({
        title: "הפרטים נשלחו בהצלחה!",
        description: "נציג יחזור אליך בהקדם",
      });
    } catch (error) {
      toast({
        title: "שגיאה בשליחה",
        description: "אנא נסו שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseClasses = "rounded-xl";
  const variantClasses = {
    sidebar: "bg-accent/5 border border-accent/20 p-5",
    inline: "bg-secondary/50 border border-border p-6 my-8",
    card: "bg-card shadow-medium p-6",
  };

  if (isSuccess) {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} text-center`}>
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2">
          תודה רבה!
        </h3>
        <p className="text-muted-foreground text-sm">
          נציג יחזור אליך תוך 24 שעות
        </p>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">שם מלא</Label>
          <Input
            id="name"
            placeholder="ישראל ישראלי"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">טלפון נייד</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0501234567"
            dir="ltr"
            className={`text-right ${errors.phone ? "border-destructive" : ""}`}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            type="email"
            placeholder="israel@example.com"
            dir="ltr"
            className={`text-right ${errors.email ? "border-destructive" : ""}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gold"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            "שלחו לי הצעה"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          ללא התחייבות • שירות חינם • מאובטח
        </p>
      </form>
    </div>
  );
};

export default LeadForm;