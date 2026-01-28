import { useState, useEffect } from "react";
import { Accessibility, Plus, Minus, Eye, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState<"normal" | "large">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);

  // Apply text size changes
  useEffect(() => {
    if (textSize === "large") {
      document.documentElement.classList.add("text-lg-mode");
    } else {
      document.documentElement.classList.remove("text-lg-mode");
    }
  }, [textSize]);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  // Apply highlight links
  useEffect(() => {
    if (highlightLinks) {
      document.documentElement.classList.add("highlight-links");
    } else {
      document.documentElement.classList.remove("highlight-links");
    }
  }, [highlightLinks]);

  return (
    <div className="fixed bottom-4 left-4 z-50" dir="rtl">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label="פתח תפריט נגישות"
      >
        <Accessibility className="w-6 h-6" />
      </Button>

      {/* Options Menu */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-background border border-border rounded-lg shadow-xl p-4 min-w-[200px]">
          <h3 className="font-display font-semibold text-foreground mb-3 text-sm">
            אפשרויות נגישות
          </h3>
          
          <div className="space-y-2">
            {/* Text Size */}
            <button
              onClick={() => setTextSize(textSize === "normal" ? "large" : "normal")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                textSize === "large"
                  ? "bg-accent/20 text-accent"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {textSize === "large" ? (
                <Minus className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>הגדלת טקסט</span>
            </button>

            {/* High Contrast */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                highContrast
                  ? "bg-accent/20 text-accent"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>ניגודיות גבוהה</span>
            </button>

            {/* Highlight Links */}
            <button
              onClick={() => setHighlightLinks(!highlightLinks)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                highlightLinks
                  ? "bg-accent/20 text-accent"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>הדגשת קישורים</span>
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setTextSize("normal");
              setHighContrast(false);
              setHighlightLinks(false);
            }}
            className="w-full mt-3 pt-3 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            איפוס הגדרות
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityWidget;
