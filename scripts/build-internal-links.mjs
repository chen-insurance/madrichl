/**
 * build-internal-links.mjs
 * אסטרטגיית SEO מלאה — Topic Clusters + Internal Links
 *
 * Topic Clusters:
 *   1. ביטוח דירה       → home-insurance-guide-2026 (Pillar) — 3,173 חשיפות!
 *   2. אחריות מקצועית   → comprehensive-guide-liability-insurance-therapists (Pillar)
 *   3. חיים/משכנתא      → life-insurance-mortgage-guide-2026 (Pillar)
 *   4. ביטוח בריאות     → not-mushlam (Pillar)
 */
import https from "https";

const SUPABASE_HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN_SECRET = "Ben951357s";

// ─── helpers ────────────────────────────────────────────────────────────────

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

/**
 * מוסיף בלוק "ראו גם" לכתבה אם הוא לא קיים כבר
 * בודק לפי ה-slug הראשון ברשימה
 */
async function addSeeAlso(slug, seeAlsoItems) {
  const article = await getArticle(slug);
  if (!article) {
    console.log(`  ✗ לא נמצאה: ${slug}`);
    return;
  }

  // בדוק אם כבר קיים לינק לפחות ל-slug הראשון
  const firstSlug = seeAlsoItems[0][1];
  if (article.content.includes(`/news/${firstSlug}`)) {
    console.log(`  ~ כבר מקושר: ${slug}`);
    return;
  }

  const block = seeAlso(...seeAlsoItems);
  const updatedContent = article.content + block;
  await upsertArticle({ slug, title: article.title, content: updatedContent });
  console.log(`  ✓ עודכן: ${slug}`);
}

/**
 * מוסיף לינק inline בתוך תוכן הכתבה — מחפש anchor text ומחליף בלינק
 */
async function addInlineLink(slug, anchorText, targetSlug) {
  const article = await getArticle(slug);
  if (!article) {
    console.log(`  ✗ לא נמצאה: ${slug}`);
    return;
  }

  if (article.content.includes(`/news/${targetSlug}`)) {
    console.log(`  ~ כבר קיים inline: ${slug} → ${targetSlug}`);
    return;
  }

  // מחפש את ה-anchor text (לא בתוך תג HTML)
  if (!article.content.includes(anchorText)) {
    console.log(`  ~ anchor text לא נמצא: "${anchorText}" ב-${slug}`);
    return;
  }

  // מחליף את ההופעה הראשונה בלבד
  const updatedContent = article.content.replace(
    anchorText,
    a(anchorText, targetSlug)
  );
  await upsertArticle({ slug, title: article.title, content: updatedContent });
  console.log(`  ✓ inline link נוסף: ${slug} → ${targetSlug}`);
}

// ─── אסטרטגיית הקישורים ─────────────────────────────────────────────────────

async function run() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log("  SEO Internal Linking — Topic Cluster Strategy");
  console.log("══════════════════════════════════════════════════════\n");

  // ════════════════════════════════════════════════════════
  // CLUSTER 1: ביטוח דירה
  // Pillar: home-insurance-guide-2026  (3,173 חשיפות, מיקום 77!)
  // ════════════════════════════════════════════════════════
  console.log("📌 CLUSTER 1: ביטוח דירה");

  // spoke → pillar
  console.log("\n  Spokes → Pillar:");
  await addSeeAlso("home-insurance-third-party-protection", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["חבילת ביטוח דירה ורכב — חסכו אלפי שקלים", "car-and-home-bundle"],
  ]);

  await addSeeAlso("car-and-home-bundle", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["צד שלישי — הסעיף שמציל אתכם מפשיטת רגל", "home-insurance-third-party-protection"],
  ]);

  await addSeeAlso("mortgage-home-insurance-guide-2026", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["המדריך המלא לביטוח חיים ומשכנתא", "life-insurance-mortgage-guide-2026"],
  ]);

  await addSeeAlso("-seo-eea-t-4-750-seo-seo-meta-title-", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["ביטוח דירה — צד שלישי: הסעיף הכי חשוב", "home-insurance-third-party-protection"],
  ]);

  await addSeeAlso("house-homeblow", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["צד שלישי — כשהשכן תובע אתכם", "home-insurance-third-party-protection"],
    ["חבילת ביטוח דירה ורכב", "car-and-home-bundle"],
  ]);

  // pillar → spokes
  console.log("\n  Pillar → Spokes:");
  await addSeeAlso("home-insurance-guide-2026", [
    ["ביטוח דירה וצד שלישי — הסעיף שמציל מפשיטת רגל", "home-insurance-third-party-protection"],
    ["חבילת ביטוח דירה ורכב — חסכו אלפי שקלים", "car-and-home-bundle"],
    ["ביטוח משכנתא ודירה: מה ההבדל ומה חובה?", "mortgage-home-insurance-guide-2026"],
    ["מחשבון ביטוח משכנתא — בדקו אם אתם פראיירים של הבנק", "mahshebvon-mashkanya"],
  ]);

  // inline links — pillar
  console.log("\n  Inline links:");
  await addInlineLink("home-insurance-guide-2026", "ביטוח מבנה", "mortgage-home-insurance-guide-2026");
  await addInlineLink("house-homeblow", "ביטוח דירה", "home-insurance-guide-2026");
  await addInlineLink("-seo-eea-t-4-750-seo-seo-meta-title-", "ביטוח הדירה", "home-insurance-guide-2026");

  // ════════════════════════════════════════════════════════
  // CLUSTER 2: ביטוח אחריות מקצועית
  // Pillar A: comprehensive-guide-liability-insurance-therapists
  // Pillar B: professional-liability-insurance-mental-health-2026
  // ════════════════════════════════════════════════════════
  console.log("\n📌 CLUSTER 2: ביטוח אחריות מקצועית");

  console.log("\n  Spokes → Pillar A:");
  await addSeeAlso("psychologists-professional-liability-insurance", [
    ["המדריך המלא לביטוח אחריות מקצועית למטפלים", "comprehensive-guide-liability-insurance-therapists"],
    ["ביטוח אחריות מקצועית לאנשי בריאות הנפש 2026", "professional-liability-insurance-mental-health-2026"],
    ["ביטוח אחריות מקצועית לטיפול בזום", "-remote-therapy-zoom-professional-liability-insurance"],
  ]);

  await addSeeAlso("-remote-therapy-zoom-professional-liability-insurance", [
    ["המדריך המלא לביטוח אחריות מקצועית למטפלים", "comprehensive-guide-liability-insurance-therapists"],
    ["ביטוח אחריות מקצועית לפסיכולוגים", "psychologists-professional-liability-insurance"],
    ["ביטוח אחריות מקצועית לאנשי בריאות הנפש 2026", "professional-liability-insurance-mental-health-2026"],
  ]);

  console.log("\n  Pillar A → Spokes:");
  await addSeeAlso("comprehensive-guide-liability-insurance-therapists", [
    ["ביטוח אחריות מקצועית לפסיכולוגים — המדריך המלא", "psychologists-professional-liability-insurance"],
    ["ביטוח אחריות מקצועית לטיפול בזום", "-remote-therapy-zoom-professional-liability-insurance"],
    ["ביטוח אחריות מקצועית לאנשי בריאות הנפש 2026", "professional-liability-insurance-mental-health-2026"],
  ]);

  console.log("\n  Pillar B → Spokes (enhancement):");
  await addSeeAlso("professional-liability-insurance-mental-health-2026", [
    ["המדריך המלא לביטוח אחריות מקצועית למטפלים", "comprehensive-guide-liability-insurance-therapists"],
    ["ביטוח אחריות מקצועית לפסיכולוגים", "psychologists-professional-liability-insurance"],
    ["ביטוח לטיפול מרחוק ובזום", "-remote-therapy-zoom-professional-liability-insurance"],
  ]);

  console.log("\n  Inline links — professional cluster:");
  await addInlineLink(
    "comprehensive-guide-liability-insurance-therapists",
    "פסיכולוגים ועובדים סוציאליים",
    "psychologists-professional-liability-insurance"
  );

  // ════════════════════════════════════════════════════════
  // CLUSTER 3: ביטוח חיים ומשכנתא
  // Pillar: life-insurance-mortgage-guide-2026
  // ════════════════════════════════════════════════════════
  console.log("\n📌 CLUSTER 3: ביטוח חיים ומשכנתא");

  console.log("\n  Spokes → Pillar:");
  await addSeeAlso("mahshebvon-mashkanya", [
    ["המדריך המלא לביטוח חיים ומשכנתא", "life-insurance-mortgage-guide-2026"],
    ["ביטוח משכנתא ודירה: מה ההבדל ומה חובה?", "mortgage-home-insurance-guide-2026"],
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
  ]);

  console.log("\n  Pillar → Spokes:");
  await addSeeAlso("life-insurance-mortgage-guide-2026", [
    ["ביטוח משכנתא ודירה: מה ההבדל ומה חובה?", "mortgage-home-insurance-guide-2026"],
    ["מחשבון ביטוח משכנתא — בדקו אם אתם פראיירים של הבנק", "mahshebvon-mashkanya"],
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
  ]);

  console.log("\n  Inline links — mortgage cluster:");
  await addInlineLink(
    "mahshebvon-mashkanya",
    "ביטוח חיים ומבנה",
    "life-insurance-mortgage-guide-2026"
  );

  // ════════════════════════════════════════════════════════
  // CLUSTER 4: ביטוח בריאות
  // Pillar: not-mushlam
  // ════════════════════════════════════════════════════════
  console.log("\n📌 CLUSTER 4: ביטוח בריאות");

  console.log("\n  Spokes → Pillar:");
  await addSeeAlso("new-reform", [
    ["ביטוח בריאות פרטי — כל האמת על הפוליסה שאתם צריכים", "not-mushlam"],
    ["ביטוח סיעודי — הפצצה המתקתקת שרוב הישראלים מתעלמים ממנה", "kupat-hulim-siudi"],
    ["הר הביטוח: המדריך המלא לאיתור כפל ביטוח", "har-bituch"],
  ]);

  await addSeeAlso("kupat-hulim-siudi", [
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["הכספת הפרוצה: איך אירוע בריאותי מחסל את הפנסיה שלכם", "pension-health"],
    ["הר הביטוח: המדריך המלא", "har-bituch"],
  ]);

  await addSeeAlso("pension-health", [
    ["ביטוח בריאות פרטי — כל האמת על הפוליסה שאתם צריכים", "not-mushlam"],
    ["ביטוח סיעודי — כל מה שצריך לדעת", "kupat-hulim-siudi"],
    ["הרפורמה בביטוחי הבריאות — מה השתנה?", "new-reform"],
  ]);

  console.log("\n  Pillar → Spokes:");
  await addSeeAlso("not-mushlam", [
    ["הרפורמה בביטוחי הבריאות — מה השתנה לכם?", "new-reform"],
    ["ביטוח סיעודי: הפצצה המתקתקת", "kupat-hulim-siudi"],
    ["הכספת הפרוצה: אירוע בריאותי vs. הפנסיה שלכם", "pension-health"],
    ["הר הביטוח: כך תאתרו כפל ביטוח", "har-bituch"],
  ]);

  console.log("\n  Inline links — health cluster:");
  await addInlineLink(
    "new-reform",
    "ביטוח בריאות",
    "not-mushlam"
  );
  await addInlineLink(
    "kupat-hulim-siudi",
    "ביטוח סיעודי",
    "not-mushlam"
  );
  await addInlineLink(
    "pension-health",
    "ביטוח פרטי",
    "not-mushlam"
  );

  // ════════════════════════════════════════════════════════
  // כתבות עצמאיות — cross-cluster links
  // ════════════════════════════════════════════════════════
  console.log("\n📌 Cross-cluster: כתבות עצמאיות");

  await addSeeAlso("personal-accident-insurance-guide-2026", [
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["ביטוח סיעודי — כל מה שצריך לדעת", "kupat-hulim-siudi"],
    ["הכספת הפרוצה: אירוע בריאותי vs. הפנסיה שלכם", "pension-health"],
  ]);

  await addSeeAlso("-business-car-insurance-trap", [
    ["ביטוח תאונות אישיות — הכסף שמגיע לכם ברגע האמת", "personal-accident-insurance-guide-2026"],
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["חבילת ביטוח דירה ורכב — חסכו אלפי שקלים", "car-and-home-bundle"],
  ]);

  // הר הביטוח — hub לכל האתר
  await addSeeAlso("har-bituch", [
    ["המדריך המלא לביטוח דירה 2026", "home-insurance-guide-2026"],
    ["ביטוח בריאות פרטי — כל האמת", "not-mushlam"],
    ["המדריך המלא לביטוח חיים ומשכנתא", "life-insurance-mortgage-guide-2026"],
    ["ביטוח אחריות מקצועית למטפלים", "comprehensive-guide-liability-insurance-therapists"],
  ]);

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  סיום! כל הלינקים הפנימיים עודכנו.");
  console.log("══════════════════════════════════════════════════════\n");
}

run().catch(console.error);
