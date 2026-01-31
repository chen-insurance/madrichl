import { useEffect } from "react";

interface TrafficData {
  [key: string]: string | undefined;
}

const STORAGE_KEY = "traffic_data";

/**
 * Global hook that captures traffic source data from URL parameters
 * and stores it in localStorage for lead attribution.
 * 
 * Uses "Last Click" attribution model:
 * - If URL has UTM params → Overwrite existing data (new source wins)
 * - If URL has NO UTMs → Keep existing data (preserve original source)
 * 
 * localStorage persists across browser sessions for long-term tracking.
 */
export const useTrafficSource = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if current URL has any UTM or ad click params
    const hasNewUtms = 
      urlParams.has("utm_source") ||
      urlParams.has("utm_medium") ||
      urlParams.has("utm_campaign") ||
      urlParams.has("gclid") ||
      urlParams.has("fbclid");

    // If no new UTMs in URL, keep existing localStorage data
    if (!hasNewUtms) {
      return;
    }

    // New UTMs detected - overwrite with fresh attribution data
    const trafficData: TrafficData = {};

    // UTM parameters
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");
    const utmTerm = urlParams.get("utm_term");
    const utmContent = urlParams.get("utm_content");

    if (utmSource) trafficData.utm_source = utmSource;
    if (utmMedium) trafficData.utm_medium = utmMedium;
    if (utmCampaign) trafficData.utm_campaign = utmCampaign;
    if (utmTerm) trafficData.utm_term = utmTerm;
    if (utmContent) trafficData.utm_content = utmContent;

    // Ad platform click IDs
    const gclid = urlParams.get("gclid");
    const fbclid = urlParams.get("fbclid");

    if (gclid) trafficData.gclid = gclid;
    if (fbclid) trafficData.fbclid = fbclid;

    // Capture referrer
    if (document.referrer) {
      trafficData.referrer = document.referrer;
    }

    // Capture landing page and timestamp
    trafficData.landing_page = window.location.pathname + window.location.search;
    trafficData.captured_at = new Date().toISOString();

    // Overwrite localStorage with new attribution data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trafficData));
  }, []);
};

/**
 * Utility function to get stored traffic data from localStorage
 */
export const getTrafficData = (): Record<string, string | undefined> | null => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return null;
  
  try {
    return JSON.parse(storedData);
  } catch {
    return null;
  }
};

export default useTrafficSource;
