/**
 * seo-meta-boost.mjs
 * Updates titles + descriptions for high-potential articles
 */
import https from "https";
const HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN = "Ben951357s";

async function getArticle(slug) {
  return new Promise((resolve, reject) => {
    https.get(`https://${HOST}/rest/v1/articles?slug=eq.${slug}&select=id,slug,title,content,seo_title,seo_description`, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }, (res) => {
      let d = ""; res.setEncoding("utf8"); res.on("data", c => d += c); res.on("end", () => resolve(JSON.parse(d)[0] || null));
    }).on("error", reject);
  });
}

async function upsertArticle(article) {
  const buf = Buffer.from(JSON.stringify({ action: "upsert", article }), "utf8");
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: HOST, path: "/functions/v1/manage-article", method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "x-admin-secret": ADMIN, Authorization: `Bearer ${ANON}`, "Content-Length": buf.length } }, (res) => {
      let d = ""; res.setEncoding("utf8"); res.on("data", c => d += c);
      res.on("end", () => { const r = JSON.parse(d); if (res.statusCode === 200 && r.success) resolve(r.article); else reject(new Error(r.error || `${res.statusCode}: ${d}`)); });
    });
    req.on("error", reject); req.write(buf); req.end();
  });
}

async function updateMeta(slug, seo_title, seo_description) {
  const article = await getArticle(slug);
  if (!article) { console.log(`  \u2717 not found: ${slug}`); return; }
  await upsertArticle({ slug, title: article.title, content: article.content, seo_title, seo_description });
  console.log(`  \u2713 ${slug}`);
}

async function run() {
  console.log("\n\u2550\u2550 SEO Meta Boost ══\n");

  // home-insurance: position 5.1, 22 impressions, 0 clicks — CTR fix
  await updateMeta(
    "home-insurance-guide-2026",
    "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d3\u05d9\u05e8\u05d4 2026: \u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4, \u05de\u05d4 \u05db\u05d5\u05dc\u05dc \u05d5\u05d0\u05d9\u05da \u05dc\u05d7\u05e1\u05d5\u05da 40%",
    "\u05de\u05d7\u05d9\u05e8 \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d3\u05d9\u05e8\u05d4 2026: \u05d8\u05d5\u05d5\u05d7 \u05de\u05d7\u05d9\u05e8\u05d9\u05dd \u05de\u05e2\u05d3\u05db\u05df, \u05d4\u05e9\u05d5\u05d5\u05d0\u05ea \u05d4\u05e8\u05d0\u05dc, \u05de\u05d2\u05d3\u05dc \u05d5\u05de\u05e0\u05d5\u05e8\u05d4. \u05de\u05d1\u05e0\u05d4+\u05ea\u05db\u05d5\u05dc\u05d4+\u05e6\u05d3 \u05e9\u05dc\u05d9\u05e9\u05d9 \u2014 \u05de\u05d4 \u05d1\u05d3\u05d9\u05d5\u05e7 \u05d5\u05de\u05d4 \u05dc\u05d4\u05e9\u05de\u05d9\u05d8. \u05e7\u05d1\u05dc\u05d5 \u05d4\u05e6\u05e2\u05d4 \u05d7\u05d9\u05e0\u05de\u05d9\u05ea \u05d5\u05d7\u05e1\u05db\u05d5 \u05e2\u05d3 40%."
  );

  // psychologists: position 32.3, 28 impressions + broken encoding in description
  await updateMeta(
    "psychologists-professional-liability-insurance",
    "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea \u05dc\u05e4\u05e1\u05d9\u05db\u05d5\u05dc\u05d5\u05d2\u05d9\u05dd 2026 \u2014 \u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4 \u05d5\u05de\u05d4 \u05d7\u05d5\u05d1\u05d4 \u05dc\u05db\u05dc\u05d5\u05dc",
    "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea \u05dc\u05e4\u05e1\u05d9\u05db\u05d5\u05dc\u05d5\u05d2\u05d9\u05dd, \u05de\u05d8\u05e4\u05dc\u05d9\u05dd \u05d6\u05d5\u05d2\u05d9\u05d9\u05dd \u05d5\u05e2\u05d5\u05d1\u05d3\u05d9\u05dd \u05e1\u05d5\u05e6\u05d9\u05d0\u05dc\u05d9\u05d9\u05dd: \u05de\u05d7\u05d9\u05e8\u05d9\u05dd \u05de\u05e2\u05d3\u05db\u05e0\u05d9\u05dd, \u05de\u05d4 \u05d7\u05d9\u05d9\u05d1 \u05dc\u05db\u05dc\u05d5\u05dc, Claims Made \u05dc\u05e2\u05d5\u05de\u05ea Occurrence. \u05d4\u05e9\u05d5\u05d5\u05d5 \u05d5\u05d7\u05e1\u05db\u05d5 \u05e2\u05d5\u05d3 \u05d4\u05d9\u05d5\u05dd."
  );

  // life-insurance-mortgage: position 18.2, 23 impressions — emphasize calculator
  await updateMeta(
    "life-insurance-mortgage-guide-2026",
    "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d7\u05d9\u05d9\u05dd \u05dc\u05de\u05e9\u05db\u05e0\u05ea\u05d0 2026 + \u05de\u05d7\u05e9\u05d1\u05d5\u05df \u05d7\u05d9\u05e0\u05de\u05d9 \u2014 \u05db\u05de\u05d4 \u05ea\u05e9\u05dc\u05de\u05d5 \u05d1\u05d0\u05de\u05ea?",
    "\u05de\u05d7\u05e9\u05d1\u05d5\u05df \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d7\u05d9\u05d9\u05dd \u05dc\u05de\u05e9\u05db\u05e0\u05ea\u05d0: \u05d4\u05d6\u05d9\u05e0\u05d5 \u05d2\u05d9\u05dc, \u05e1\u05db\u05d5\u05dd \u05d4\u05dc\u05d5\u05d5\u05d0\u05d4 \u05d5\u05e7\u05d1\u05dc\u05d5 \u05de\u05d7\u05d9\u05e8 \u05de\u05d9\u05d9\u05d3\u05d9. \u05d4\u05d1\u05e0\u05e7 \u05d2\u05d5\u05d1\u05d4 30% \u05d9\u05d5\u05ea\u05e8 \u05de\u05d4\u05e9\u05d5\u05e7. \u05e8\u05db\u05e9\u05d5 \u05d1\u05e0\u05e4\u05e8\u05d3 \u05d5\u05d7\u05e1\u05db\u05d5 \u05de\u05d9\u05d3\u05d9\u05ea."
  );

  // life-insurance-price: position 25, query "מחיר ביטוח חיים"
  await updateMeta(
    "life-insurance-price-guide-2026",
    "\u05de\u05d7\u05d9\u05e8 \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d7\u05d9\u05d9\u05dd 2026 \u2014 \u05d8\u05d1\u05dc\u05d4 \u05de\u05e2\u05d3\u05db\u05e0\u05ea \u05dc\u05e4\u05d9 \u05d2\u05d9\u05dc, \u05de\u05d9\u05df \u05d5\u05e2\u05d9\u05e9\u05d5\u05df",
    "\u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4 \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d7\u05d9\u05d9\u05dd \u05d1\u05d9\u05e9\u05e8\u05d0\u05dc 2026? \u05d2\u05d1\u05e8 35 \u05dc\u05d0 \u05de\u05e2\u05e9\u05df \u2248 80 \u20aa/\u05d7\u05d5\u05d3\u05e9 \u05dc-500,000 \u20aa. \u05d8\u05d1\u05dc\u05d4 \u05de\u05dc\u05d0\u05d4 \u05dc\u05e4\u05d9 \u05d2\u05d9\u05dc, \u05de\u05d9\u05df \u05d5\u05e2\u05d9\u05e9\u05d5\u05df. \u05d4\u05e9\u05d5\u05d5\u05d5 \u05de\u05d7\u05d9\u05e8\u05d9\u05dd \u05d5\u05d7\u05e1\u05db\u05d5 20\u201340%."
  );

  console.log("\n\u2550\u2550 \u05e1\u05d9\u05d5\u05dd! ══\n");
}

run().catch(console.error);
