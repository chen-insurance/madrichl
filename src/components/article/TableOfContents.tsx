import { useEffect, useState } from "react";
import { List } from "lucide-react";

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
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className="bg-card rounded-xl p-5 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <List className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-lg text-foreground">
          תוכן עניינים
        </h3>
      </div>
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
    </div>
  );
};

export default TableOfContents;
