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
import { getTrafficData } from "@/hooks/useTrafficSource";

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
  const { toast } = useToast();

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
      // Fetch webhook URL from site_settings
      const { data: settings } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "webhook_url")
        .maybeSingle();

      const webhookUrl = settings?.value;
      
      if (webhookUrl && webhookUrl.trim()) {
        // Send webhook in background - don't block the user experience
        fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leadData),
        }).catch((err) => {
          console.error("Webhook failed:", err);
        });
      }
    } catch (err) {
      console.error("Failed to fetch webhook URL:", err);
    }
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      // Get traffic data from session storage
      const trafficData = getTrafficData();
      const currentUrl = sourceUrl || window.location.href;

      // Prepare the full lead data - email is required in DB, use empty string if not provided
      const leadData = {
        name: data.name,
        email: data.email || "",
        phone: data.phone,
        source_url: currentUrl,
        utm_data: {
          ...(trafficData || {}),
          context: prefilledContext || null,
          ...(extraData || {}),
        },
      };

      // Insert into database
      const { error } = await supabase.from("leads").insert([leadData]);

      if (error) throw error;

      // Send webhook (non-blocking)
      sendWebhook({
        ...leadData,
        submitted_at: new Date().toISOString(),
      });

      setIsSuccess(true);
      reset();
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

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isSubmitting}
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
