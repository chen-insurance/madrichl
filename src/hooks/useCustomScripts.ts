import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";
import { validateScriptElement } from "@/lib/script-validator";

/**
 * Injects custom head and body scripts from site_settings.
 * Now reads from consolidated useSiteSettings hook (single query).
 */
export const useCustomScripts = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const headScripts = settings?.head_scripts;
    const bodyScripts = settings?.body_scripts;

    // === Inject HEAD scripts ===
    if (headScripts) {
      const containerId = "custom-head-scripts";
      let existingContainer = document.getElementById(containerId);
      if (existingContainer) existingContainer.remove();

      const temp = document.createElement("div");
      temp.innerHTML = headScripts;

      Array.from(temp.children).forEach((child) => {
        if (!validateScriptElement(child)) {
          console.warn("[Security] Blocked untrusted script source:", child.getAttribute("src"));
          return;
        }
        if (child.tagName === "SCRIPT") {
          const script = document.createElement("script");
          Array.from(child.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.textContent = child.textContent;
          script.id = containerId + "-" + Math.random().toString(36).substr(2, 9);
          document.head.appendChild(script);
        } else {
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
      if (existingContainer) existingContainer.remove();

      const container = document.createElement("div");
      container.id = containerId;
      container.style.display = "none";

      const temp = document.createElement("div");
      temp.innerHTML = bodyScripts;

      Array.from(temp.children).forEach((child) => {
        if (!validateScriptElement(child)) {
          console.warn("[Security] Blocked untrusted script source:", child.getAttribute("src"));
          return;
        }
        if (child.tagName === "SCRIPT") {
          const script = document.createElement("script");
          Array.from(child.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.textContent = child.textContent;
          container.appendChild(script);
        } else {
          const clone = child.cloneNode(true) as Element;
          container.appendChild(clone);
        }
      });

      if (document.body.firstChild) {
        document.body.insertBefore(container, document.body.firstChild);
      } else {
        document.body.appendChild(container);
      }
    }

    return () => {
      document.querySelectorAll("[data-custom-script]").forEach((el) => el.remove());
      const bodyContainer = document.getElementById("custom-body-scripts");
      if (bodyContainer) bodyContainer.remove();
    };
  }, [settings]);
};
