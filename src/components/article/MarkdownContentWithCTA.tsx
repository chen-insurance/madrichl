import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from "html-react-parser";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import QuizWidget from "@/components/quiz/QuizWidget";
import LifeInsuranceCalc from "@/components/calculators/LifeInsuranceCalc";

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

// Clean content: convert span placeholders back to shortcodes and normalize
const normalizeContent = (content: string): string => {
  if (!content) return "";
  
  // Convert <span data-widget="{{shortcode}}" ...>text</span> back to {{shortcode}}
  return content.replace(
    /<span[^>]*data-widget="(\{\{[^"]+\}\})"[^>]*>[^<]*<\/span>/g,
    "$1"
  );
};

// Check if content is HTML or Markdown
const isHtmlContent = (content: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(content);
};

const MarkdownContentWithCTA = ({ content }: MarkdownContentWithCTAProps) => {
  // Normalize content first (convert span placeholders to shortcodes)
  const normalizedContent = useMemo(() => normalizeContent(content), [content]);
  
  // Detect if content is HTML or Markdown
  const contentIsHtml = useMemo(() => isHtmlContent(normalizedContent), [normalizedContent]);

  // Find all CTA shortcodes (excluding quiz_ and insurance_calculator)
  const ctaShortcodes = useMemo(() => {
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = normalizedContent.match(regex) || [];
    return matches
      .map((m) => m.replace(/\{\{|\}\}/g, ""))
      .filter((s) => !s.startsWith("quiz_") && s !== "insurance_calculator");
  }, [normalizedContent]);

  // Split content by all shortcodes (for Markdown rendering path)
  const contentParts = useMemo(() => {
    const regex = /(\{\{[a-zA-Z0-9_-]+\}\})/g;
    const parts = normalizedContent.split(regex);

    return parts.map((part) => {
      if (part === "{{insurance_calculator}}") {
        return { type: "insurance_calculator" as const };
      }
      const quizMatch = part.match(/\{\{quiz_([a-zA-Z0-9-]+)\}\}/);
      if (quizMatch) {
        return { type: "quiz" as const, quizId: quizMatch[1] };
      }
      const ctaMatch = part.match(/\{\{([a-zA-Z0-9_-]+)\}\}/);
      if (ctaMatch) {
        return { type: "cta" as const, shortcode: ctaMatch[1] };
      }
      return { type: "markdown" as const, content: part };
    });
  }, [normalizedContent]);

  // Fetch CTA blocks
  const { data: ctaBlocks } = useQuery({
    queryKey: ["cta-blocks-render", ctaShortcodes],
    queryFn: async () => {
      if (ctaShortcodes.length === 0) return [];
      const { data, error } = await supabase
        .from("cta_blocks")
        .select("*")
        .in("shortcut_code", ctaShortcodes)
        .eq("is_active", true);
      if (error) throw error;
      return data as CTABlock[];
    },
    enabled: ctaShortcodes.length > 0,
  });

  const blocksMap = useMemo(
    () => new Map(ctaBlocks?.map((b) => [b.shortcut_code, b]) || []),
    [ctaBlocks]
  );

  // Render a CTA block
  const renderCTABlock = (block: CTABlock, key: string) => (
    <div
      key={key}
      className="my-8 rounded-xl p-6 text-center shadow-lg not-prose"
      style={{ backgroundColor: block.background_color, color: "white" }}
    >
      {block.headline && <h3 className="text-xl font-bold mb-2">{block.headline}</h3>}
      {block.description && <p className="text-sm opacity-90 mb-4">{block.description}</p>}
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

  // Replace shortcode text with actual React component
  const replaceShortcodeInText = (text: string, keyPrefix: string): React.ReactNode[] => {
    const regex = /(\{\{[a-zA-Z0-9_-]+\}\})/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      
      if (part === "{{insurance_calculator}}") {
        return (
          <div key={key} className="my-8 not-prose">
            <LifeInsuranceCalc />
          </div>
        );
      }
      
      const quizMatch = part.match(/\{\{quiz_([a-zA-Z0-9-]+)\}\}/);
      if (quizMatch) {
        return (
          <div key={key} className="my-8 not-prose">
            <QuizWidget quizId={quizMatch[1]} />
          </div>
        );
      }
      
      const ctaMatch = part.match(/\{\{([a-zA-Z0-9_-]+)\}\}/);
      if (ctaMatch) {
        const block = blocksMap.get(ctaMatch[1]);
        if (block) {
          return renderCTABlock(block, key);
        }
        return null;
      }
      
      return part || null;
    }).filter(Boolean);
  };

  // HTML parser options for replacing widgets
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Handle text nodes that might contain shortcodes
      if (domNode.type === "text" && (domNode as any).data) {
        const text = (domNode as any).data as string;
        if (text.includes("{{")) {
          const replaced = replaceShortcodeInText(text, `txt-${Math.random()}`);
          if (replaced.length === 1 && typeof replaced[0] === "string") {
            return undefined;
          }
          return <>{replaced}</>;
        }
      }
      
      // Handle span elements with data-widget attribute (legacy support)
      if (domNode instanceof Element && domNode.name === "span") {
        const dataWidget = domNode.attribs?.["data-widget"];
        if (dataWidget) {
          if (dataWidget === "{{insurance_calculator}}") {
            return (
              <div className="my-8 not-prose">
                <LifeInsuranceCalc />
              </div>
            );
          }
          
          const quizMatch = dataWidget.match(/\{\{quiz_([a-zA-Z0-9-]+)\}\}/);
          if (quizMatch) {
            return (
              <div className="my-8 not-prose">
                <QuizWidget quizId={quizMatch[1]} />
              </div>
            );
          }
          
          const ctaMatch = dataWidget.match(/\{\{([a-zA-Z0-9_-]+)\}\}/);
          if (ctaMatch) {
            const block = blocksMap.get(ctaMatch[1]);
            if (block) {
              return renderCTABlock(block, `cta-${ctaMatch[1]}`);
            }
          }
        }
      }
      
      // Handle h2 and h3 for TOC anchors
      if (domNode instanceof Element && (domNode.name === "h2" || domNode.name === "h3")) {
        const children = domNode.children;
        const text = children
          .map((child: DOMNode) => ((child as any).data || ""))
          .join("");
        const id = text.replace(/[^\w\u0590-\u05FF\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
        
        const Tag = domNode.name;
        return (
          <Tag id={id} className="scroll-mt-24">
            {domToReact(children as DOMNode[], parserOptions)}
          </Tag>
        );
      }
      
      return undefined;
    },
  };

  // For HTML content, use html-react-parser
  if (contentIsHtml) {
    return <>{parse(normalizedContent, parserOptions)}</>;
  }

  // For Markdown content, use ReactMarkdown with shortcode splitting
  const components: Components = {
    h2: ({ children }) => {
      const text = String(children);
      const id = text.replace(/[^\w\u0590-\u05FF\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
      return <h2 id={id} className="scroll-mt-24">{children}</h2>;
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = text.replace(/[^\w\u0590-\u05FF\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
      return <h3 id={id} className="scroll-mt-24">{children}</h3>;
    },
  };

  return (
    <>
      {contentParts.map((part, index) => {
        if (part.type === "insurance_calculator") {
          return (
            <div key={`calc-${index}`} className="my-8 not-prose">
              <LifeInsuranceCalc />
            </div>
          );
        }

        if (part.type === "quiz" && part.quizId) {
          return (
            <div key={`quiz-${index}`} className="my-8 not-prose">
              <QuizWidget quizId={part.quizId} />
            </div>
          );
        }

        if (part.type === "cta" && part.shortcode) {
          const block = blocksMap.get(part.shortcode);
          if (!block) return null;
          return renderCTABlock(block, `cta-${index}`);
        }

        if (part.type === "markdown" && part.content?.trim()) {
          return <ReactMarkdown key={`md-${index}`} components={components}>{part.content}</ReactMarkdown>;
        }
        return null;
      })}
    </>
  );
};

export default MarkdownContentWithCTA;
