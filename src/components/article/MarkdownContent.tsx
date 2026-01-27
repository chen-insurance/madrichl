import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

// Custom renderer to add IDs to headings for TOC navigation
const MarkdownContent = ({ content }: MarkdownContentProps) => {
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

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};

export default MarkdownContent;
