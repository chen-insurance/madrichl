import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to escape XML special characters
function escapeXml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper to format date for RSS (RFC 822)
function formatRssDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

// Helper to strip HTML/markdown and truncate for description
function createDescription(content: string, maxLength: number = 300): string {
  if (!content) return "";
  // Remove markdown/HTML tags
  const stripped = content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\n+/g, " ")
    .trim();
  
  if (stripped.length <= maxLength) return escapeXml(stripped);
  return escapeXml(stripped.substring(0, maxLength).trim() + "...");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all published articles ordered by date
    const { data: articles, error } = await supabase
      .from("articles")
      .select("title, slug, excerpt, content, featured_image, author_name, category, published_at, updated_at")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(50); // Limit to 50 most recent for RSS

    if (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }

    // Site configuration
    const baseUrl = "https://hamadrikh.co.il";
    const siteName = "המדריך לצרכן";
    const siteDescription = "מידע מקצועי ואובייקטיבי בתחום הביטוח והפיננסים";
    const language = "he";

    // Build date - use most recent article or now
    const lastBuildDate = articles && articles.length > 0 
      ? formatRssDate(articles[0].published_at || articles[0].updated_at)
      : new Date().toUTCString();

    // Generate RSS XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>${language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/functions/v1/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>${escapeXml(siteName)}</title>
      <link>${baseUrl}</link>
    </image>`;

    // Add items for each article
    if (articles && articles.length > 0) {
      for (const article of articles) {
        const articleUrl = `${baseUrl}/news/${article.slug}`;
        const pubDate = article.published_at 
          ? formatRssDate(article.published_at)
          : formatRssDate(article.updated_at);
        
        // Use excerpt if available, otherwise create from content
        const description = article.excerpt 
          ? escapeXml(article.excerpt)
          : createDescription(article.content || "");

        xml += `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>`;

        if (article.author_name) {
          xml += `
      <author>${escapeXml(article.author_name)}</author>`;
        }

        if (article.category) {
          xml += `
      <category>${escapeXml(article.category)}</category>`;
        }

        if (article.featured_image) {
          xml += `
      <enclosure url="${escapeXml(article.featured_image)}" type="image/jpeg"/>`;
        }

        xml += `
    </item>`;
      }
    }

    xml += `
  </channel>
</rss>`;

    console.log(`Generated RSS feed with ${articles?.length || 0} articles`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800", // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>המדריך לצרכן</title>
    <link>https://hamadrikh.co.il</link>
    <description>מידע מקצועי ואובייקטיבי בתחום הביטוח והפיננסים</description>
  </channel>
</rss>`,
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/rss+xml; charset=utf-8",
        },
      }
    );
  }
});
