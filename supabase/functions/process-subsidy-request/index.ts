
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    const { action, requestId, data } = await req.json();
    
    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let result;
    
    switch (action) {
      case "approve":
        // Approuver la demande de subvention
        result = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
          })
          .eq("id", requestId)
          .select();
          
        // Créer une entrée d'activité
        await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "request_approved",
          performed_by: user.id,
          description: "Demande de subvention approuvée",
        });
        
        break;
        
      case "reject":
        // Rejeter la demande de subvention
        result = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            decision_comments: data?.comments || "",
          })
          .eq("id", requestId)
          .select();
          
        // Créer une entrée d'activité
        await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "request_rejected",
          performed_by: user.id,
          description: "Demande de subvention rejetée",
          details: data?.comments ? { comments: data.comments } : null,
        });
        
        break;
        
      case "details":
        // Récupérer les détails complets de la demande
        const { data: requestData, error: requestError } = await supabaseClient
          .from("subsidy_requests")
          .select(`
            *,
            sfds:sfd_id(id, name, region, code),
            requester:requested_by(id, email),
            reviewer:reviewed_by(id, email)
          `)
          .eq("id", requestId)
          .single();
          
        if (requestError) throw requestError;
        
        // Récupérer l'historique des activités
        const { data: activities, error: activitiesError } = await supabaseClient
          .from("subsidy_request_activities")
          .select("*")
          .eq("request_id", requestId)
          .order("performed_at", { ascending: false });
          
        if (activitiesError) throw activitiesError;
        
        result = {
          request: requestData,
          activities: activities,
        };
        
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Action non reconnue" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
