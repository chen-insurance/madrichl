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

interface CTABlockRendererProps {
  content: string;
}

// Parse content and replace {{shortcode}} with actual CTA blocks
const CTABlockRenderer = ({ content }: CTABlockRendererProps) => {
  // Find all shortcodes in content
  const shortcodeRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  const matches = content.match(shortcodeRegex) || [];
  const shortcodes = matches.map((m) => m.replace(/\{\{|\}\}/g, ""));

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

  if (shortcodes.length === 0 || !ctaBlocks) {
    return null;
  }

  // Create a map for quick lookup
  const blocksMap = new Map(ctaBlocks.map((b) => [b.shortcut_code, b]));

  // Split content by shortcodes and render
  const parts = content.split(shortcodeRegex);
  let shortcodeIndex = 0;

  return (
    <>
      {parts.map((part, index) => {
        // Even indices are text content, odd indices are shortcode names
        if (index % 2 === 0) {
          return null; // Text parts handled by MarkdownContent
        }

        const block = blocksMap.get(part);
        if (!block) return null;

        return (
          <div
            key={`cta-${index}`}
            className="my-8 rounded-xl p-6 text-white text-center shadow-lg"
            style={{ backgroundColor: block.background_color }}
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
                className="inline-block bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {block.button_text}
              </Link>
            )}
          </div>
        );
      })}
    </>
  );
};

// Helper function to render content with CTA blocks inline
export const renderContentWithCTABlocks = (
  content: string,
  ctaBlocks: CTABlock[]
): React.ReactNode[] => {
  const shortcodeRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  const blocksMap = new Map(ctaBlocks.map((b) => [b.shortcut_code, b]));

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = shortcodeRegex.exec(content)) !== null) {
    // Add text before the shortcode
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Add CTA block
    const shortcode = match[1];
    const block = blocksMap.get(shortcode);
    if (block) {
      parts.push(
        <div
          key={`cta-${match.index}`}
          className="my-8 rounded-xl p-6 text-white text-center shadow-lg not-prose"
          style={{ backgroundColor: block.background_color }}
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
              className="inline-block bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {block.button_text}
            </Link>
          )}
        </div>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
};

export default CTABlockRenderer;
