import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single consolidated query for ALL site_settings used on the public site.
 * Replaces separate queries in useCustomScripts, useTrackingPixels, and useThemeSettings.
 */
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["all-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "head_scripts",
          "body_scripts",
          "facebook_pixel_id",
          "gtm_id",
          "primary_color",
          "secondary_color",
          "button_radius",
        ]);
      if (error) throw error;

      const map: Record<string, string> = {};
      data?.forEach((item) => {
        if (item.value) map[item.key] = item.value;
      });
      return map;
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
};
