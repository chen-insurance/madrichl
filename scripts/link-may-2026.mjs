/**
 * link-may-2026.mjs
 * לינקים פנימיים ל-3 כתבות חדשות:
 * - life-insurance-price-guide-2026
 * - renters-insurance-guide-2026
 * - hishtalmut-fund-guide-2026
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
  console.log("\n══ Internal Linking — May 2026 Articles ══\n");

  // life-insurance-price-guide → pillar + calculators
  console.log("📌 ביטוח חיים — מחיר:");
  await addSeeAlso("life-insurance-price-guide-2026", [
    ["המדריך המלא לביטוח חיים ומשכנתא", "life-insurance-mortgage-guide-2026"],
    ["מחשבון ביטוח חיים חינמי", "calculators"],
  ]);
  // pillar ← spoke
  await addSeeAlso("life-insurance-mortgage-guide-2026", [
    ["כמה עולה ביטוח חיים 2026? טבלת מחירים", "life-insurance-price-guide-2026"],
  ]);

  // renters insurance → home insurance cluster
  console.log("\n📌 ביטוח דירה לשוכרים:");
  await addSeeAlso("renters-insurance-guide-2026", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["ביטוח דירה וצד שלישי — הסעיף שמציל", "home-insurance-third-party-guide-2026"],
    ["ביטוח דירה: מחיר ממוצע בישראל 2026", "home-insurance-average-price-israel-2026"],
  ]);
  await addSeeAlso("home-insurance-guide-2026", [
    ["ביטוח דירה לשוכרים — המדריך המלא", "renters-insurance-guide-2026"],
  ]);

  // hishtalmut → pension cluster
  console.log("\n📌 קרן השתלמות:");
  await addSeeAlso("hishtalmut-fund-guide-2026", [
    ["מדריך פנסיה מקיף לישראלים 2026", "pension-complete-guide-israel-2026"],
    ["קרן הפנסיה הטובה ביותר בישראל 2026", "best-pension-fund-israel-2026"],
    ["הכספת הפרוצה: אירוע בריאותי vs. הפנסיה שלכם", "pension-health"],
  ]);
  await addSeeAlso("pension-complete-guide-israel-2026", [
    ["מדריך קרן השתלמות — הטבות מס ותשואות", "hishtalmut-fund-guide-2026"],
  ]);
  await addSeeAlso("pension-health", [
    ["מדריך קרן השתלמות 2026", "hishtalmut-fund-guide-2026"],
  ]);

  console.log("\n══ סיום! ══\n");
}

run().catch(console.error);
