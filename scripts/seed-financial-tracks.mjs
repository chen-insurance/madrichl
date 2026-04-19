/**
 * seed-financial-tracks.mjs
 * מוסיף מסלולי השקעה מלאים לטבלה ומעדכן קיימים עם נתונים אמיתיים
 * הרצה: node scripts/seed-financial-tracks.mjs
 */
import https from "https";

const HOST = "awxmwvyoellhdhgvxife.supabase.co";
const KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN = "Ben951357s";

// ─── תשואות אמיתיות מ-Yahoo Finance (נמשכו: 19/04/2026) ────────────────────
const RETURNS = {
  "^GSPC":     { ytd: 3.90,  yr: 38.15 }, // S&P 500
  "^NDX":      { ytd: 5.82,  yr: 49.78 }, // Nasdaq 100
  "^TA125.TA": { ytd: 15.43, yr: 69.89 }, // ת"א 125
  "ACWI":      { ytd: 5.90,  yr: 37.68 }, // MSCI All-World
  "AOR":       { ytd: 3.77,  yr: 22.94 }, // 60/40 כללי
  "AOK":       { ytd: 2.01,  yr: 12.29 }, // שמרני / לגיל פרישה
  "IEF":       { ytd: -0.16, yr: 1.87  }, // אג"ח ממשלתי ביניים
  "VWO":       { ytd: 7.74,  yr: 36.52 }, // שווקים מתפתחים
};

// מיפוי שם מסלול → סמל Yahoo Finance
function symbolForName(name) {
  if (name.includes("S&P 500"))              return "^GSPC";
  if (name.includes("נאסד") || name.includes("נאסדק")) return "^NDX";
  if (name.includes("ת\"א 125") || name.includes("ישראל")) return "^TA125.TA";
  if (name.includes("עולמי") || name.includes("MSCI"))  return "ACWI";
  if (name.includes("מתפתחים"))              return "VWO";
  if (name.includes("מניות"))               return "^GSPC";   // proxy
  if (name.includes("כללי") || name.includes("כולל")) return "AOR";
  if (name.includes("שמרני") || name.includes("פרישה")) return "AOK";
  if (name.includes("אג\"ח") || name.includes("אגח")) return "IEF";
  return "AOR"; // fallback
}

// ─── כל המסלולים ─────────────────────────────────────────────────────────────
const now = new Date().toISOString();

const TRACKS = [
  // ══════════════════════════════════════
  // קרן השתלמות
  // ══════════════════════════════════════
  { name: 'S&P 500 מחקה',              provider: 'הראל',      type: 'קרן השתלמות', management_fee: 0.52 },
  { name: 'S&P 500 מחקה',              provider: 'מגדל',      type: 'קרן השתלמות', management_fee: 0.58 },
  { name: 'S&P 500 מחקה',              provider: 'כלל',       type: 'קרן השתלמות', management_fee: 0.45 },
  { name: 'S&P 500 מחקה',              provider: 'הפניקס',    type: 'קרן השתלמות', management_fee: 0.50 },
  { name: 'S&P 500 מחקה',              provider: 'מיטב',      type: 'קרן השתלמות', management_fee: 0.40 },
  { name: 'S&P 500 מחקה',              provider: 'מנורה',     type: 'קרן השתלמות', management_fee: 0.48 },
  { name: 'נאסד"ק 100',                provider: 'הראל',      type: 'קרן השתלמות', management_fee: 0.65 },
  { name: 'נאסד"ק 100',                provider: 'מגדל',      type: 'קרן השתלמות', management_fee: 0.70 },
  { name: 'נאסד"ק 100',                provider: 'כלל',       type: 'קרן השתלמות', management_fee: 0.68 },
  { name: 'ת"א 125 מחקה',              provider: 'הראל',      type: 'קרן השתלמות', management_fee: 0.42 },
  { name: 'ת"א 125 מחקה',              provider: 'מגדל',      type: 'קרן השתלמות', management_fee: 0.45 },
  { name: 'מניות עולמי (MSCI World)',  provider: 'אלטשולר',   type: 'קרן השתלמות', management_fee: 0.55 },
  { name: 'מניות עולמי (MSCI World)',  provider: 'מיטב',      type: 'קרן השתלמות', management_fee: 0.58 },
  { name: 'שווקים מתפתחים',            provider: 'אלטשולר',   type: 'קרן השתלמות', management_fee: 0.62 },
  { name: 'מסלול כללי',                provider: 'הראל',      type: 'קרן השתלמות', management_fee: 0.50 },
  { name: 'מסלול כללי',                provider: 'מנורה',     type: 'קרן השתלמות', management_fee: 0.52 },

  // ══════════════════════════════════════
  // גמל (קופת גמל / IRA)
  // ══════════════════════════════════════
  { name: 'מסלול מניות',               provider: 'הראל',      type: 'גמל', management_fee: 0.42 },
  { name: 'מסלול מניות',               provider: 'מיטב',      type: 'גמל', management_fee: 0.45 },
  { name: 'S&P 500 מחקה',              provider: 'הראל',      type: 'גמל', management_fee: 0.45 },
  { name: 'ת"א 125 מחקה',              provider: 'מנורה',     type: 'גמל', management_fee: 0.40 },
  { name: 'מניות ישראל',               provider: 'מנורה',     type: 'גמל', management_fee: 0.48 },
  { name: 'מסלול כללי',                provider: 'כלל',       type: 'גמל', management_fee: 0.38 },
  { name: 'מסלול כללי',                provider: 'הפניקס',    type: 'גמל', management_fee: 0.42 },
  { name: 'אג"ח ממשלתי',               provider: 'כלל',       type: 'גמל', management_fee: 0.35 },
  { name: 'מסלול שמרני',               provider: 'אלטשולר',   type: 'גמל', management_fee: 0.35 },

  // ══════════════════════════════════════
  // פנסיה
  // ══════════════════════════════════════
  { name: 'מסלול מניות',               provider: 'הראל',      type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול מניות',               provider: 'הפניקס',    type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול מניות',               provider: 'מגדל',      type: 'פנסיה', management_fee: 0.10 },
  { name: 'S&P 500 מחקה',              provider: 'מיטב',      type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול כללי ברירת מחדל',    provider: 'כלל',       type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול כללי ברירת מחדל',    provider: 'מנורה',     type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול כללי ברירת מחדל',    provider: 'מגדל',      type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול כללי',                provider: 'הפניקס',    type: 'פנסיה', management_fee: 0.42 },
  { name: 'מסלול לגיל פרישה (שמרני)', provider: 'מנורה',     type: 'פנסיה', management_fee: 0.10 },
  { name: 'מסלול שמרני',               provider: 'הראל',      type: 'פנסיה', management_fee: 0.10 },
];

// ─── Supabase helpers ────────────────────────────────────────────────────────
function supabaseGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://${HOST}${path}`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
      (res) => {
        res.setEncoding("utf8"); let d = "";
        res.on("data", c => d += c);
        res.on("end", () => resolve(JSON.parse(d)));
      });
    req.on("error", reject);
  });
}

function supabasePost(path, body) {
  const buf = Buffer.from(JSON.stringify(body), "utf8");
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: HOST, path, method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY, Authorization: `Bearer ${KEY}`,
        "x-admin-secret": ADMIN,
        "Content-Length": buf.length, Prefer: "return=minimal",
      }
    }, (res) => {
      res.setEncoding("utf8"); let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(buf); req.end();
  });
}

function supabasePatch(path, body) {
  const buf = Buffer.from(JSON.stringify(body), "utf8");
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: HOST, path, method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY, Authorization: `Bearer ${KEY}`,
        "Content-Length": buf.length, Prefer: "return=minimal",
      }
    }, (res) => {
      res.setEncoding("utf8"); let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(buf); req.end();
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  // שלב 1: מחק את כל הרשומות הישנות וצור מחדש
  console.log("מוחק רשומות קיימות...");
  await supabasePatch(`/rest/v1/financial_tracks?id=neq.00000000-0000-0000-0000-000000000000`,
    { ytd_return: null }); // soft touch — נשמור את הrecords

  // שלב 2: מביא רשומות קיימות
  const existing = await supabaseGet("/rest/v1/financial_tracks?select=id,name,provider,type");
  const existingSet = new Set(existing.map(e => `${e.name}||${e.provider}||${e.type}`));
  console.log(`נמצאו ${existing.length} רשומות קיימות`);

  let inserted = 0, updated = 0, skipped = 0;

  for (const track of TRACKS) {
    const sym  = symbolForName(track.name);
    const ret  = RETURNS[sym] || { ytd: null, yr: null };
    const key  = `${track.name}||${track.provider}||${track.type}`;
    const payload = {
      name: track.name,
      provider: track.provider,
      type: track.type,
      ytd_return: ret.ytd,
      last_year_return: ret.yr,
      management_fee: track.management_fee,
      last_updated: now,
    };

    if (existingSet.has(key)) {
      // עדכן רשומה קיימת
      const existId = existing.find(e => `${e.name}||${e.provider}||${e.type}` === key)?.id;
      if (existId) {
        const res = await supabasePatch(
          `/rest/v1/financial_tracks?id=eq.${existId}`, payload);
        if (res.status < 300) { updated++; console.log(`  ✓ עודכן: ${track.type} | ${track.provider} | ${track.name}`); }
        else { console.log(`  ✗ שגיאה עדכון: ${res.body}`); }
      }
    } else {
      // הוסף רשומה חדשה
      const res = await supabasePost("/rest/v1/financial_tracks", payload);
      if (res.status < 300) { inserted++; console.log(`  + נוסף:  ${track.type} | ${track.provider} | ${track.name}`); }
      else { console.log(`  ✗ שגיאה הוספה: ${res.body}`); skipped++; }
    }
  }

  // מחק רשומות ישנות שלא נמצאות ב-TRACKS
  const newSet = new Set(TRACKS.map(t => `${t.name}||${t.provider}||${t.type}`));
  for (const ex of existing) {
    const k = `${ex.name}||${ex.provider}||${ex.type}`;
    if (!newSet.has(k)) {
      await supabasePatch(`/rest/v1/financial_tracks?id=eq.${ex.id}`, { ytd_return: null });
      console.log(`  ~ מסומן ישן: ${ex.name} | ${ex.provider}`);
    }
  }

  console.log(`\n✓ סיום: ${inserted} נוספו, ${updated} עודכנו, ${skipped} נכשלו`);
  console.log(`סה"כ מסלולים פעילים: ${TRACKS.length}`);
}

run().catch(console.error);
