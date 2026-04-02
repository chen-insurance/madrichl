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
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { getTrafficData } from "@/hooks/useTrafficSource";
import { isRateLimited, recordAttempt } from "@/lib/rate-limiter";

const LEAD_RATE_KEY = 'lead_submit';
const LEAD_MAX_ATTEMPTS = 3;
const LEAD_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

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

interface GlobalLeadFormProps {
  /** Optional custom title */
  title?: string;
  /** Optional custom subtitle */
  subtitle?: string;
  /** Source URL for tracking */
  sourceUrl?: string;
  /** Additional context for the lead */
  prefilledContext?: string;
  /** Callback on successful submission */
  onSuccess?: () => void;
  /** Extra data to include in utm_data */
  extraData?: Record<string, unknown>;
  /** Visual variant */
  variant?: "default" | "compact" | "card";
}

const GlobalLeadForm = ({
  title = "השאירו פרטים",
  subtitle = "ונציג יחזור אליכם תוך 24 שעות",
  sourceUrl,
  prefilledContext,
  onSuccess,
  extraData,
  variant = "default",
}: GlobalLeadFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [birthYear, setBirthYear] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [ageError, setAgeError] = useState<string | null>(null);
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

      // Extract page title and slug for tracking
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

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-background rounded-2xl border border-border p-8 text-center shadow-lg">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-3">
          תודה!
        </h3>
        <p className="text-muted-foreground text-lg">
          הפרטים התקבלו, נחזור אליך בהקדם
        </p>
      </div>
    );
  }

  const containerClasses = variant === "compact" 
    ? "w-full bg-background rounded-xl border border-border p-5 shadow-md"
    : "w-full max-w-md mx-auto bg-background rounded-2xl border border-border p-6 md:p-8 shadow-lg";

  return (
    <div id="lead-form-section" className={containerClasses}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
        <h3 className="font-display font-bold text-xl text-foreground">
          {title}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {subtitle}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">
            שם מלא
          </Label>
          <Input
            id="name"
            placeholder="ישראל ישראלי"
            {...register("name")}
            className={`h-11 bg-background border-border/60 ${errors.name ? "border-destructive" : ""}`}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium">
            טלפון נייד
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="050-0000000"
            dir="ltr"
            className={`h-11 bg-background border-border/60 text-right ${errors.phone ? "border-destructive" : ""}`}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            מייל <span className="text-muted-foreground font-normal">(אופציונלי)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="israel@example.com"
            dir="ltr"
            className={`h-11 bg-background border-border/60 text-right ${errors.email ? "border-destructive" : ""}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Year of Birth Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">שנת לידה</Label>
          <Select
            value={birthYear}
            onValueChange={(value) => {
              setBirthYear(value);
              setAgeError(null);
            }}
          >
            <SelectTrigger className={`h-11 bg-background border-border/60 ${ageError || isAgeBlocked ? "border-destructive" : ""}`}>
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

        {/* Insurance Status Radio */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">האם יש לך ביטוח חיים קיים?</Label>
          <RadioGroup
            value={currentStatus}
            onValueChange={setCurrentStatus}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id="status-yes" />
              <Label htmlFor="status-yes" className="font-normal cursor-pointer text-sm">
                כן
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id="status-no" />
              <Label htmlFor="status-no" className="font-normal cursor-pointer text-sm">
                לא
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="not_sure" id="status-not-sure" />
              <Label htmlFor="status-not-sure" className="font-normal cursor-pointer text-sm">
                לא בטוח/ה
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg mt-2"
          disabled={isSubmitting || isAgeBlocked}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            "בדוק זכאותך כעת"
          )}
        </Button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pt-1">
          ללא התחייבות • שירות חינם • מאובטח
        </p>
      </form>
    </div>
  );
};

export default GlobalLeadForm;
