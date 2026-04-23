import { useEffect, useState, useRef } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
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

function parseHeadings(content: string): TOCItem[] {
  const items: TOCItem[] = [];
  // Match <h2> and <h3> in TipTap HTML format
  const re = /<h([23])[^>]*>(?:<[^>]+>)*([^<]+)(?:<\/[^>]+>)*<\/h[23]>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const text = m[2].trim();
    if (!text) continue;
    const id = "toc-" + text.replace(/[^\w֐-׿\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
    items.push({ id, text, level: parseInt(m[1]) });
  }
  return items;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!content) return;
    setTocItems(parseHeadings(content));
  }, [content]);

  useEffect(() => {
    if (tocItems.length === 0) return;
    const timer = setTimeout(() => {
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
        },
        { rootMargin: "-20% 0% -70% 0%" }
      );
      tocItems.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observerRef.current?.observe(el);
      });
    }, 500);
    return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
  }, [tocItems]);

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setIsOpen(false);
  };

  if (tocItems.length === 0) return null;

  const tocList = (
    <nav>
      <ol className="space-y-2">
        {tocItems.map((item, i) => (
          <li key={i}>
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

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <List className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-lg text-foreground">תוכן עניינים</h3>
      </div>
      {tocList}
    </div>
  );
};

export default TableOfContents;
export { parseHeadings };
