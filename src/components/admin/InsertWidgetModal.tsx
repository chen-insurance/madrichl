import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, HelpCircle, Megaphone, Loader2, ShieldCheck } from "lucide-react";

interface InsertWidgetModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (shortcode: string, displayName: string) => void;
}

interface WidgetItem {
  id: string;
  name: string;
  shortcode: string;
  type: "form" | "calculator" | "quiz" | "cta";
}

const InsertWidgetModal = ({ open, onClose, onInsert }: InsertWidgetModalProps) => {
  const [selectedType, setSelectedType] = useState<"form" | "calculator" | "quiz" | "cta" | null>(null);

  // Lead forms (built-in)
  const leadForms: WidgetItem[] = [
    {
      id: "global-lead-form",
      name: "טופס לידים גלובלי",
      shortcode: "{{lead_form}}",
      type: "form",
    },
  ];

  // Static list of calculators
  const calculators: WidgetItem[] = [
    {
      id: "life-insurance",
      name: "מחשבון ביטוח חיים",
      shortcode: "{{insurance_calculator}}",
      type: "calculator",
    },
    {
      id: "mortgage-insurance",
      name: "מחשבון ביטוח משכנתא",
      shortcode: "{{mortgage_calculator}}",
      type: "calculator",
    },
  ];

  // Fetch active quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["admin-quizzes-widget"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data.map((q) => ({
        id: q.id,
        name: q.name,
        shortcode: `{{quiz_${q.id}}}`,
        type: "quiz" as const,
      }));
    },
  });

  // Fetch active CTA blocks
  const { data: ctaBlocks, isLoading: ctaLoading } = useQuery({
    queryKey: ["admin-cta-widget"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cta_blocks")
        .select("id, name, shortcut_code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        shortcode: `{{${c.shortcut_code}}}`,
        type: "cta" as const,
      }));
    },
  });

  const handleSelect = (item: WidgetItem) => {
    onInsert(item.shortcode, item.name);
    onClose();
    setSelectedType(null);
  };

  const handleClose = () => {
    onClose();
    setSelectedType(null);
  };

  const categories = [
    {
      type: "form" as const,
      label: "טפסי לידים",
      icon: ShieldCheck,
      items: leadForms,
      loading: false,
    },
    {
      type: "calculator" as const,
      label: "מחשבונים",
      icon: Calculator,
      items: calculators,
      loading: false,
    },
    {
      type: "quiz" as const,
      label: "שאלונים",
      icon: HelpCircle,
      items: quizzes || [],
      loading: quizzesLoading,
    },
    {
      type: "cta" as const,
      label: "בלוקי CTA",
      icon: Megaphone,
      items: ctaBlocks || [],
      loading: ctaLoading,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">הוספת ווידג׳ט</DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="grid gap-3 py-4">
            {categories.map((cat) => (
              <Button
                key={cat.type}
                variant="outline"
                className="h-16 justify-start gap-4 text-right"
                onClick={() => setSelectedType(cat.type)}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">{cat.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {cat.loading ? "טוען..." : `${cat.items.length} פריטים`}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedType(null)}
              className="mb-3"
            >
              ← חזרה
            </Button>

            {categories.find((c) => c.type === selectedType)?.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="grid gap-2">
                  {categories
                    .find((c) => c.type === selectedType)
                    ?.items.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="h-auto py-3 justify-start text-right hover:bg-accent/10"
                        onClick={() => handleSelect(item)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <code className="text-xs text-muted-foreground block mt-1 font-mono" dir="ltr">
                            {item.shortcode}
                          </code>
                        </div>
                      </Button>
                    ))}
                  {categories.find((c) => c.type === selectedType)?.items
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      אין פריטים זמינים
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InsertWidgetModal;
