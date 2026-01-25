import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHeadScripts = () => {
  const { data: settings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "head_scripts")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (settings?.value) {
      // Create a container for dynamic scripts
      const containerId = "dynamic-head-scripts";
      let container = document.getElementById(containerId);
      
      // Remove existing container if it exists
      if (container) {
        container.remove();
      }
      
      // Create new container
      container = document.createElement("div");
      container.id = containerId;
      container.style.display = "none";
      document.head.appendChild(container);
      
      // Parse and inject scripts
      const temp = document.createElement("div");
      temp.innerHTML = settings.value;
      
      // Process all elements
      Array.from(temp.children).forEach((child) => {
        if (child.tagName === "SCRIPT") {
          const script = document.createElement("script");
          Array.from(child.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.textContent = child.textContent;
          document.head.appendChild(script);
        } else {
          // For meta tags, link tags, etc.
          const clone = child.cloneNode(true) as Element;
          document.head.appendChild(clone);
        }
      });
    }
    
    return () => {
      // Cleanup on unmount
      const container = document.getElementById("dynamic-head-scripts");
      if (container) {
        container.remove();
      }
    };
  }, [settings?.value]);
};
