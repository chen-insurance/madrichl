import https from "https";
const HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN = "Ben951357s";
const a = (t, s) => `<a href="/news/${s}" class="internal-link internal-link--article">${t}</a>`;
function seeAlso(...items) {
  return `<hr><p style="text-align: right;"><strong><span>\u05e8\u05d0\u05d5 \u05d2\u05dd:</span></strong></p><p style="text-align: right;">${items.map(([t,s])=>`<span>${a(t,s)}</span>`).join('<span class="sep"> \u00b7 </span>')}</p>`;
}
async function getArticle(slug) {
  return new Promise((resolve, reject) => {
    https.get(`https://${HOST}/rest/v1/articles?slug=eq.${slug}&select=id,slug,title,content`, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }, (res) => {
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
      res.on("end", () => { const r = JSON.parse(d); if (res.statusCode === 200 && r.success) resolve(r.article); else reject(new Error(r.error || `${res.statusCode}`)); });
    });
    req.on("error", reject); req.write(buf); req.end();
  });
}
async function addSeeAlso(slug, items) {
  const article = await getArticle(slug);
  if (!article) { console.log(`  \u2717 not found: ${slug}`); return; }
  if (article.content.includes(`/news/${items[0][1]}`)) { console.log(`  ~ already: ${slug}`); return; }
  await upsertArticle({ slug, title: article.title, content: article.content + seeAlso(...items) });
  console.log(`  \u2713 ${slug}`);
}

const TARGET = "psychologists-professional-liability-insurance";

async function run() {
  console.log("\n\u2550\u2550 Linking \u2014 Boost Psychologists ══\n");

  // כל הכתבות הקשורות -> פסיכולוגים
  await addSeeAlso("comprehensive-guide-liability-insurance-therapists", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea \u05dc\u05e4\u05e1\u05d9\u05db\u05d5\u05dc\u05d5\u05d2\u05d9\u05dd 2026", TARGET],
  ]);
  await addSeeAlso("professional-liability-insurance-mental-health-2026", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea \u05dc\u05e4\u05e1\u05d9\u05db\u05d5\u05dc\u05d5\u05d2\u05d9\u05dd \u2014 \u05de\u05d7\u05d9\u05e8\u05d9\u05dd \u05d5\u05db\u05d9\u05e1\u05d5\u05d9\u05d9\u05dd", TARGET],
  ]);
  await addSeeAlso("self-employed-insurance-guide-2026", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea \u05dc\u05e4\u05e1\u05d9\u05db\u05d5\u05dc\u05d5\u05d2\u05d9\u05dd \u05d5\u05de\u05d8\u05e4\u05dc\u05d9\u05dd", TARGET],
  ]);
  await addSeeAlso("disability-insurance-guide-2026", [
    ["\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05de\u05e7\u05e6\u05d5\u05e2\u05d9\u05ea \u05dc\u05e4\u05e1\u05d9\u05db\u05d5\u05dc\u05d5\u05d2\u05d9\u05dd \u05d5\u05e2\u05e6\u05de\u05d0\u05d9\u05dd", TARGET],
  ]);

  console.log("\n\u2550\u2550 \u05e1\u05d9\u05d5\u05dd! ══\n");
}
run().catch(console.error);
