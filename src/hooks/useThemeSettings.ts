import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useThemeSettings = () => {
  const { data: settings } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["primary_color", "secondary_color", "button_radius"]);

      if (error) throw error;

      const settingsMap: Record<string, string | null> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply primary color (convert hex to HSL)
    if (settings.primary_color) {
      const hsl = hexToHsl(settings.primary_color);
      if (hsl) {
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--primary-foreground", "210 40% 98%");
      }
    }

    // Apply secondary color
    if (settings.secondary_color) {
      const hsl = hexToHsl(settings.secondary_color);
      if (hsl) {
        root.style.setProperty("--secondary", hsl);
      }
    }

    // Apply button radius
    if (settings.button_radius) {
      root.style.setProperty("--radius", settings.button_radius);
    }
  }, [settings]);

  return settings;
};

// Convert hex color to HSL format (without hsl() wrapper)
function hexToHsl(hex: string): string | null {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
