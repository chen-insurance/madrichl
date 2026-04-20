/**
 * link-critical-illness.mjs
 * לינקים פנימיים לכתבת ביטוח מחלות קשות 2026
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
    .join('<span class="sep"> \u00b7 </span>');
  return `<hr><p style="text-align: right;"><strong><span>\u05e8\u05d0\u05d5 \u05d2\u05dd:</span></strong></p><p style="text-align: right;">${links}</p>`;
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
  if (!article) { console.log(`  \u2717 \u05dc\u05d0 \u05e0\u05de\u05e6\u05d0: ${slug}`); return; }
  if (article.content.includes(`/news/${items[0][1]}`)) {
    console.log(`  ~ \u05db\u05d1\u05e8 \u05de\u05e7\u05d5\u05e9\u05e8: ${slug}`); return;
  }
  await upsertArticle({ slug, title: article.title, content: article.content + seeAlso(...items) });
  console.log(`  \u2713 ${slug}`);
}

async function run() {
  console.log("\n\u2550\u2550 Internal Linking \u2014 Critical Illness Insurance \u2550\u2550\n");

  // life insurance cluster -> critical illness
  console.log("\u{1F4CC} \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d7\u05d9\u05d9\u05dd \u2192 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea:");
  await addSeeAlso("life-insurance-mortgage-guide-2026", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea 2026 \u2014 \u05d4\u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05de\u05dc\u05d0", "critical-illness-insurance-guide-2026"],
  ]);

  // health insurance cluster -> critical illness
  console.log("\n\u{1F4CC} \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d1\u05e8\u05d9\u05d0\u05d5\u05ea \u2192 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea:");
  await addSeeAlso("not-mushlam", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea 2026 \u2014 \u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4 \u05d5\u05de\u05d4 \u05de\u05db\u05e1\u05d4?", "critical-illness-insurance-guide-2026"],
  ]);

  // pension-health -> critical illness
  console.log("\n\u{1F4CC} \u05de\u05d7\u05dc\u05d4 \u05e7\u05e9\u05d4 \u05d5\u05e4\u05e0\u05e1\u05d9\u05d4 \u2192 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea:");
  await addSeeAlso("pension-health", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea \u2014 \u05de\u05d4 \u05e6\u05e8\u05d9\u05da \u05dc\u05d3\u05e2\u05ea \u05dc\u05e4\u05e0\u05d9 \u05e9\u05e7\u05d5\u05e0\u05d9\u05dd", "critical-illness-insurance-guide-2026"],
  ]);

  console.log("\n\u2550\u2550 \u05e1\u05d9\u05d5\u05dd! \u2550\u2550\n");
}

run().catch(console.error);
