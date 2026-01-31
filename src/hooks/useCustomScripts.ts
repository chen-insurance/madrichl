import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to inject custom head and body scripts from site_settings.
 * This replaces both useHeadScripts and useTrackingPixels for a unified approach.
 */
export const useCustomScripts = () => {
  const { data: settings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["head_scripts", "body_scripts"]);
      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      return settingsMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    const headScripts = settings?.head_scripts;
    const bodyScripts = settings?.body_scripts;

    // === Inject HEAD scripts ===
    if (headScripts) {
      const containerId = "custom-head-scripts";
      let existingContainer = document.getElementById(containerId);

      // Remove existing container if it exists
      if (existingContainer) {
        existingContainer.remove();
      }

      // Parse and inject scripts into head
      const temp = document.createElement("div");
      temp.innerHTML = headScripts;

      Array.from(temp.children).forEach((child) => {
        if (child.tagName === "SCRIPT") {
          const script = document.createElement("script");
          // Copy all attributes
          Array.from(child.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.textContent = child.textContent;
          script.id = containerId + "-" + Math.random().toString(36).substr(2, 9);
          document.head.appendChild(script);
        } else {
          // For meta tags, link tags, etc.
          const clone = child.cloneNode(true) as Element;
          clone.setAttribute("data-custom-script", "true");
          document.head.appendChild(clone);
        }
      });
    }

    // === Inject BODY scripts ===
    if (bodyScripts) {
      const containerId = "custom-body-scripts";
      let existingContainer = document.getElementById(containerId);

      // Remove existing container if it exists
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create container for body scripts
      const container = document.createElement("div");
      container.id = containerId;
      container.style.display = "none";

      // Parse and inject into body (at the start)
      const temp = document.createElement("div");
      temp.innerHTML = bodyScripts;

      Array.from(temp.children).forEach((child) => {
        if (child.tagName === "SCRIPT") {
          const script = document.createElement("script");
          Array.from(child.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.textContent = child.textContent;
          container.appendChild(script);
        } else {
          // For noscript tags, iframes, etc.
          const clone = child.cloneNode(true) as Element;
          container.appendChild(clone);
        }
      });

      // Insert at the beginning of body
      if (document.body.firstChild) {
        document.body.insertBefore(container, document.body.firstChild);
      } else {
        document.body.appendChild(container);
      }
    }

    return () => {
      // Cleanup custom head elements
      document.querySelectorAll("[data-custom-script]").forEach((el) => el.remove());
      // Cleanup body container
      const bodyContainer = document.getElementById("custom-body-scripts");
      if (bodyContainer) {
        bodyContainer.remove();
      }
    };
  }, [settings]);
};
