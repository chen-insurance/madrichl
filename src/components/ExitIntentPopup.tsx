import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import LeadForm from "@/components/LeadForm";

const EXIT_POPUP_KEY = "exit_popup_shown";
const MOBILE_TIMER_MS = 30000; // 30 seconds

const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["exit-popup-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "exit_popup_active",
          "exit_popup_image",
          "exit_popup_headline",
          "exit_popup_text",
        ]);
      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      return settingsMap;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isActive = settings?.exit_popup_active === "true";
  const headline = settings?.exit_popup_headline || "רגע לפני שאתה עוזב...";
  const text = settings?.exit_popup_text || "השאר פרטים ונחזור אליך עם הצעה מיוחדת!";
  const image = settings?.exit_popup_image;

  const showPopup = useCallback(() => {
    // Check if already shown this session
    if (sessionStorage.getItem(EXIT_POPUP_KEY)) return;
    
    setIsOpen(true);
    sessionStorage.setItem(EXIT_POPUP_KEY, "true");
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Desktop: Mouse leave detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    // Mobile: Timer-based trigger
    const isMobile = window.innerWidth < 768;
    let timer: NodeJS.Timeout | null = null;

    if (isMobile) {
      timer = setTimeout(() => {
        showPopup();
      }, MOBILE_TIMER_MS);
    } else {
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (timer) clearTimeout(timer);
    };
  }, [isActive, showPopup]);

  if (!isActive) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogTitle className="sr-only">{headline}</DialogTitle>
        
        {/* Optional Image */}
        {image && (
          <div className="w-full h-40 bg-muted overflow-hidden">
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {headline}
          </h2>
          <p className="text-muted-foreground mb-6">{text}</p>

          <LeadForm
            title=""
            subtitle=""
            variant="inline"
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
