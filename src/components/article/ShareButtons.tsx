import { useState } from "react";
import { MessageCircle, Facebook, Linkedin, Link2, Check, Share2 } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const btnBase =
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 py-5 border-t border-border mt-6">
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground ml-2">
        <Share2 className="w-4 h-4" aria-hidden="true" />
        שתף:
      </span>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${enc(title + " " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שתף בוואטסאפ"
        className={`${btnBase} bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20`}
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        וואטסאפ
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שתף בפייסבוק"
        className={`${btnBase} bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20`}
      >
        <Facebook className="w-4 h-4" aria-hidden="true" />
        פייסבוק
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${enc(url)}&title=${enc(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שתף בלינקדאין"
        className={`${btnBase} bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20`}
      >
        <Linkedin className="w-4 h-4" aria-hidden="true" />
        לינקדאין
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        aria-label="העתק קישור"
        className={`${btnBase} bg-secondary text-secondary-foreground hover:bg-secondary/80`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
            הועתק!
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" aria-hidden="true" />
            העתק קישור
          </>
        )}
      </button>
    </div>
  );
};

export default ShareButtons;
