
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
    console.log("Fonction process-subsidy-request appelée");
    
    // Vérifier les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variables d'environnement manquantes: SUPABASE_URL ou SUPABASE_ANON_KEY");
      return new Response(
        JSON.stringify({ error: "Configuration serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    // Parser le corps de la requête
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError.message);
      return new Response(
        JSON.stringify({ error: "Format JSON invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { action, requestId, data } = requestBody;
    console.log("Action demandée:", action, "Request ID:", requestId);
    
    // Vérifier l'authentification
    const { data: authData, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError) {
      console.error("Erreur d'authentification:", authError.message);
      return new Response(
        JSON.stringify({ error: "Erreur d'authentification", details: authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const user = authData?.user;
    
    if (!user) {
      console.error("Utilisateur non authentifié");
      return new Response(
        JSON.stringify({ error: "Non autorisé: utilisateur non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Utilisateur authentifié:", user.id);
    
    let result;
    
    switch (action) {
      case "approve":
        console.log("Approbation de la demande:", requestId);
        // Approuver la demande de subvention
        const { data: approveData, error: approveError } = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
          })
          .eq("id", requestId)
          .select();
          
        if (approveError) {
          console.error("Erreur lors de l'approbation:", approveError);
          throw approveError;
        }
        
        // Créer une entrée d'activité
        const { error: activityError } = await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "request_approved",
          performed_by: user.id,
          description: "Demande de subvention approuvée",
        });
        
        if (activityError) {
          console.warn("Erreur lors de la création de l'activité:", activityError);
          // Continue malgré l'erreur d'activité
        }
        
        result = approveData;
        break;
        
      case "reject":
        console.log("Rejet de la demande:", requestId);
        // Rejeter la demande de subvention
        const { data: rejectData, error: rejectError } = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            decision_comments: data?.comments || "",
          })
          .eq("id", requestId)
          .select();
          
        if (rejectError) {
          console.error("Erreur lors du rejet:", rejectError);
          throw rejectError;
        }
        
        // Créer une entrée d'activité
        const { error: rejectActivityError } = await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "request_rejected",
          performed_by: user.id,
          description: "Demande de subvention rejetée",
          details: data?.comments ? { comments: data.comments } : null,
        });
        
        if (rejectActivityError) {
          console.warn("Erreur lors de la création de l'activité de rejet:", rejectActivityError);
          // Continue malgré l'erreur d'activité
        }
        
        result = rejectData;
        break;
        
      case "details":
        console.log("Récupération des détails pour:", requestId);
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
          
        if (requestError) {
          console.error("Erreur lors de la récupération des détails:", requestError);
          throw requestError;
        }
        
        // Récupérer l'historique des activités
        const { data: activities, error: activitiesError } = await supabaseClient
          .from("subsidy_request_activities")
          .select("*")
          .eq("request_id", requestId)
          .order("performed_at", { ascending: false });
          
        if (activitiesError) {
          console.error("Erreur lors de la récupération des activités:", activitiesError);
          throw activitiesError;
        }
        
        result = {
          request: requestData,
          activities: activities,
        };
        
        break;
        
      default:
        console.error("Action non reconnue:", action);
        return new Response(
          JSON.stringify({ error: "Action non reconnue" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    console.log("Opération réussie");
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Erreur non gérée:", error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
