/**
 * link-travel-june-2026.mjs
 * לינקים פנימיים לכתבת ביטוח נסיעות לחו"ל 2026
 */
import https from "https";

const HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN = "Ben951357s";

const a = (text, slug) =>
  `<a href="/news/${slug}" class="internal-link internal-link--article">${text}</a>`;

function seeAlso(...items) {
  const links = items
    .map(([text, slug]) => `<span>${a(text, slug)}</span>`)
    .join('<span class="sep"> · </span>');
  return `<hr><p style="text-align: right;"><strong><span>ראו גם:</span></strong></p><p style="text-align: right;">${links}</p>`;
}

async function getArticle(slug) {
  const url = `https://${HOST}/rest/v1/articles?slug=eq.${slug}&select=id,slug,title,content`;
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }, (res) => {
      res.setEncoding("utf8");
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)[0] || null));
    });
    req.on("error", reject);
  });
}

async function upsertArticle(article) {
  const buf = Buffer.from(JSON.stringify({ action: "upsert", article }), "utf8");
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: HOST, path: "/functions/v1/manage-article", method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8", "x-admin-secret": ADMIN,
          Authorization: `Bearer ${ANON}`, "Content-Length": buf.length } },
      (res) => {
        res.setEncoding("utf8");
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          const r = JSON.parse(d);
          if (res.statusCode === 200 && r.success) resolve(r.article);
          else reject(new Error(r.error || `Status ${res.statusCode}`));
        });
      }
    );
    req.on("error", reject);
    req.write(buf);
    req.end();
  });
}

async function addSeeAlso(slug, items) {
  const article = await getArticle(slug);
  if (!article) { console.log(`  ✗ לא נמצא: ${slug}`); return; }
  if (article.content.includes(`/news/${items[0][1]}`)) {
    console.log(`  ~ כבר מקושר: ${slug}`); return;
  }
  await upsertArticle({ slug, title: article.title, content: article.content + seeAlso(...items) });
  console.log(`  ✓ ${slug}`);
}

async function run() {
  console.log("\n══ Internal Linking — Travel Insurance ══\n");

  // Travel → health insurance cluster (not-mushlam + mushlam-vs-makif already in article footer)
  console.log("📌 ביטוח נסיעות → ביטוח בריאות:");
  await addSeeAlso("travel-insurance-guide-2026", [
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["ביטוח מקיף מול מושלם 2026", "health-insurance-mushlam-vs-makif-2026"],
  ]);

  // Health cluster → travel
  console.log("\n📌 ביטוח בריאות → ביטוח נסיעות:");
  await addSeeAlso("not-mushlam", [
    ["ביטוח נסיעות לחו\"ל 2026 — המדריך המלא", "travel-insurance-guide-2026"],
  ]);
  await addSeeAlso("health-insurance-mushlam-vs-makif-2026", [
    ["ביטוח נסיעות לחו\"ל 2026 — כמה עולה ומה חייב לכלול?", "travel-insurance-guide-2026"],
  ]);

  console.log("\n══ סיום! ══\n");
}

run().catch(console.error);
