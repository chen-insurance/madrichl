import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="חזור למעלה"
      className="fixed bottom-6 left-6 z-50 w-11 h-11 bg-primary text-primary-foreground rounded-full shadow-medium flex items-center justify-center hover:bg-primary/90 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ChevronUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
