import { useState, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Shield } from "lucide-react";
import { getTrafficData } from "@/hooks/useTrafficSource";

// Age restriction constants
const MIN_BIRTH_YEAR = 1960;
const MAX_BIRTH_YEAR = 2006;
const MAX_AGE_ALLOWED = 60;

const leadSchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים").max(100, "שם ארוך מדי"),
  phone: z.string().trim().regex(/^05\d{8}$/, "מספר טלפון לא תקין (דוגמה: 0501234567)"),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255, "אימייל ארוך מדי").optional().or(z.literal("")),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  title?: string;
  subtitle?: string;
  variant?: "sidebar" | "inline" | "card";
  sourceUrl?: string;
  prefilledContext?: string;
  onSuccess?: () => void;
  extraData?: Record<string, unknown>;
}

const LeadForm = ({ 
  title = "בדוק את זכאותך",
  subtitle = "השאירו פרטים ונבדוק עבורכם ללא עלות",
  variant = "card",
  sourceUrl,
  prefilledContext,
  onSuccess,
  extraData,
}: LeadFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [birthYear, setBirthYear] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [ageError, setAgeError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();

  // Generate year options (1960-2006, newest first)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = MIN_BIRTH_YEAR; year <= MAX_BIRTH_YEAR; year++) {
      years.push(year);
    }
    return years.reverse();
  }, []);

  // Calculate age and check if blocked
  const selectedAge = birthYear ? currentYear - parseInt(birthYear) : null;
  const isAgeBlocked = selectedAge !== null && selectedAge > MAX_AGE_ALLOWED;
  const isWarningAge = selectedAge !== null && selectedAge >= 55 && selectedAge <= MAX_AGE_ALLOWED;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: "",
    },
  });

  const sendWebhook = async (leadData: Record<string, unknown>) => {
    try {
      // Call edge function to securely send webhook (webhook URL is now protected)
      const { error } = await supabase.functions.invoke("submit-lead-webhook", {
        body: leadData,
      });
      
      if (error) {
        console.error("Webhook edge function failed:", error);
      }
    } catch (err) {
      console.error("Failed to call webhook function:", err);
    }
  };

  const onSubmit = async (data: LeadFormData) => {
    // Honeypot check - silently reject bot submissions
    if (honeypot) {
      setIsSuccess(true);
      return;
    }

    // Validate birth year is selected
    if (!birthYear) {
      setAgeError("נא לבחור שנת לידה");
      return;
    }

    // Check age restriction
    if (isAgeBlocked) {
      setAgeError("השירות מותאם לגילאים עד 60 בלבד");
      return;
    }

    // Validate current status
    if (!currentStatus) {
      toast({
        title: "שגיאה",
        description: "נא לבחור אם יש לך ביטוח קיים",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setAgeError(null);

    try {
      const trafficData = getTrafficData();
      const currentUrl = sourceUrl || window.location.href;
      
      // Extract page title and slug for Make.com tracking
      const pageTitle = document.title;
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const pageSlug = pathParts[pathParts.length - 1] || 'homepage';

      const leadData = {
        name: data.name,
        email: data.email || "",
        phone: data.phone,
        source_url: currentUrl,
        birth_year: parseInt(birthYear),
        current_status: currentStatus,
        utm_data: {
          ...(trafficData || {}),
          context: prefilledContext || null,
          ...(extraData || {}),
          calculated_age: selectedAge,
          ...(isWarningAge && { lead_risk_tag: "high_risk_hard_to_convert" }),
        },
      };

      const { error } = await supabase.from("leads").insert([leadData]);

      if (error) throw error;

      sendWebhook({
        ...leadData,
        page_title: pageTitle,
        page_slug: pageSlug,
        submitted_at: new Date().toISOString(),
      });

      setIsSuccess(true);
      reset();
      setBirthYear("");
      setCurrentStatus("");
      toast({
        title: "תודה! הפרטים התקבלו",
        description: "ניצור איתך קשר בהקדם",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Lead submission error:", error);
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
    sidebar: "bg-secondary/50 border border-border p-5",
    inline: "bg-secondary/30 border border-border p-6 my-8",
    card: "bg-secondary/30 border border-border shadow-soft p-6",
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
          ניצור איתך קשר בהקדם
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
        {/* Honeypot - hidden from real users */}
        <div className="absolute opacity-0 pointer-events-none" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" tabIndex={-1}>
          <input
            type="text"
            name="website_url"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>
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
            placeholder="050-0000000"
            dir="ltr"
            className={`text-right ${errors.phone ? "border-destructive" : ""}`}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            מייל <span className="text-muted-foreground">(אופציונלי)</span>
          </Label>
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

        {/* Year of Birth Dropdown */}
        <div className="space-y-2">
          <Label>שנת לידה</Label>
          <Select
            value={birthYear}
            onValueChange={(value) => {
              setBirthYear(value);
              setAgeError(null);
            }}
          >
            <SelectTrigger className={ageError || isAgeBlocked ? "border-destructive" : ""}>
              <SelectValue placeholder="בחר שנת לידה" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(ageError || isAgeBlocked) && (
            <p className="text-xs text-destructive">
              {ageError || "השירות מותאם לגילאים עד 60 בלבד"}
            </p>
          )}
        </div>

        {/* Current Insurance Status */}
        <div className="space-y-3">
          <Label>האם יש לך ביטוח חיים קיים?</Label>
          <RadioGroup
            value={currentStatus}
            onValueChange={setCurrentStatus}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id="status-yes" />
              <Label htmlFor="status-yes" className="font-normal cursor-pointer">כן</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id="status-no" />
              <Label htmlFor="status-no" className="font-normal cursor-pointer">לא</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="not_sure" id="status-not-sure" />
              <Label htmlFor="status-not-sure" className="font-normal cursor-pointer">לא בטוח/ה</Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isSubmitting || isAgeBlocked}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            "בדוק זכאותך כעת"
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
