/**
 * add-internal-links.mjs
 * מוסיף לינקים פנימיים בין כתבות אחריות מקצועית
 */
import https from "https";

const SUPABASE_HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN_SECRET = "Ben951357s";

const link = (text, slug) =>
  `<a href="/news/${slug}" class="internal-link internal-link--article">${text}</a>`;

// פסקת "ראה גם" — תתווסף בסוף כל כתבה קשורה
const seeAlsoBlock = `<hr><p style="text-align: right;"><strong><span>ראו גם:</span></strong></p><p style="text-align: right;"><span>המדריך המלא: ${link("ביטוח אחריות מקצועית לאנשי בריאות הנפש", "professional-liability-insurance-mental-health-2026")} — כיסויים, מחירים ואיך בוחרים פוליסה נכונה.</span></p>`;

async function upsertArticle(article) {
  const body = JSON.stringify({ action: "upsert", article });
  const bodyBuffer = Buffer.from(body, "utf8"); // explicit UTF-8 — prevents corruption of Hebrew chars
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_HOST,
      path: "/functions/v1/manage-article",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-admin-secret": ADMIN_SECRET,
        "Authorization": `Bearer ${ANON_KEY}`,
        "Content-Length": bodyBuffer.length,
      },
    };
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      let d = ""; res.on("data", (c) => (d += c));
      res.on("end", () => {
        const result = JSON.parse(d);
        if (res.statusCode === 200 && result.success) resolve(result.article);
        else reject(new Error(result.error || `Status ${res.statusCode}`));
      });
    });
    req.on("error", reject);
    req.write(bodyBuffer); req.end();
  });
}

async function getArticle(slug) {
  const url = `https://${SUPABASE_HOST}/rest/v1/articles?slug=eq.${slug}&select=id,slug,title,content`;
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }, (res) => {
      res.setEncoding("utf8");
      let d = ""; res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)[0]));
    });
    req.on("error", reject);
  });
}

// ─── עדכוני כתבות קיימות — הוספת "ראה גם" ──────────────────────────────────
const relatedSlugs = [
  "psychologists-professional-liability-insurance",
  "-remote-therapy-zoom-professional-liability-insurance",
  "comprehensive-guide-liability-insurance-therapists",
];

// ─── עדכון הכתבה הראשית — הוספת לינקים פנימיים בתוך התוכן ─────────────────
// נביא את הכתבה הראשית ונוסיף לינקים לכתבות הספציפיות בתוך הטקסט
const PILLAR_SLUG = "professional-liability-insurance-mental-health-2026";

async function run() {
  // 1. הוסף "ראה גם" לכתבות הקשורות
  console.log("מוסיף לינקים לכתבות קשורות...");
  for (const slug of relatedSlugs) {
    const article = await getArticle(slug);
    if (!article) { console.log(`  ✗ לא נמצאה: ${slug}`); continue; }

    // בדוק אם כבר יש לינק לכתבה הראשית
    if (article.content.includes(PILLAR_SLUG)) {
      console.log(`  ~ כבר מקושר: ${slug}`);
      continue;
    }

    const updatedContent = article.content + seeAlsoBlock;
    await upsertArticle({ slug, title: article.title, content: updatedContent });
    console.log(`  ✓ עודכן: ${slug}`);
  }

  // 2. עדכן הכתבה הראשית — הוסף לינקים ספציפיים בתוכן
  console.log("\nמעדכן לינקים בכתבה הראשית...");
  const pillar = await getArticle(PILLAR_SLUG);
  let content = pillar.content;

  // לינק לכתבת פסיכולוגים — בסעיף פסיכולוגים
  const psychLink = link("ביטוח אחריות מקצועית לפסיכולוגים", "psychologists-professional-liability-insurance");
  content = content.replace(
    "ביטוח אחריות מקצועית לפסיכולוגים מכסה הוצאות משפטיות",
    `${psychLink} מכסה הוצאות משפטיות`
  );

  // לינק לכתבת זום — בסעיף טיפול מרחוק
  const zoomLink = link('ביטוח אחריות מקצועית לטיפול מרחוק', "-remote-therapy-zoom-professional-liability-insurance");
  content = content.replace(
    "האם ביטוח אחריות מקצועית לטיפול מרחוק תקף?",
    `האם ${zoomLink} תקף?`
  );

  // לינק לכתבת מטפלים — בסעיף פסיכותרפיסטים
  const therapistsLink = link("ביטוח אחריות מקצועית למטפלים", "comprehensive-guide-liability-insurance-therapists");
  content = content.replace(
    "טיפול פסיכותרפויטי — CBT, EMDR, טיפול דינמי",
    `לפרטים נוספים: ${therapistsLink}. טיפול פסיכותרפויטי — CBT, EMDR, טיפול דינמי`
  );

  await upsertArticle({ slug: PILLAR_SLUG, title: pillar.title, content });
  console.log("  ✓ הכתבה הראשית עודכנה");
  console.log("\nסיום! כל הלינקים נוספו.");
}

run().catch(console.error);
