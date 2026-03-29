/**
 * Auto-detect FAQ items from article markdown content.
 * Looks for H3 headings that end with "?" followed by paragraph text.
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function extractFAQFromContent(content: string): FAQItem[] {
  if (!content) return [];

  const lines = content.split("\n");
  const faqs: FAQItem[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    // Match H3 headings ending with ?
    const h3Match = line.match(/^###\s+(.+\?)\s*$/);
    if (h3Match) {
      const question = h3Match[1].trim();
      // Collect following non-empty, non-heading lines as the answer
      const answerParts: string[] = [];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) {
          // Skip blank lines between answer paragraphs, but stop at double blank
          if (answerParts.length > 0 && i + 1 < lines.length && lines[i + 1].trim() === "") {
            break;
          }
          i++;
          continue;
        }
        if (next.startsWith("#")) break; // Next heading = stop
        answerParts.push(next);
        i++;
      }
      if (answerParts.length > 0) {
        faqs.push({ question, answer: answerParts.join(" ") });
      }
    } else {
      i++;
    }
  }

  return faqs;
}
