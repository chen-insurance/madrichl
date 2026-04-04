import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate unique session ID
const generateSessionId = (): string => {
  const existing = sessionStorage.getItem("analytics_session_id");
  if (existing) return existing;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem("analytics_session_id", newId);
  return newId;
};

interface UseContentTrackerOptions {
  articleId: string;
  enabled?: boolean;
}

export const useContentTracker = ({ articleId, enabled = true }: UseContentTrackerOptions) => {
  const sessionId = useRef(generateSessionId());
  const startTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const hasTrackedScroll = useRef<Set<number>>(new Set());
  const hasSentTimeOnPage = useRef(false);
  const rafRef = useRef<number | null>(null);

  const trackEvent = useCallback(async (eventType: string, value: number) => {
    if (!enabled || !articleId) return;
    
    try {
      await supabase.from("analytics_events").insert({
        session_id: sessionId.current,
        article_id: articleId,
        event_type: eventType,
        value,
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }, [articleId, enabled]);

  const sendTimeOnPage = useCallback(async () => {
    if (hasSentTimeOnPage.current || !enabled || !articleId) return;
    
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    if (timeSpent > 0) {
      hasSentTimeOnPage.current = true;
      await trackEvent("time_on_page", timeSpent);
    }
  }, [articleId, enabled, trackEvent]);

  const handleScroll = useCallback(() => {
    if (!enabled) return;
    // Throttle: skip if a rAF is already scheduled
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercent);

      // Track milestone depths: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !hasTrackedScroll.current.has(milestone)) {
          hasTrackedScroll.current.add(milestone);
          trackEvent("scroll_depth", milestone);
        }
      }
    });
  }, [enabled, trackEvent]);

  useEffect(() => {
    if (!enabled || !articleId) return;
    
    // Reset refs for new article
    startTime.current = Date.now();
    maxScrollDepth.current = 0;
    hasTrackedScroll.current = new Set();
    hasSentTimeOnPage.current = false;
    
    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Track time on page when leaving
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendTimeOnPage();
      }
    };
    
    const handleBeforeUnload = () => {
      sendTimeOnPage();
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendTimeOnPage();
    };
  }, [articleId, enabled, handleScroll, sendTimeOnPage]);
};
