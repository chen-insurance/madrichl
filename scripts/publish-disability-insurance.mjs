/**
 * publish-disability-insurance.mjs
 * כתבת SEO מקיפה: ביטוח אובדן כושר עבודה 2026
 */
import https from "https";

const HOST = "awxmwvyoellhdhgvxife.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eG13dnlvZWxsaGRoZ3Z4aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTEyMjcsImV4cCI6MjA4NDg4NzIyN30.XWf4rEcVsWuStdKp6-YTFEpiS7b6FjjmGld6b-8M_ME";
const ADMIN = "Ben951357s";
const CAT_GENERAL = "b9897e41-ab6e-4476-9e91-a42207439c6f";

const p = (t) => `<p style="text-align: right;"><span>${t}</span></p>`;
const h2 = (t) => `<h2 style="text-align: right;"><span>${t}</span></h2>`;
const h3 = (t) => `<h3 style="text-align: right;"><span>${t}</span></h3>`;
const li = (t) => `<p style="text-align: right;">\u2022<span> ${t}</span></p>`;
const b = (t) => `<strong><span>${t}</span></strong>`;
const hr = () => `<hr>`;

function table(headers, rows) {
  const head = `<tr>${headers.map(h => `<th style="text-align:right;padding:8px;background:#1a2f5a;color:#fff;">${h}</th>`).join("")}</tr>`;
  const body = rows.map(r => `<tr>${r.map((c, i) => `<td style="text-align:right;padding:8px;${i === 0 ? "font-weight:600;" : ""}">${c}</td>`).join("")}</tr>`).join("");
  return `<table style="min-width:500px;width:100%;border-collapse:collapse;"><colgroup>${headers.map(() => "<col>").join("")}</colgroup><tbody>${head}${body}</tbody></table>`;
}

const SLUG = "disability-insurance-guide-2026";

const article = {
  slug: SLUG,
  title: "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d5\u05d1\u05d3\u05df \u05db\u05d5\u05e9\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d4 2026: \u05d4\u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05de\u05dc\u05d0 \u2014 \u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4, \u05de\u05d4 \u05de\u05db\u05e1\u05d4 \u05d5\u05d0\u05d9\u05da \u05dc\u05d1\u05d7\u05d5\u05e8",
  excerpt: "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d5\u05d1\u05d3\u05df \u05db\u05d5\u05e9\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d4 \u05de\u05e9\u05dc\u05dd 75% \u05de\u05d4\u05db\u05e0\u05e1\u05d4 \u05db\u05e9\u05dc\u05d0 \u05d9\u05db\u05d5\u05dc\u05d9\u05dd \u05dc\u05e2\u05d1\u05d5\u05d3. \u05d0\u05d9\u05da \u05d6\u05d4 \u05e2\u05d5\u05d1\u05d3, \u05d4\u05d0\u05dd \u05d4\u05e4\u05e0\u05e1\u05d9\u05d4 \u05de\u05e1\u05e4\u05d9\u05e7\u05d4, \u05d5\u05de\u05d4 \u05d4\u05d4\u05d1\u05d3\u05dc \u05d1\u05d9\u05df \u05d4\u05d2\u05d3\u05e8\u05ea \u05e1\u05d9\u05d0\u05d5\u05d1 \u05d6\u05db\u05d0\u05d9 \u05d5\u05d6\u05db\u05d0\u05d9 \u05d7\u05dc\u05e7\u05d9.",
  seo_title: "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d5\u05d1\u05d3\u05df \u05db\u05d5\u05e9\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d4 2026: \u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4 \u05d5\u05de\u05d4 \u05d7\u05d9\u05d9\u05d1 \u05dc\u05db\u05dc\u05d5\u05dc?",
  seo_description: "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d5\u05d1\u05d3\u05df \u05db\u05d5\u05e9\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d4 2026: \u05d2\u05d9\u05dc 35 \u2248 150-250 \u20aa/\u05d7\u05d5\u05d3\u05e9. \u05de\u05e9\u05dc\u05dd 75% \u05de\u05d4\u05e9\u05db\u05e8 \u05e2\u05d3 \u05d2\u05d9\u05dc \u05e4\u05e8\u05d9\u05e9\u05d4. \u05d4\u05d0\u05dd \u05d4\u05e4\u05e0\u05e1\u05d9\u05d4 \u05de\u05e1\u05e4\u05d9\u05e7\u05d4? \u05d4\u05d2\u05d3\u05e8\u05ea \u05d6\u05db\u05d0\u05d9 \u05e1\u05d9\u05d0\u05d5\u05d1, \u05de\u05d4 \u05d1\u05d5\u05d3\u05e7\u05d9\u05dd \u05d5\u05d0\u05d9\u05da \u05dc\u05d1\u05d7\u05d5\u05e8. \u05de\u05d3\u05e8\u05d9\u05da \u05de\u05dc\u05d0.",
  category_id: CAT_GENERAL,
  featured_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop",
  image_alt_text: "\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d5\u05d1\u05d3\u05df \u05db\u05d5\u05e9\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d4 - \u05d0\u05d3\u05dd \u05e2\u05d5\u05d1\u05d3",
  author_name: "\u05de\u05e2\u05e8\u05db\u05ea \u05d4\u05de\u05d3\u05e8\u05d9\u05da",
  is_published: true,
  published_at: new Date().toISOString(),
  content: [
    p(`${b("1 מתוך 4 עובדים")} בישראל ייתקלו בתקופת אובדן כושר עבודה של 90 יום ומעלה לפני גיל הפרישה. השאלה איננה ${b("אם")} — אלא ${b("כמה")} תוכלו לשרוד כלכלית כשזה יקרה.`),
    p(`ביטוח אובדן כושר עבודה (א.כ.ע) משלם קצבה חודשית של עד 75% מהשכר ברוטו, מרגע שאינכם מסוגלים לעבוד ועד שתחזרו לעבודה — או עד גיל הפרישה.`),

    h2("איך ביטוח אובדן כושר עבודה עובד?"),
    p("הביטוח משלם קצבה חודשית כאשר:"),
    li("אתם לא מסוגלים לבצע את עיסוקכם (או כל עיסוק — תלוי בהגדרה)"),
    li("המצב נמשך מעבר לתקופת המתנה (לרוב 30-90 יום)"),
    li("המצב נגרם ממחלה, תאונה או מגבלה פיזית/נפשית"),
    p("קצבה מקסימלית: 75% מהשכר ברוטו. אם שכרכם 20,000 ₪ — קצבה מקסימלית של 15,000 ₪ לחודש."),

    h2("הגדרת זכאות — ההבדל שמשנה הכל"),
    p("זו הנקודה החשובה ביותר בפוליסה:"),
    table(
      ["הגדרת זכאות", "מה זה אומר?", "מי נהנה?"],
      [
        ["זכאי סיאובי (עיסוק ספציפי)", "לא יכול לעבוד ב\u05d1עיסוק הספציפי שלכם", "מקצועות מוגדרים: רופא, עורך דין, שרברב"],
        ["זכאי חלקי", "לא יכול לעבוד ב\u05d1כל עיסוק סביר לפי השכלה ו\u05e0ניסיון", "רוב השכירים"],
        ["נכות תפקודית", "איחד השניים — בשלב ראשון עיסוק ספציפי, לאחר מכן חלקי", "הגדרה מאוזנת"],
      ]
    ),
    p(`${b("דוגמה:")} רופא שאינו יכול לנתח אך יכול לייעץ — בהגדרת עיסוק ספציפי מקבל קצבה. בהגדרה חלקית — לא.`),
    p(`${b("המלצה:")} חפשו פוליסה עם הגדרת "${b("עיסוק ספציפי")}" לפחות ל-24-36 חודש ראשונים, ולאחר מכן "כל עיסוק".`),

    h2("כמה עולה ביטוח אובדן כושר עבודה 2026?"),
    p("הפרמיה תלויה בגיל, מין, מקצוע, שכר, ותקופת המתנה:"),
    table(
      ["גיל ומין", "קצבה 5,000 ₪/חודש", "קצבה 10,000 ₪/חודש", "קצבה 15,000 ₪/חודש"],
      [
        ["גבר 30", "100-160 ₪/חודש", "190-300 ₪/חודש", "270-420 ₪/חודש"],
        ["אישה 30", "130-200 ₪/חודש", "250-380 ₪/חודש", "350-540 ₪/חודש"],
        ["גבר 40", "160-250 ₪/חודש", "300-470 ₪/חודש", "430-670 ₪/חודש"],
        ["אישה 40", "190-300 ₪/חודש", "360-560 ₪/חודש", "510-800 ₪/חודש"],
        ["גבר 50", "250-400 ₪/חודש", "470-750 ₪/חודש", "670-1,050 ₪/חודש"],
        ["אישה 50", "220-350 ₪/חודש", "420-660 ₪/חודש", "590-930 ₪/חודש"],
      ]
    ),
    p("מקצועות סיכון גבוה (עבודה פיזית, בנייה, נהגים) ישלמו יותר. תקופת המתנה ארוכה יותר = פרמיה זולה יותר."),

    h2("האם הפנסיה מכסה אובדן כושר עבודה?"),
    p("כן — כחלק מרכיב הביטוח בפנסיה יש ביטוח אובדן כושר עבודה. אבל:"),
    table(
      ["פרמטר", "ביטוח א.כ.ע בפנסיה", "פוליסת א.כ.ע עצמאית"],
      [
        ["קצבה מקסימלית", "75% מהשכר שנרשם בפנסיה", "75% מהשכר האמיתי"],
        ["הגדרת זכאות", "לרוב 'כל עיסוק'", "ניתן לבחור 'עיסוק ספציפי'"],
        ["תקופת המתנה", "90 יום בדרך כלל", "30-90 יום (ניתן לבחור)"],
        ["גמישות", "מוגבלת", "גבוהה"],
        ["מה קורה בעזיבת עבודה?", "הכיסוי מפסיק", "נשאר בתוקף"],
        ["כיסוי מחלות נפש", "לעיתים מוגבל", "לרוב מלא"],
      ]
    ),
    p(`${b("בעיה נפוצה:")} שכירים רבים חושבים שהפנסיה מכסה אותם לחלוטין — אבל הכיסוי מבוסס על השכר שרשמו בפנסיה, שלעיתים נמוך מהשכר האמיתי. ולרוב יש הגדרת "כל עיסוק" שקשה יותר לקבל קצבה לפיה.`),

    h2("עצמאים — חובה לדעת"),
    p("עצמאים חשופים יותר מכל קבוצה אחרת:"),
    li("אין ביטוח לאומי שישלם קצבת נכות מלאה בגיל עבודה"),
    li("ביטוח א.כ.ע בפנסיה תלוי בהפקדות שנרשמו"),
    li("הכנסה עצמאית תנודתית — קשה להוכיח שכר ממוצע"),
    p(`${b("המלצה לעצמאים:")} רכשו פוליסה עצמאית עם הצמדה לתעריף מוצהר, לפחות 60-70% מההכנסה הממוצעת ב-12 חודשים האחרונים.`),

    h2("מה לבדוק לפני רכישת ביטוח א.כ.ע?"),
    li(`${b("הגדרת זכאות:")} עיסוק ספציפי? כמה חודשים?`),
    li(`${b("תקופת המתנה:")} 30 יום? 60? 90? ככל שארוכה יותר — זולה יותר אך פחות נוחה`),
    li(`${b("תקופת תשלום:")} עד גיל 67 (פרישה)? 5 שנים? עדיף עד גיל הפרישה`),
    li(`${b("אינדקסציה:")} האם הקצבה מוצמדת למדד/שכר? חיוני לתקופות ארוכות`),
    li(`${b("כיסוי מחלות נפש:")} דיכאון, חרדה, burn-out — האם כלולים ולכמה זמן?`),
    li(`${b("בדיקת כפל ביטוחי:")} בדקו מה הפנסיה כבר מכסה לפני רכישה`),

    h2("5 טעויות נפוצות בביטוח אובדן כושר עבודה"),
    li("לסמוך רק על הפנסיה — הגדרת הזכאות לרוב קשה יותר"),
    li("לא לבדוק את הגדרת הזכאות — ההבדל בין 'עיסוק ספציפי' ל'כל עיסוק' שווה אלפי שקלים"),
    li("לקנות קצבה נמוכה מדי — 75% מהשכר האמיתי, לא מהשכר שדיווחתם"),
    li("לשכוח לעדכן כשהשכר עלה — הקצבה לא עולה אוטומטית"),
    li("לא לכסות מחלות נפש — מהסיבות הנפוצות ביותר לאובדן כושר עבודה"),

    h2("שאלות נפוצות"),
    h3("האם אפשר לרכוש ביטוח א.כ.ע בנוסף לפנסיה?"),
    p("כן — ולעיתים קרובות זה מומלץ. הפנסיה מכסה עד 75% מהשכר שנרשם, ביטוח עצמאי ממלא את הפער. הסכום הכולל לא יעלה על 80% מהשכר."),
    h3("כמה זמן מקבלים קצבה?"),
    p("תלוי בפוליסה. רוב הפוליסות משלמות עד גיל הפרישה (67). יש פוליסות שמגבילות ל-2-5 שנים — אלו זולות יותר אך מסוכנות יותר."),
    h3("מה קורה אם חוזרים לעבוד חלקית?"),
    p("בפוליסות טובות יש רכיב 'אובדן חלקי' — מקבלים קצבה חלקית לפי אחוז אובדן ההכנסה. ודאו שהפוליסה כוללת רכיב זה."),

    hr(),
    p(`<strong>\u05e8\u05d0\u05d5 \u05d2\u05dd:</strong> <a href="/news/pension-complete-guide-israel-2026" class="internal-link">\u05de\u05d3\u05e8\u05d9\u05da \u05e4\u05e0\u05e1\u05d9\u05d4 \u05de\u05e7\u05d9\u05e3 \u05dc\u05d9\u05e9\u05e8\u05d0\u05dc\u05d9\u05dd 2026</a> \u00b7 <a href="/news/critical-illness-insurance-guide-2026" class="internal-link">\u05d1\u05d9\u05d8\u05d5\u05d7 \u05de\u05d7\u05dc\u05d5\u05ea \u05e7\u05e9\u05d5\u05ea 2026</a> \u00b7 <a href="/news/pension-health" class="internal-link">\u05d4\u05db\u05e1\u05e4\u05ea \u05d4\u05e4\u05e8\u05d5\u05e6\u05d4</a>`),
  ].join("\n"),
  faq_items: JSON.stringify([
    { question: "\u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4 \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0\u05d5\u05d1\u05d3\u05df \u05db\u05d5\u05e9\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d4?", answer: "\u05d2\u05d9\u05dc 35 \u05d2\u05d1\u05e8: 150-250 \u20aa/\u05d7\u05d5\u05d3\u05e9 \u05dc\u05e7\u05e6\u05d1\u05d4 \u05e9\u05dc 10,000 \u20aa. \u05d2\u05d9\u05dc 45: 300-470 \u20aa/\u05d7\u05d5\u05d3\u05e9. \u05e0\u05e9\u05d9\u05dd \u05de\u05e9\u05dc\u05de\u05d5\u05ea \u05d9\u05d5\u05ea\u05e8. \u05de\u05e7\u05e6\u05d5\u05e2\u05d5\u05ea \u05e1\u05d9\u05db\u05d5\u05df \u05d2\u05d1\u05d5\u05d4 (\u05e2\u05d1\u05d5\u05d3\u05d4 \u05e4\u05d9\u05d6\u05d9\u05ea) \u05de\u05e9\u05dc\u05de\u05d9\u05dd \u05d9\u05d5\u05ea\u05e8." },
    { question: "\u05de\u05d4 \u05d4\u05d4\u05d1\u05d3\u05dc \u05d1\u05d9\u05df \u05d4\u05d2\u05d3\u05e8\u05ea \u05d6\u05db\u05d0\u05d9 \u05e1\u05d9\u05d0\u05d5\u05d1 \u05dc\u05d6\u05db\u05d0\u05d9 \u05d7\u05dc\u05e7\u05d9?", answer: "\u05e1\u05d9\u05d0\u05d5\u05d1 \u05e1\u05e4\u05e6\u05d9\u05e4\u05d9 = \u05dc\u05d0 \u05d9\u05db\u05d5\u05dc\u05dc \u05dc\u05e2\u05d1\u05d5\u05d3 \u05d1\u05e2\u05d9\u05e1\u05d5\u05e7\u05d4\u05e1\u05e4\u05e6\u05d9\u05e4\u05d9. \u05d7\u05dc\u05e7\u05d9 = \u05dc\u05d0 \u05d9\u05db\u05d5\u05dc \u05dc\u05e2\u05d1\u05d5\u05d3 \u05d1\u05db\u05dc \u05e2\u05d9\u05e1\u05d5\u05e7 \u05e1\u05d1\u05d9\u05e8 \u05dc\u05e4\u05d9 \u05d4\u05e9\u05db\u05dc\u05ea\u05d5 \u05d5\u05e0\u05d9\u05e1\u05d9\u05d5\u05e0\u05d5. \u05e1\u05d9\u05d0\u05d5\u05d1 \u05e1\u05e4\u05e6\u05d9\u05e4\u05d9 \u05e2\u05d3\u05d9\u05e3 \u05d1\u05d1\u05d9\u05e8\u05d5\u05e8 \u05dc\u05de\u05e7\u05e6\u05d5\u05e2\u05e0\u05d9\u05dd." },
    { question: "\u05d4\u05d0\u05dd \u05d4\u05e4\u05e0\u05e1\u05d9\u05d4 \u05de\u05e1\u05e4\u05d9\u05e7\u05d4 \u05dc\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0.כ.\u05e2?", answer: "\u05d1\u05d7\u05dc\u05e7. \u05d4\u05e4\u05e0\u05e1\u05d9\u05d4 \u05de\u05db\u05e1\u05d4 \u05e2\u05d3 75% \u05de\u05d4\u05e9\u05db\u05e8 \u05e9\u05e0\u05e8\u05e9\u05dd \u05d1\u05e4\u05e0\u05e1\u05d9\u05d4, \u05d0\u05da \u05d4\u05d2\u05d3\u05e8\u05ea \u05d4\u05d6\u05db\u05d0\u05d9 \u05dc\u05e8\u05d5\u05d1 '\u05db\u05dc \u05e2\u05d9\u05e1\u05d5\u05e7' \u05e7\u05e9\u05d4 \u05d9\u05d5\u05ea\u05e8 \u05dc\u05e2\u05de\u05d5\u05d3 \u05d1\u05d4. \u05de\u05d5\u05de\u05dc\u05e5 \u05dc\u05d1\u05d3\u05d5\u05e7 \u05d0\u05ea \u05de\u05e1\u05de\u05da \u05d4\u05e4\u05e0\u05e1\u05d9\u05d4 \u05d5\u05dc\u05e9\u05e7\u05d5\u05dc \u05d0\u05dd \u05d3\u05e8\u05d5\u05e9\u05d4 \u05e4\u05d5\u05dc\u05d9\u05e1\u05d4 \u05e0\u05d5\u05e1\u05e4\u05ea." },
    { question: "\u05de\u05d4 \u05ea\u05e7\u05d5\u05e4\u05ea \u05d4\u05de\u05ea\u05e0\u05d4 \u05d1\u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0.כ.\u05e2?", answer: "\u05d1\u05d3\u05e8\u05da \u05db\u05dc\u05dc 90 \u05d9\u05d5\u05dd \u05de\u05ea\u05d7\u05d9\u05dc\u05ea \u05d4\u05d0\u05d5\u05d1\u05d3\u05df. \u05e4\u05d5\u05dc\u05d9\u05e1\u05d5\u05ea \u05e2\u05dd 30-60 \u05d9\u05d5\u05dd \u05d6\u05de\u05d9\u05e0\u05d5\u05ea \u05d1\u05ea\u05d5\u05e1\u05e4\u05ea \u05de\u05d7\u05d9\u05e8 \u2014 \u05e2\u05d3\u05d9\u05e3 \u05dc\u05de\u05d9 \u05e9\u05e2\u05d9\u05e7\u05e8 \u05e2\u05d1\u05d5\u05d3\u05d5 \u05d4\u05d5\u05d0 \u05e2\u05e6\u05de\u05d0\u05d9 \u05d0\u05d5 \u05d1\u05e2\u05dc \u05e2\u05e1\u05e7 \u05e7\u05d8\u05df." },
  ]),
};

async function upsert(data) {
  const buf = Buffer.from(JSON.stringify({ action: "upsert", article: data }), "utf8");
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: HOST, path: "/functions/v1/manage-article", method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8",
          "x-admin-secret": ADMIN, Authorization: `Bearer ${ANON}`, "Content-Length": buf.length } },
      (res) => {
        res.setEncoding("utf8");
        let d = ""; res.on("data", c => d += c);
        res.on("end", () => {
          const r = JSON.parse(d);
          if (res.statusCode === 200 && r.success) resolve(r.article);
          else reject(new Error(r.error || `${res.statusCode}: ${d}`));
        });
      }
    );
    req.on("error", reject);
    req.write(buf); req.end();
  });
}

(async () => {
  process.stdout.write(`\u05e4\u05e8\u05e1\u05d5\u05dd \u05d1\u05d9\u05d8\u05d5\u05d7 \u05d0.\u05db.\u05e2 2026... `);
  const r = await upsert(article);
  console.log("\u2713", r.slug);
})().catch(console.error);
