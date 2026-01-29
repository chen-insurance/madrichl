import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all published articles
    const { data: articles, error } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }

    // Fetch all categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("slug, updated_at");

    if (catError) {
      console.error("Error fetching categories:", catError);
    }

    // Base URL - update this to your production domain
    const baseUrl = "https://hamadrikh.co.il";

    // Generate XML sitemap
    const now = new Date().toISOString().split("T")[0];
    
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
  </url>`;

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

    xml += `
</urlset>`;

    console.log(`Generated sitemap with ${articles?.length || 0} articles and ${categories?.length || 0} categories`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hamadrikh.co.il/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
});
