/**
 * Netlify Edge Function: Bot Prerendering
 * Detects search engine / social media crawlers and returns
 * server-rendered HTML with full meta tags and content,
 * so bots don't need to execute JS.
 */

const BOT_UA_REGEX =
  /googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|pinterestbot|redditbot|discordbot|ia_archiver/i;

const SUPABASE_URL = "https://awxmwvyoellhdhgvxife.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";

const SITE = "https://the-guide.co.il";

// ── helpers ──────────────────────────────────────────────
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stripMarkdown(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/[*_~`>]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Extract FAQ items from markdown H3 headings ending with ? */
function extractFAQFromContent(content: string): Array<{question: string; answer: string}> {
  if (!content) return [];
  const lines = content.split("\n");
  const faqs: Array<{question: string; answer: string}> = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const h3Match = line.match(/^###\s+(.+\?)\s*$/);
    if (h3Match) {
      const question = h3Match[1].trim();
      const answerParts: string[] = [];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) {
          if (answerParts.length > 0 && i + 1 < lines.length && lines[i + 1].trim() === "") break;
          i++;
          continue;
        }
        if (next.startsWith("#")) break;
        answerParts.push(next);
        i++;
      }
      if (answerParts.length > 0) {
        faqs.push({ question, answer: answerParts.join(" ") });
      }
    } else {
      i++;
    }
  }
  return faqs;
}

async function supabaseGet(table: string, query: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

// ── page renderers ───────────────────────────────────────
async function renderArticle(slug: string): Promise<string | null> {
  const rows = await supabaseGet(
    "articles",
    `slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=title,excerpt,seo_title,seo_description,featured_image,image_alt_text,content,published_at,updated_at,author_name,category,faq_items&limit=1`
  );
  if (!rows || rows.length === 0) return null;
  const a = rows[0];

  const title = escapeHtml(a.seo_title || a.title);
  const desc = escapeHtml(a.seo_description || a.excerpt || "");
  const image = a.featured_image || `${SITE}/og-default.png`;
  const url = `${SITE}/news/${slug}`;
  const plainContent = stripMarkdown(a.content || "").slice(0, 5000);

  // FAQ structured data: merge manual + auto-detected from H3 questions
  const manualFAQ: Array<{question: string; answer: string}> = 
    a.faq_items && Array.isArray(a.faq_items) ? a.faq_items : [];
  const autoFAQ = extractFAQFromContent(a.content || "");
  const manualQuestions = new Set(manualFAQ.map((f: any) => f.question));
  const allFAQ = [...manualFAQ, ...autoFAQ.filter(f => !manualQuestions.has(f.question))];

  let faqSchema = "";
  if (allFAQ.length > 0) {
    const faqLD = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: allFAQ.map((f: any) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    };
    faqSchema = `<script type="application/ld+json">${JSON.stringify(faqLD)}</script>`;
  }

  // Article structured data
  const articleLD = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.excerpt || "",
    image,
    datePublished: a.published_at || a.updated_at,
    dateModified: a.updated_at,
    inLanguage: "he",
    author: { "@type": "Person", name: a.author_name || "מערכת המדריך" },
    publisher: {
      "@type": "Organization",
      name: "המדריך לצרכן",
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return buildHtml({
    title: `${title} | המדריך לצרכן`,
    desc,
    image,
    url,
    extraHead: `
      <script type="application/ld+json">${JSON.stringify(articleLD)}</script>
      ${faqSchema}
      <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ראשי", item: SITE },
          ...(a.category ? [{ "@type": "ListItem", position: 2, name: a.category, item: `${SITE}/category/${encodeURIComponent(a.category)}` }] : []),
          { "@type": "ListItem", position: a.category ? 3 : 2, name: a.title, item: url },
        ],
      })}</script>
    `,
    body: `
      <header><nav><a href="${SITE}">המדריך לצרכן</a></nav></header>
      <main>
        <article>
          <h1>${escapeHtml(a.title)}</h1>
          ${a.excerpt ? `<p><strong>${escapeHtml(a.excerpt)}</strong></p>` : ""}
          ${a.author_name ? `<p>מאת: ${escapeHtml(a.author_name)}</p>` : ""}
          ${a.category ? `<p>קטגוריה: ${escapeHtml(a.category)}</p>` : ""}
          <div>${escapeHtml(plainContent)}</div>
          ${allFAQ.length > 0 ? `<section><h2>שאלות נפוצות</h2>${allFAQ.map((f: any) => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`).join("")}</section>` : ""}
        </article>
      </main>
    `,
  });
}

async function renderCategory(slug: string): Promise<string | null> {
  const cats = await supabaseGet(
    "categories",
    `slug=eq.${encodeURIComponent(slug)}&select=name,description&limit=1`
  );
  if (!cats || cats.length === 0) return null;
  const cat = cats[0];

  const articles = await supabaseGet(
    "articles",
    `category=eq.${encodeURIComponent(cat.name)}&is_published=eq.true&select=title,slug,excerpt,published_at&order=published_at.desc&limit=20`
  );

  const url = `${SITE}/category/${slug}`;
  const articleLinks = (articles || [])
    .map((a: any) => `<li><a href="${SITE}/news/${a.slug}">${escapeHtml(a.title)}</a>${a.excerpt ? ` - ${escapeHtml(a.excerpt)}` : ""}</li>`)
    .join("");

  return buildHtml({
    title: `${escapeHtml(cat.name)} | המדריך לצרכן`,
    desc: escapeHtml(cat.description || `כתבות בנושא ${cat.name}`),
    url,
    body: `
      <header><nav><a href="${SITE}">המדריך לצרכן</a></nav></header>
      <main>
        <h1>${escapeHtml(cat.name)}</h1>
        ${cat.description ? `<p>${escapeHtml(cat.description)}</p>` : ""}
        <ul>${articleLinks}</ul>
      </main>
    `,
  });
}

async function renderHomepage(): Promise<string> {
  const articles = await supabaseGet(
    "articles",
    "is_published=eq.true&select=title,slug,excerpt,category,published_at&order=published_at.desc&limit=20"
  );

  const articleLinks = (articles || [])
    .map((a: any) => `<li><a href="${SITE}/news/${a.slug}">${escapeHtml(a.title)}</a>${a.excerpt ? ` - ${escapeHtml(a.excerpt)}` : ""}</li>`)
    .join("");

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "המדריך לצרכן",
    alternateName: ["The Guide", "המדריך"],
    url: SITE,
    inLanguage: "he",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/blog?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "המדריך לצרכן",
    url: SITE,
    logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    sameAs: [],
  };

  return buildHtml({
    title: "המדריך לצרכן | מגזין ביטוח ופיננסים",
    desc: "המדריך לצרכן - המקור המהימן שלך למידע על ביטוח ופיננסים בישראל. מדריכים, חדשות וניתוחים לטובת הצרכן.",
    url: SITE,
    extraHead: `
      <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">${JSON.stringify(orgSchema)}</script>
    `,
    body: `
      <header><nav><a href="${SITE}">המדריך לצרכן</a></nav></header>
      <main>
        <h1>המדריך לצרכן - מגזין ביטוח ופיננסים</h1>
        <p>המקור המהימן שלך למידע על ביטוח ופיננסים בישראל</p>
        <h2>כתבות אחרונות</h2>
        <ul>${articleLinks}</ul>
      </main>
    `,
  });
}

async function renderGlossary(termSlug?: string): Promise<string | null> {
  if (termSlug) {
    const terms = await supabaseGet(
      "glossary_terms",
      `slug=eq.${encodeURIComponent(termSlug)}&select=term_name,definition_rich_text,seo_title,seo_description&limit=1`
    );
    if (!terms || terms.length === 0) return null;
    const t = terms[0];
    return buildHtml({
      title: `${escapeHtml(t.seo_title || t.term_name)} | מילון מונחים`,
      desc: escapeHtml(t.seo_description || `הגדרה של ${t.term_name}`),
      url: `${SITE}/glossary/${termSlug}`,
      body: `
        <header><nav><a href="${SITE}">המדריך לצרכן</a></nav></header>
        <main>
          <h1>${escapeHtml(t.term_name)}</h1>
          <div>${stripMarkdown(t.definition_rich_text || "")}</div>
        </main>
      `,
    });
  }
  // Glossary index
  const terms = await supabaseGet("glossary_terms", "select=term_name,slug&order=term_name.asc&limit=200");
  const termLinks = (terms || [])
    .map((t: any) => `<li><a href="${SITE}/glossary/${t.slug}">${escapeHtml(t.term_name)}</a></li>`)
    .join("");
  return buildHtml({
    title: "מילון מונחים | המדריך לצרכן",
    desc: "מילון מונחים בתחום הביטוח והפיננסים - הסברים פשוטים למושגים מורכבים",
    url: `${SITE}/glossary`,
    body: `
      <header><nav><a href="${SITE}">המדריך לצרכן</a></nav></header>
      <main><h1>מילון מונחים</h1><ul>${termLinks}</ul></main>
    `,
  });
}

// ── HTML template ────────────────────────────────────────
function buildHtml(opts: {
  title: string;
  desc: string;
  url: string;
  image?: string;
  extraHead?: string;
  body: string;
}): string {
  const img = opts.image || `${SITE}/og-default.png`;
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.title}</title>
  <meta name="description" content="${opts.desc}">
  <link rel="canonical" href="${opts.url}">
  <meta property="og:title" content="${opts.title}">
  <meta property="og:description" content="${opts.desc}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${opts.url}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="he_IL">
  <meta property="og:site_name" content="המדריך לצרכן">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${opts.title}">
  <meta name="twitter:description" content="${opts.desc}">
  <meta name="twitter:image" content="${img}">
  ${opts.extraHead || ""}
</head>
<body style="font-family:Heebo,sans-serif;direction:rtl;max-width:800px;margin:0 auto;padding:20px">
  ${opts.body}
</body>
</html>`;
}

// ── main handler ─────────────────────────────────────────
export default async function handler(request: Request) {
  const ua = request.headers.get("user-agent") || "";

  // Only intercept bot requests
  if (!BOT_UA_REGEX.test(ua)) {
    return; // pass through to SPA
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    let html: string | null = null;

    // Route matching
    if (path === "/" || path === "") {
      html = await renderHomepage();
    } else if (path.startsWith("/news/")) {
      const slug = path.replace("/news/", "").replace(/\/$/, "");
      if (slug) html = await renderArticle(slug);
    } else if (path.startsWith("/category/")) {
      const slug = decodeURIComponent(path.replace("/category/", "").replace(/\/$/, ""));
      if (slug) html = await renderCategory(slug);
    } else if (path === "/glossary" || path === "/glossary/") {
      html = await renderGlossary();
    } else if (path.startsWith("/glossary/")) {
      const slug = path.replace("/glossary/", "").replace(/\/$/, "");
      if (slug) html = await renderGlossary(slug);
    }

    if (html) {
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Prerendered": "true",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }
  } catch (e) {
    console.error("Prerender error:", e);
  }

  // Fall through to SPA for unmatched routes or errors
  return;
}

export const config = {
  path: ["/*"],
};
