import { useEffect, useState } from "react";
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

interface MobileTableOfContentsProps {
  content: string | null;
}

const MobileTableOfContents = ({ content }: MobileTableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!content) return;

    // Parse markdown headers (## Header)
    const headerRegex = /^(#{2,3})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .replace(/[^\w\u0590-\u05FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      items.push({ id, text, level });
    }

    setTocItems(items);
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className="bg-card rounded-xl shadow-soft border border-border mb-6 lg:hidden">
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
          <nav>
            <ol className="space-y-2">
              {tocItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`text-sm text-right w-full hover:text-accent transition-colors ${
                      item.level === 3 ? "pr-4 text-muted-foreground" : "text-foreground font-medium"
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MobileTableOfContents;
