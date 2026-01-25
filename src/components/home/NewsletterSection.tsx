import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "כתובת אימייל לא תקינה" });

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      toast({
        title: "שגיאה",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: "",
        email: validationResult.data,
        source_url: window.location.href,
        utm_data: {},
      });

      if (error) throw error;

      setIsSuccess(true);
      setEmail("");
      toast({
        title: "תודה!",
        description: "נרשמת בהצלחה לניוזלטר שלנו",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהרשמה. נסו שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-navy">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-2xl flex items-center justify-center">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          
          <h2 className="font-display text-2xl md:text-4xl font-bold text-cream mb-4">
            הישארו מעודכנים
          </h2>
          <p className="text-cream/70 text-lg mb-8 max-w-xl mx-auto">
            הירשמו לניוזלטר שלנו וקבלו את החדשות החשובות ביותר מעולם הביטוח והפנסיה ישירות לתיבת המייל
          </p>

          {isSuccess ? (
            <div className="bg-accent/20 rounded-xl p-6 flex items-center justify-center gap-3 animate-scale-in">
              <CheckCircle className="w-6 h-6 text-accent" />
              <span className="text-cream font-medium">תודה שנרשמתם! נהיה בקשר בקרוב.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="הזינו את כתובת האימייל שלכם"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-cream placeholder:text-cream/50 h-12 text-base"
                dir="ltr"
              />
              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={isSubmitting}
                className="px-8 h-12"
              >
                {isSubmitting ? "שולח..." : "הרשמה"}
              </Button>
            </form>
          )}

          <p className="text-cream/50 text-xs mt-4">
            אנחנו מכבדים את הפרטיות שלכם. ניתן לבטל את המנוי בכל עת.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
