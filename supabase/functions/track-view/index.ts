import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { article_id, visitor_hash } = await req.json();

    if (!article_id) {
      return new Response(
        JSON.stringify({ error: "article_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for recent view from same visitor (debounce - 5 minute window)
    if (visitor_hash) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentView } = await supabase
        .from("article_views")
        .select("id")
        .eq("article_id", article_id)
        .eq("visitor_hash", visitor_hash)
        .gte("viewed_at", fiveMinutesAgo)
        .limit(1)
        .maybeSingle();

      if (recentView) {
        console.log(`Debounced view for article ${article_id} from visitor ${visitor_hash}`);
        return new Response(
          JSON.stringify({ success: true, debounced: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert new view record
    const { error: insertError } = await supabase
      .from("article_views")
      .insert({
        article_id,
        visitor_hash: visitor_hash || null,
      });

    if (insertError) {
      console.error("Error inserting view:", insertError);
      throw insertError;
    }

    // Update view_count on articles table (for quick access)
    const { error: updateError } = await supabase
      .from("articles")
      .update({ view_count: supabase.rpc("increment_view_count", { row_id: article_id }) })
      .eq("id", article_id);

    // If increment function doesn't exist, do manual increment
    if (updateError) {
      const { data: article } = await supabase
        .from("articles")
        .select("view_count")
        .eq("id", article_id)
        .single();

      if (article) {
        await supabase
          .from("articles")
          .update({ view_count: (article.view_count || 0) + 1 })
          .eq("id", article_id);
      }
    }

    console.log(`Recorded view for article ${article_id}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in track-view:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
