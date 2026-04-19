/**
 * update-financial-tracks
 * Fetches real-time YTD returns from Yahoo Finance and updates the financial_tracks table.
 * Triggered weekly via Supabase cron (pg_cron) or manually via HTTP.
 *
 * Security: requires x-admin-secret header (same secret as manage-article).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_SECRET = Deno.env.get("ARTICLE_ADMIN_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-admin-secret",
};

// ─── Symbol map ─────────────────────────────────────────────────────────────
// Maps (name, type) patterns to Yahoo Finance symbols.
// YTD return is calculated as: (currentPrice - yearStart) / yearStart * 100
const SYMBOL_MAP: { namePattern: string; symbol: string }[] = [
  // ── מדדים ספציפיים (specific first) ──────────────────────────
  { namePattern: 'S&P 500',                   symbol: '^GSPC'     },
  { namePattern: 'נאסד"ק 100',                symbol: '^NDX'      },
  { namePattern: 'נאסדק 100',                 symbol: '^NDX'      },
  { namePattern: 'ת"א 125',                   symbol: '^TA125.TA' },
  { namePattern: 'ת"א 35',                    symbol: '^TA35.TA'  },
  { namePattern: 'מניות ישראל',               symbol: '^TA125.TA' },
  { namePattern: 'MSCI World',                symbol: 'ACWI'      },
  { namePattern: 'מניות עולמי',               symbol: 'ACWI'      },
  { namePattern: 'עולמי',                     symbol: 'ACWI'      },
  { namePattern: 'שווקים מתפתחים',            symbol: 'VWO'       },
  { namePattern: 'מתפתחים',                   symbol: 'VWO'       },
  // ── אג"ח ──────────────────────────────────────────────────────
  { namePattern: 'אג"ח ממשלתי',               symbol: 'IEF'       }, // Mid-term gov bond ETF
  { namePattern: 'אגח ממשלתי',                symbol: 'IEF'       },
  { namePattern: 'אג"ח',                      symbol: 'AGG'       }, // Aggregate bond ETF
  // ── שמרני / פרישה (before כללי to match first) ───────────────
  { namePattern: 'לגיל פרישה',                symbol: 'AOK'       }, // Conservative 30/70
  { namePattern: 'שמרני',                     symbol: 'AOK'       },
  // ── מסלולי מניות כלליים ───────────────────────────────────────
  { namePattern: 'מסלול מניות',               symbol: '^GSPC'     },
  { namePattern: 'מניות',                     symbol: '^GSPC'     },
  // ── כללי (general balanced) ───────────────────────────────────
  { namePattern: 'כללי',                      symbol: 'AOR'       }, // 60/40 balanced ETF
];

function resolveSymbol(trackName: string): string | null {
  for (const { namePattern, symbol } of SYMBOL_MAP) {
    if (trackName.includes(namePattern)) return symbol;
  }
  return null;
}

// ─── Yahoo Finance fetch ─────────────────────────────────────────────────────
interface YahooResult {
  ytdReturn: number;     // percent
  yearReturn: number;    // percent (last 12 months)
}

async function fetchYahooFinance(symbol: string): Promise<YahooResult | null> {
  try {
    // YTD chart
    const ytdUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=ytd`;
    const ytdRes = await fetch(ytdUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MadrichlBot/1.0)" },
    });
    if (!ytdRes.ok) return null;
    const ytdData = await ytdRes.json();
    const closes: number[] = ytdData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    if (closes.length < 2) return null;
    const firstClose = closes.find((v) => v !== null && v !== undefined) ?? closes[0];
    const lastClose = closes.filter((v) => v !== null && v !== undefined).at(-1) ?? closes.at(-1);
    if (!firstClose || !lastClose) return null;
    const ytdReturn = ((lastClose - firstClose) / firstClose) * 100;

    // 1-year chart
    const yearUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
    const yearRes = await fetch(yearUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MadrichlBot/1.0)" },
    });
    let yearReturn = ytdReturn;
    if (yearRes.ok) {
      const yearData = await yearRes.json();
      const yearCloses: number[] = yearData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
      const yFirst = yearCloses.find((v) => v !== null) ?? yearCloses[0];
      const yLast = yearCloses.filter((v) => v !== null).at(-1) ?? yearCloses.at(-1);
      if (yFirst && yLast) yearReturn = ((yLast - yFirst) / yFirst) * 100;
    }

    return { ytdReturn, yearReturn };
  } catch {
    return null;
  }
}

// ─── Main handler ────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  // Auth — allow both x-admin-secret header and internal cron (no secret needed for pg_cron)
  const secret = req.headers.get("x-admin-secret");
  const isCron = req.headers.get("x-supabase-cron") === "1";
  if (!isCron && ADMIN_SECRET && secret !== ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch all tracks
  const { data: tracks, error: fetchErr } = await supabase
    .from("financial_tracks")
    .select("*");

  if (fetchErr || !tracks) {
    return new Response(JSON.stringify({ error: fetchErr?.message }), { status: 500, headers: cors });
  }

  const results: { name: string; symbol: string | null; updated: boolean; ytd?: number }[] = [];

  for (const track of tracks) {
    const symbol = resolveSymbol(track.name);
    if (!symbol) {
      results.push({ name: track.name, symbol: null, updated: false });
      continue;
    }

    const data = await fetchYahooFinance(symbol);
    if (!data) {
      results.push({ name: track.name, symbol, updated: false });
      continue;
    }

    // Round to 2 decimal places
    const ytd = Math.round(data.ytdReturn * 100) / 100;
    const year = Math.round(data.yearReturn * 100) / 100;

    const { error: updateErr } = await supabase
      .from("financial_tracks")
      .update({
        ytd_return: ytd,
        last_year_return: year,
        last_updated: new Date().toISOString(),
      })
      .eq("id", track.id);

    results.push({ name: track.name, symbol, updated: !updateErr, ytd });
  }

  const updated = results.filter((r) => r.updated).length;
  return new Response(
    JSON.stringify({ success: true, updated, total: tracks.length, results }),
    { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
  );
});
