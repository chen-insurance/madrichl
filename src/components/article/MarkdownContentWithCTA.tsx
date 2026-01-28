import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface CTABlock {
  id: string;
  shortcut_code: string;
  headline: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  background_color: string;
  is_active: boolean;
}

interface MarkdownContentWithCTAProps {
  content: string;
}

// Custom renderer to add IDs to headings for TOC navigation and render CTA blocks
const MarkdownContentWithCTA = ({ content }: MarkdownContentWithCTAProps) => {
  // Find all shortcodes in content
  const shortcodes = useMemo(() => {
    const shortcodeRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = content.match(shortcodeRegex) || [];
    return matches.map((m) => m.replace(/\{\{|\}\}/g, ""));
  }, [content]);

  // Fetch CTA blocks for found shortcodes
  const { data: ctaBlocks } = useQuery({
    queryKey: ["cta-blocks-render", shortcodes],
    queryFn: async () => {
      if (shortcodes.length === 0) return [];
      const { data, error } = await supabase
        .from("cta_blocks")
        .select("*")
        .in("shortcut_code", shortcodes)
        .eq("is_active", true);
      if (error) throw error;
      return data as CTABlock[];
    },
    enabled: shortcodes.length > 0,
  });

  // Create a map for quick lookup
  const blocksMap = useMemo(
    () => new Map(ctaBlocks?.map((b) => [b.shortcut_code, b]) || []),
    [ctaBlocks]
  );

  // Split content by shortcodes
  const contentParts = useMemo(() => {
    if (shortcodes.length === 0) return [{ type: "markdown" as const, content }];

    const shortcodeRegex = /(\{\{[a-zA-Z0-9_-]+\}\})/g;
    const parts = content.split(shortcodeRegex);

    return parts.map((part) => {
      const match = part.match(/\{\{([a-zA-Z0-9_-]+)\}\}/);
      if (match) {
        return { type: "cta" as const, shortcode: match[1] };
      }
      return { type: "markdown" as const, content: part };
    });
  }, [content, shortcodes]);

  const components: Components = {
    h2: ({ children }) => {
      const text = String(children);
      const id = text
        .replace(/[^\w\u0590-\u05FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      return (
        <h2 id={id} className="scroll-mt-24">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = text
        .replace(/[^\w\u0590-\u05FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      return (
        <h3 id={id} className="scroll-mt-24">
          {children}
        </h3>
      );
    },
  };

  return (
    <>
      {contentParts.map((part, index) => {
        if (part.type === "cta" && part.shortcode) {
          const block = blocksMap.get(part.shortcode);
          if (!block) return null;

          return (
            <div
              key={`cta-${index}`}
              className="my-8 rounded-xl p-6 text-center shadow-lg not-prose"
              style={{ backgroundColor: block.background_color, color: "white" }}
            >
              {block.headline && (
                <h3 className="text-xl font-bold mb-2">{block.headline}</h3>
              )}
              {block.description && (
                <p className="text-sm opacity-90 mb-4">{block.description}</p>
              )}
              {block.button_text && block.button_link && (
                <Link
                  to={block.button_link}
                  className="inline-block bg-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                  style={{ color: block.background_color }}
                >
                  {block.button_text}
                </Link>
              )}
            </div>
          );
        }

        if (part.type === "markdown" && part.content?.trim()) {
          return (
            <ReactMarkdown key={`md-${index}`} components={components}>
              {part.content}
            </ReactMarkdown>
          );
        }

        return null;
      })}
    </>
  );
};

export default MarkdownContentWithCTA;
