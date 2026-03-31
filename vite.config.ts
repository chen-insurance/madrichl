import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Vite plugin: 
 * 1. Converts CSS <link> tags to non-render-blocking async loads
 * 2. Adds modulepreload hints for critical vendor chunks (react, query, supabase)
 */
function performancePlugin(): Plugin {
  return {
    name: "performance-hints",
    enforce: "post",
    transformIndexHtml(html) {
      // 1. Async CSS: media="print" prevents render-blocking; onload switches to "all"
      let result = html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        `<link rel="stylesheet" href="$1" media="print" onload="this.media='all'" crossorigin>
<noscript><link rel="stylesheet" href="$1" crossorigin></noscript>`
      );

      // 2. Find critical chunks and add modulepreload hints
      const criticalChunks = ["vendor-react", "vendor-query", "vendor-supabase"];
      const modulePreloadRegex = /<link rel="modulepreload" crossorigin href="(\/assets\/[^"]+\.js)">/g;
      const preloadHints: string[] = [];
      let match;

      while ((match = modulePreloadRegex.exec(result)) !== null) {
        const href = match[1];
        if (criticalChunks.some(chunk => href.includes(chunk))) {
          // Upgrade from modulepreload to high-priority preload
          preloadHints.push(`<link rel="preload" href="${href}" as="script" crossorigin>`);
        }
      }

      // Inject preload hints right after <head> opening for earliest discovery
      if (preloadHints.length > 0) {
        const headTag = '<meta charset="UTF-8" />';
        result = result.replace(
          headTag,
          `${headTag}\n    ${preloadHints.join("\n    ")}`
        );
      }

      return result;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), asyncCssPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data fetching
          "vendor-query": ["@tanstack/react-query"],
          // UI primitives (shared across pages)
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-accordion",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
          ],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // Markdown rendering
          "vendor-markdown": ["react-markdown"],
          // Rich text editor (admin only)
          "vendor-tiptap": [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-color",
            "@tiptap/extension-text-style",
            "@tiptap/extension-text-align",
            "@tiptap/extension-placeholder",
          ],
          // Charts (admin dashboard)
          "vendor-charts": ["recharts"],
          // Form validation (lazy-loaded with LeadForm)
          "vendor-forms": ["zod", "react-hook-form", "@hookform/resolvers"],
        },
      },
    },
  },
}));
