import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://the-guide.co.il";

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/glossary", changefreq: "weekly", priority: "0.6" },
  { path: "/calculators/life", changefreq: "monthly", priority: "0.7" },
];

function buildUrl(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildSitemap(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parallel queries
    const [articlesRes, categoriesRes, pagesRes, glossaryRes] = await Promise.all([
      supabase.from("articles").select("slug, updated_at, published_at").eq("is_published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }),
      supabase.from("categories").select("slug, updated_at"),
      supabase.from("pages").select("slug, updated_at").eq("is_published", true),
      supabase.from("glossary_terms").select("slug, updated_at"),
    ]);

    const urls: string[] = [];

    // Static routes
    for (const r of STATIC_ROUTES) {
      urls.push(buildUrl(`${BASE_URL}${r.path}`, today, r.changefreq, r.priority));
    }

    // Pages
    for (const p of pagesRes.data || []) {
      const mod = p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : today;
      urls.push(buildUrl(`${BASE_URL}/${p.slug}`, mod, "monthly", "0.6"));
    }

    // Categories
    for (const c of categoriesRes.data || []) {
      const mod = c.updated_at ? new Date(c.updated_at).toISOString().split("T")[0] : today;
      urls.push(buildUrl(`${BASE_URL}/category/${c.slug}`, mod, "daily", "0.8"));
    }

    // Articles
    for (const a of articlesRes.data || []) {
      const mod = a.updated_at ? new Date(a.updated_at).toISOString().split("T")[0] : a.published_at ? new Date(a.published_at).toISOString().split("T")[0] : today;
      urls.push(buildUrl(`${BASE_URL}/news/${a.slug}`, mod, "weekly", "0.7"));
    }

    // Glossary
    for (const g of glossaryRes.data || []) {
      const mod = g.updated_at ? new Date(g.updated_at).toISOString().split("T")[0] : today;
      urls.push(buildUrl(`${BASE_URL}/glossary/${g.slug}`, mod, "monthly", "0.5"));
    }

    console.log(`Sitemap: ${articlesRes.data?.length || 0} articles, ${categoriesRes.data?.length || 0} categories, ${pagesRes.data?.length || 0} pages, ${glossaryRes.data?.length || 0} glossary`);

    return new Response(buildSitemap(urls), {
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    const fallback = STATIC_ROUTES.map(r => buildUrl(`${BASE_URL}${r.path}`, today, r.changefreq, r.priority));
    return new Response(buildSitemap(fallback), {
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
    });
  }
});
