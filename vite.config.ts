import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Vite plugin: converts CSS <link> tags to non-render-blocking async loads.
 * Safe because index.html already has inline critical CSS for the skeleton shell.
 */
function asyncCssPlugin(): Plugin {
  return {
    name: "async-css",
    enforce: "post",
    transformIndexHtml(html) {
      // Convert <link rel="stylesheet" href="..."> to async pattern
      // media="print" prevents render-blocking; onload switches to "all"
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        `<link rel="stylesheet" href="$1" media="print" onload="this.media='all'" crossorigin>
<noscript><link rel="stylesheet" href="$1" crossorigin></noscript>`
      );
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
