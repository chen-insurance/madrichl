import { useEffect } from "react";

interface TrafficData {
  [key: string]: string | undefined;
}

const STORAGE_KEY = "traffic_data";

/**
 * Global hook that captures traffic source data from URL parameters
 * and stores it in sessionStorage for lead attribution.
 * Runs once when the app loads and preserves data across navigation.
 */
export const useTrafficSource = () => {
  useEffect(() => {
    // Check if we already have traffic data stored
    const existingData = sessionStorage.getItem(STORAGE_KEY);
    
    // Only capture on first visit (don't overwrite existing data)
    if (existingData) {
      return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Build traffic data object
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

    // Capture landing page
    trafficData.landing_page = window.location.pathname + window.location.search;
    trafficData.captured_at = new Date().toISOString();

    // Store the data
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trafficData));
  }, []);
};

/**
 * Utility function to get stored traffic data
 */
export const getTrafficData = (): Record<string, string | undefined> | null => {
  const storedData = sessionStorage.getItem(STORAGE_KEY);
  if (!storedData) return null;
  
  try {
    return JSON.parse(storedData);
  } catch {
    return null;
  }
};

export default useTrafficSource;
