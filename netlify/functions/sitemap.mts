import type { Config } from "@netlify/functions";

const SUPABASE_HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";

const SITE_URL = "https://the-guide.co.il";

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/blog", priority: "0.9", changefreq: "daily" },
  { url: "/calculators", priority: "0.8", changefreq: "monthly" },
  { url: "/glossary", priority: "0.7", changefreq: "weekly" },
  { url: "/contact", priority: "0.6", changefreq: "monthly" },
  { url: "/health-insurance", priority: "0.8", changefreq: "weekly" },
  { url: "/life-insurance", priority: "0.8", changefreq: "weekly" },
  { url: "/car-insurance", priority: "0.8", changefreq: "weekly" },
  { url: "/property-insurance", priority: "0.8", changefreq: "weekly" },
  { url: "/pension", priority: "0.8", changefreq: "weekly" },
  { url: "/employer-insurance", priority: "0.8", changefreq: "weekly" },
];

function esc(str: string) {
  return str.replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler() {
  // Fetch articles
  const articlesRes = await fetch(
    `https://${SUPABASE_HOST}/rest/v1/articles?select=slug,updated_at,published_at&is_published=eq.true&order=published_at.desc&limit=500`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
  );
  const articles: { slug: string; updated_at: string; published_at: string }[] =
    articlesRes.ok ? await articlesRes.json() : [];

  // Fetch glossary terms
  const glossaryRes = await fetch(
    `https://${SUPABASE_HOST}/rest/v1/glossary_terms?select=slug,updated_at&limit=500`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
  );
  const glossaryTerms: { slug: string; updated_at: string }[] =
    glossaryRes.ok ? await glossaryRes.json() : [];

  const today = new Date().toISOString().split("T")[0];

  const urls: string[] = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    urls.push(`  <url>
    <loc>${SITE_URL}${esc(page.url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Articles
  for (const article of articles) {
    const lastmod = (article.updated_at || article.published_at || today).split("T")[0];
    urls.push(`  <url>
    <loc>${SITE_URL}/news/${esc(article.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Glossary terms
  for (const term of glossaryTerms) {
    const lastmod = (term.updated_at || today).split("T")[0];
    urls.push(`  <url>
    <loc>${SITE_URL}/glossary/${esc(term.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export const config: Config = {
  path: "/sitemap.xml",
};
