import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate a simple visitor hash based on browser fingerprint
const generateVisitorHash = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const useArticleView = (articleId: string | undefined) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!articleId || hasTracked.current) return;

    const trackView = async () => {
      try {
        const visitorHash = generateVisitorHash();
        
        const { error } = await supabase.functions.invoke("track-view", {
          body: {
            article_id: articleId,
            visitor_hash: visitorHash,
          },
        });

        if (error) {
          console.error("Error tracking view:", error);
        } else {
          hasTracked.current = true;
        }
      } catch (err) {
        console.error("Failed to track article view:", err);
      }
    };

    // Small delay to ensure page is fully loaded
    const timeout = setTimeout(trackView, 1000);
    return () => clearTimeout(timeout);
  }, [articleId]);
};
