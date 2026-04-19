/**
 * Netlify Scheduled Function — runs every Sunday at 06:00 Israel time (03:00 UTC)
 * Calls the Supabase Edge Function to refresh financial_tracks data from Yahoo Finance.
 *
 * Schedule: cron expression "0 3 * * 0" (Sunday 03:00 UTC = 06:00 IST)
 */
import type { Config } from "@netlify/functions";

const SUPABASE_FUNCTION_URL =
  "https://awxmwvyoellhdhgvxife.supabase.co/functions/v1/update-financial-tracks";

const ADMIN_SECRET = process.env.ARTICLE_ADMIN_SECRET ?? "";

export default async function handler() {
  const res = await fetch(SUPABASE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify({}),
  });

  const body = await res.json();
  console.log("[update-financial-tracks]", body);

  return new Response(JSON.stringify(body), {
    status: res.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  schedule: "0 3 * * 0", // Every Sunday 03:00 UTC (06:00 Israel time)
};
