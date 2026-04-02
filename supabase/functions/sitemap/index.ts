import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://the-guide.co.il",
  "https://www.the-guide.co.il",
  "https://madrichl.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all published articles
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
    }

    // Fetch all categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("slug, updated_at");

    if (catError) {
      console.error("Error fetching categories:", catError);
    }

    // Fetch all published static pages
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (pagesError) {
      console.error("Error fetching pages:", pagesError);
    }

    // Fetch all glossary terms
    const { data: glossaryTerms, error: glossaryError } = await supabase
      .from("glossary_terms")
      .select("slug, updated_at");

    if (glossaryError) {
      console.error("Error fetching glossary terms:", glossaryError);
    }

    // Base URL - production domain
    const baseUrl = "https://the-guide.co.il";
    const now = new Date().toISOString().split("T")[0];

    // Generate XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Contact Page -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Glossary Index -->
  <url>
    <loc>${baseUrl}/glossary</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
 </url>
   
   <!-- Blog Archive -->
   <url>
     <loc>${baseUrl}/blog</loc>
     <lastmod>${now}</lastmod>
     <changefreq>daily</changefreq>
     <priority>0.9</priority>
   </url>
   
   <!-- Life Insurance Calculator -->
   <url>
     <loc>${baseUrl}/calculators/life</loc>
     <lastmod>${now}</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.7</priority>
   </url>`;

    // Add published static pages (from pages table)
    if (pages && pages.length > 0) {
      for (const page of pages) {
        const lastmod = page.updated_at 
          ? new Date(page.updated_at).toISOString().split("T")[0]
          : now;
        
        xml += `
  
  <!-- Page: ${page.slug} -->
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    // Add category pages
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const lastmod = category.updated_at 
          ? new Date(category.updated_at).toISOString().split("T")[0]
          : now;
        
        xml += `
  
  <!-- Category: ${category.slug} -->
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Add article pages
    if (articles && articles.length > 0) {
      for (const article of articles) {
        const lastmod = article.updated_at 
          ? new Date(article.updated_at).toISOString().split("T")[0]
          : article.published_at 
            ? new Date(article.published_at).toISOString().split("T")[0]
            : now;
        
        xml += `
  
  <!-- Article: ${article.slug} -->
  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    // Add glossary term pages
    if (glossaryTerms && glossaryTerms.length > 0) {
      for (const term of glossaryTerms) {
        const lastmod = term.updated_at 
          ? new Date(term.updated_at).toISOString().split("T")[0]
          : now;
        
        xml += `
  
  <!-- Glossary: ${term.slug} -->
  <url>
    <loc>${baseUrl}/glossary/${term.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
      }
    }

    xml += `
</urlset>`;

    console.log(`Generated sitemap with ${articles?.length || 0} articles, ${categories?.length || 0} categories, ${pages?.length || 0} pages, ${glossaryTerms?.length || 0} glossary terms`);

    return new Response(xml, {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://the-guide.co.il/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
});
