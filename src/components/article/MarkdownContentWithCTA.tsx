import { useMemo, useRef, lazy, Suspense } from "react";
import { optimizeImageUrl as getOptimizedSrc, buildSrcSet } from "@/lib/image-utils";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from "html-react-parser";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import QuizWidget from "@/components/quiz/QuizWidget";
import LifeInsuranceCalc from "@/components/calculators/LifeInsuranceCalc";
import MortgageCalculatorWidget from "@/components/calculators/MortgageCalculatorWidget";
import CarInsuranceCalc from "@/components/calculators/CarInsuranceCalc";
import DisabilityInsuranceCalc from "@/components/calculators/DisabilityInsuranceCalc";

// Lazy-load heavy below-fold components to reduce main thread work
const GlobalLeadForm = lazy(() => import("@/components/GlobalLeadForm"));

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
  skipFirstImage?: boolean;
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



const MarkdownContentWithCTA = ({ content, skipFirstImage = false }: MarkdownContentWithCTAProps) => {
  // Track whether first image has been rendered (for LCP priority)
  const imageCountRef = useRef(0);

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
      .filter((s) => !s.startsWith("quiz_") && s !== "insurance_calculator" && s !== "mortgage_calculator" && s !== "car_calculator" && s !== "disability_calculator" && s !== "lead_form");
  }, [normalizedContent]);

  // Split content by all shortcodes (for Markdown rendering path)
  const contentParts = useMemo(() => {
    const regex = /(\{\{[a-zA-Z0-9_-]+\}\})/g;
    const parts = normalizedContent.split(regex);

    return parts.map((part) => {
      if (part === "{{insurance_calculator}}") {
        return { type: "insurance_calculator" as const };
      }
      if (part === "{{mortgage_calculator}}") {
        return { type: "mortgage_calculator" as const };
      }
      if (part === "{{car_calculator}}") {
        return { type: "car_calculator" as const };
      }
      if (part === "{{disability_calculator}}") {
        return { type: "disability_calculator" as const };
      }
      if (part === "{{lead_form}}") {
        return { type: "lead_form" as const };
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
      
      if (part === "{{mortgage_calculator}}") {
        return (
          <div key={key} className="my-8 not-prose">
            <MortgageCalculatorWidget />
          </div>
        );
      }

      if (part === "{{car_calculator}}") {
        return (
          <div key={key} className="my-8 not-prose">
            <CarInsuranceCalc />
          </div>
        );
      }

      if (part === "{{disability_calculator}}") {
        return (
          <div key={key} className="my-8 not-prose">
            <DisabilityInsuranceCalc />
          </div>
        );
      }

      if (part === "{{lead_form}}") {
        return (
          <div key={key} className="my-8 not-prose">
            <Suspense fallback={<div className="h-96 bg-secondary/30 rounded-xl animate-pulse" />}>
              <GlobalLeadForm />
            </Suspense>
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
          
          if (dataWidget === "{{mortgage_calculator}}") {
            return (
              <div className="my-8 not-prose">
                <MortgageCalculatorWidget />
              </div>
            );
          }

          if (dataWidget === "{{car_calculator}}") {
            return (
              <div className="my-8 not-prose">
                <CarInsuranceCalc />
              </div>
            );
          }
          
          if (dataWidget === "{{lead_form}}") {
            return (
              <div className="my-8 not-prose">
                <Suspense fallback={<div className="h-96 bg-secondary/30 rounded-xl animate-pulse" />}>
                  <GlobalLeadForm />
                </Suspense>
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
      
// Optimize <img> elements with WebP, srcset, lazy loading
      // On mobile: hide hero image entirely and show gradient placeholder for LCP
      if (domNode instanceof Element && domNode.name === "img") {
        const src = domNode.attribs?.src || "";
        const alt = domNode.attribs?.alt || "";
        const isFirst = imageCountRef.current === 0;
        imageCountRef.current++;
        
        if (isFirst) {
          if (skipFirstImage) {
            return <span style={{ display: "none" }} />;
          }
          return (
            <>
              {/* Mobile: gradient placeholder instead of heavy image */}
              <div
                className="block md:hidden w-full rounded-lg"
                style={{
                  aspectRatio: "16/9",
                  background: "linear-gradient(135deg, hsl(220 45% 20%), hsl(220 45% 35%), hsl(30 80% 55%))",
                }}
                role="img"
                aria-label={alt}
              />
              {/* Desktop: full image with optimization */}
              <img
                src={getOptimizedSrc(src, 800)}
                srcSet={buildSrcSet(src)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                alt={alt}
                width={800}
                height={450}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                className={`hidden md:block ${domNode.attribs?.class || ""}`}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </>
          );
        }
        
        return (
          <img
            src={getOptimizedSrc(src, 800)}
            srcSet={buildSrcSet(src)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
            alt={alt}
            loading="lazy"
            fetchPriority="auto"
            decoding="async"
            className={domNode.attribs?.class || ""}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        );
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
    img: ({ src, alt, ...props }) => {
      const imgSrc = src || "";
      const isFirst = imageCountRef.current === 0;
      imageCountRef.current++;
      
      if (isFirst) {
        if (skipFirstImage) {
          return <span style={{ display: "none" }} />;
        }
        return (
          <>
            <div
              className="block md:hidden w-full rounded-lg"
              style={{
                aspectRatio: "16/9",
                background: "linear-gradient(135deg, hsl(220 45% 20%), hsl(220 45% 35%), hsl(30 80% 55%))",
              }}
              role="img"
              aria-label={alt || ""}
            />
            <img
              src={getOptimizedSrc(imgSrc, 800)}
              srcSet={buildSrcSet(imgSrc)}
              sizes="(max-width: 1024px) 50vw, 800px"
              alt={alt || ""}
              width={800}
              height={450}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="hidden md:block"
              style={{ maxWidth: "100%", height: "auto" }}
              {...props}
            />
          </>
        );
      }
      
      return (
        <img
          src={getOptimizedSrc(imgSrc, 800)}
          srcSet={buildSrcSet(imgSrc)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
          alt={alt || ""}
          width={800}
          height={450}
          loading="lazy"
          fetchPriority="auto"
          decoding="async"
          style={{ maxWidth: "100%", height: "auto" }}
          {...props}
        />
      );
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

        if (part.type === "mortgage_calculator") {
          return (
            <div key={`mortgage-${index}`} className="my-8 not-prose">
              <MortgageCalculatorWidget />
            </div>
          );
        }

        if (part.type === "car_calculator") {
          return (
            <div key={`car-${index}`} className="my-8 not-prose">
              <CarInsuranceCalc />
            </div>
          );
        }

        if (part.type === "lead_form") {
          return (
            <div key={`lead-${index}`} className="my-8 not-prose">
              <Suspense fallback={<div className="h-96 bg-secondary/30 rounded-xl animate-pulse" />}>
                <GlobalLeadForm />
              </Suspense>
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
