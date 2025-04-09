
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { notification } = await req.json();

    if (!notification || !notification.title || !notification.message || !notification.type || !notification.sender_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Les champs titre, message, type et sender_id sont requis"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Insert notification
    const { data, error } = await supabaseClient
      .from("admin_notifications")
      .insert({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        sender_id: notification.sender_id,
        recipient_id: notification.recipient_id || null,
        recipient_role: notification.recipient_role || null,
        action_link: notification.action_link || null,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
