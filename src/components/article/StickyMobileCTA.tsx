import { useEffect, useState } from "react";
import { X, PhoneCall } from "lucide-react";

const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show after user scrolls 30% of the page
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.25) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide when lead form section is visible
  useEffect(() => {
    const leadForm = document.getElementById("lead-form-section");
    if (!leadForm) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(leadForm);
    return () => observer.disconnect();
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div className="bg-primary text-primary-foreground shadow-lg px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => {
            document.getElementById("lead-form-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex-1 flex items-center justify-center gap-2 font-bold text-sm py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          קבל הצעת מחיר חינמית תוך שעה
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="סגור"
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
