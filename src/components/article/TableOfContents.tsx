import { useEffect, useState, useRef } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string | null;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const isMobile = useIsMobile();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!content) return;

    // Parse markdown headers (## Header)
    const headerRegex = /^(#{2,3})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      const level = match[1].length; // 2 for ##, 3 for ###
      const text = match[2].trim();
      // Create a URL-friendly ID
      const id = text
        .replace(/[^\w\u0590-\u05FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      items.push({ id, text, level });
    }

    setTocItems(items);

    // After items are set, observe headers for active state
    const timer = setTimeout(() => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "-20% 0% -70% 0%" }
      );

      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observerRef.current?.observe(element);
        }
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  if (tocItems.length === 0) return null;

  const tocList = (
    <nav>
      <ol className="space-y-2">
        {tocItems.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => handleClick(item.id)}
              className={`text-sm text-right w-full hover:text-accent transition-colors ${
                item.level === 3 ? "pr-4 text-muted-foreground" : "font-medium"
              } ${activeId === item.id ? "text-accent" : "text-foreground"}`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );

  // Mobile: Collapsible box
  if (isMobile) {
    return (
      <div className="bg-card rounded-xl shadow-soft border border-border mb-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-accent" />
              <span className="font-display font-bold text-foreground">
                מה בכתבה?
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            {tocList}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Desktop: Regular card (sidebar handles sticky)
  return (
    <div className="bg-card rounded-xl p-5 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <List className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-lg text-foreground">
          תוכן עניינים
        </h3>
      </div>
      {tocList}
    </div>
  );
};

export default TableOfContents;
