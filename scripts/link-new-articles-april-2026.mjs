/**
 * link-new-articles-april-2026.mjs
 * מוסיף קישורים פנימיים ל-7 כתבות חדשות:
 * Round 7: home-insurance-average-price, harel-vs-migdal, best-pension-fund, health-insurance-mushlam-vs-makif
 * Growth push: car-insurance-price-guide, nursing-insurance-guide, disability-income-insurance-guide
 */
import https from "https";

const SUPABASE_HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN_SECRET = "Ben951357s";

const a = (text, slug) =>
  `<a href="/news/${slug}" class="internal-link internal-link--article">${text}</a>`;

function seeAlso(...items) {
  const links = items
    .map(([text, slug]) => `<span>${a(text, slug)}</span>`)
    .join('<span class="sep"> · </span>');
  return (
    `<hr>` +
    `<p style="text-align: right;"><strong><span>ראו גם:</span></strong></p>` +
    `<p style="text-align: right;">${links}</p>`
  );
}

async function getArticle(slug) {
  const url = `https://${SUPABASE_HOST}/rest/v1/articles?slug=eq.${slug}&select=id,slug,title,content`;
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
      (res) => {
        res.setEncoding("utf8");
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          const arr = JSON.parse(d);
          resolve(arr[0] || null);
        });
      }
    );
    req.on("error", reject);
  });
}

async function upsertArticle(article) {
  const body = JSON.stringify({ action: "upsert", article });
  const buf = Buffer.from(body, "utf8");
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SUPABASE_HOST,
      path: "/functions/v1/manage-article",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-admin-secret": ADMIN_SECRET,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Length": buf.length,
      },
    };
    const req = https.request(opts, (res) => {
      res.setEncoding("utf8");
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        const result = JSON.parse(d);
        if (res.statusCode === 200 && result.success) resolve(result.article);
        else reject(new Error(result.error || `Status ${res.statusCode}: ${d}`));
      });
    });
    req.on("error", reject);
    req.write(buf);
    req.end();
  });
}

async function addSeeAlso(slug, seeAlsoItems) {
  const article = await getArticle(slug);
  if (!article) { console.log(`  ✗ לא נמצאה: ${slug}`); return; }

  const firstSlug = seeAlsoItems[0][1];
  if (article.content.includes(`/news/${firstSlug}`)) {
    console.log(`  ~ כבר מקושר: ${slug}`); return;
  }

  const block = seeAlso(...seeAlsoItems);
  await upsertArticle({ slug, title: article.title, content: article.content + block });
  console.log(`  ✓ ${slug}`);
}

async function addInlineLink(slug, anchorText, targetSlug) {
  const article = await getArticle(slug);
  if (!article) { console.log(`  ✗ לא נמצאה: ${slug}`); return; }
  if (article.content.includes(`/news/${targetSlug}`)) {
    console.log(`  ~ כבר קיים: ${slug} → ${targetSlug}`); return;
  }
  if (!article.content.includes(anchorText)) {
    console.log(`  ~ anchor לא נמצא: "${anchorText}" ב-${slug}`); return;
  }

  const updatedContent = article.content.replace(anchorText, a(anchorText, targetSlug));
  await upsertArticle({ slug, title: article.title, content: updatedContent });
  console.log(`  ✓ inline: ${slug} → ${targetSlug}`);
}

async function run() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log("  Internal Linking — 7 New Articles (April 2026)");
  console.log("══════════════════════════════════════════════════════\n");

  // ─── Round 7 articles ─────────────────────────────────────────────────────

  console.log("📌 ביטוח דירה — מחיר ממוצע + השוואת חברות");

  await addSeeAlso("home-insurance-average-price-israel-2026", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["ביטוח דירה וצד שלישי — הסעיף שמציל מפשיטת רגל", "home-insurance-third-party-guide-2026"],
    ["ביטוח דירה ורכב יחד — חסכו אלפי שקלים", "car-and-home-bundle"],
  ]);

  await addSeeAlso("harel-vs-migdal-home-insurance-2026", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["מחיר ממוצע לביטוח דירה בישראל 2026", "home-insurance-average-price-israel-2026"],
    ["ביטוח דירה וצד שלישי", "home-insurance-third-party-guide-2026"],
  ]);

  // pillar ← spokes (הוסף לינקים מה-pillar לכתבות החדשות)
  await addSeeAlso("home-insurance-guide-2026", [
    ["כמה עולה ביטוח דירה ממוצע בישראל?", "home-insurance-average-price-israel-2026"],
    ["הראל מול מגדל: השוואת ביטוח דירה 2026", "harel-vs-migdal-home-insurance-2026"],
  ]);

  console.log("\n📌 פנסיה — קרן הטובה ביותר");

  await addSeeAlso("best-pension-fund-israel-2026", [
    ["מדריך פנסיה מקיף לישראלים 2026", "pension-complete-guide-israel-2026"],
    ["הכספת הפרוצה: אירוע בריאותי vs. הפנסיה שלכם", "pension-health"],
  ]);

  // pillar ← spoke
  await addSeeAlso("pension-complete-guide-israel-2026", [
    ["קרן הפנסיה הטובה ביותר בישראל 2026", "best-pension-fund-israel-2026"],
  ]);

  console.log("\n📌 ביטוח בריאות — מושלם מול מקיף");

  await addSeeAlso("health-insurance-mushlam-vs-makif-2026", [
    ["ביטוח בריאות פרטי — כל האמת על הפוליסה שאתם צריכים", "not-mushlam"],
    ["הרפורמה בביטוחי הבריאות — מה השתנה?", "new-reform"],
    ["ביטוח סיעודי — כל מה שצריך לדעת", "kupat-hulim-siudi"],
  ]);

  // pillar ← spoke
  await addSeeAlso("not-mushlam", [
    ["מושלם מול מקיף — מה ההבדל ומה כדאי לכם?", "health-insurance-mushlam-vs-makif-2026"],
  ]);

  // ─── Growth push articles ──────────────────────────────────────────────────

  console.log("\n📌 ביטוח רכב — מדריך מחירים 2026");

  await addSeeAlso("car-insurance-price-guide-2026", [
    ["חבילת ביטוח דירה ורכב — חסכו אלפי שקלים", "car-and-home-bundle"],
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["ביטוח תאונות אישיות — הכסף שמגיע לכם", "personal-accident-insurance-guide-2026"],
  ]);

  await addSeeAlso("car-and-home-bundle", [
    ["מדריך מחירי ביטוח רכב 2026", "car-insurance-price-guide-2026"],
  ]);

  console.log("\n📌 ביטוח סיעודי 2026");

  await addSeeAlso("nursing-insurance-guide-2026", [
    ["ביטוח בריאות פרטי — כל האמת על הפוליסה שאתם צריכים", "not-mushlam"],
    ["ביטוח סיעודי דרך קופת חולים — כל מה שצריך לדעת", "kupat-hulim-siudi"],
    ["הכספת הפרוצה: אירוע בריאותי vs. הפנסיה שלכם", "pension-health"],
  ]);

  await addSeeAlso("kupat-hulim-siudi", [
    ["מדריך ביטוח סיעודי 2026 — המדריך המלא", "nursing-insurance-guide-2026"],
  ]);

  console.log("\n📌 ביטוח אובדן כושר עבודה 2026");

  await addSeeAlso("disability-income-insurance-guide-2026", [
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["הכספת הפרוצה: אירוע בריאותי vs. הפנסיה שלכם", "pension-health"],
    ["מדריך פנסיה מקיף לישראלים 2026", "pension-complete-guide-israel-2026"],
  ]);

  await addSeeAlso("pension-health", [
    ["ביטוח אובדן כושר עבודה — המדריך המלא 2026", "disability-income-insurance-guide-2026"],
    ["מדריך ביטוח סיעודי 2026", "nursing-insurance-guide-2026"],
  ]);

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  סיום — כל הלינקים עודכנו!");
  console.log("══════════════════════════════════════════════════════\n");
}

run().catch(console.error);
