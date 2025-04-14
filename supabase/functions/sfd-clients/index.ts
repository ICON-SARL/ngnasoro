
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sfd-id",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Gestion du CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuration du serveur manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Créer un client Supabase avec la clé de service (privilèges admin)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extraire les paramètres de la requête
    const body = await req.json();
    const { action, sfdId, clientId, validatedBy, clientData } = body;
    
    // Traiter selon l'action demandée
    if (action === "getClients" && sfdId) {
      console.log(`Récupération des clients pour la SFD: ${sfdId}`);
      
      const { data, error } = await supabase
        .from("sfd_clients")
        .select("*")
        .eq("sfd_id", sfdId)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Erreur lors de la récupération des clients:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(data || []),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "createClient" && sfdId && clientData) {
      console.log(`Création d'un nouveau client pour la SFD: ${sfdId}`);
      
      const { data, error } = await supabase
        .from("sfd_clients")
        .insert({
          ...clientData,
          sfd_id: sfdId,
          status: "pending",
          kyc_level: 0
        })
        .select()
        .single();
        
      if (error) {
        console.error("Erreur lors de la création du client:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Créer une activité client pour tracer cette création
      await supabase
        .from("client_activities")
        .insert({
          client_id: data.id,
          activity_type: "client_creation",
          description: "Nouveau client créé"
        });
      
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "validateClient" && clientId && validatedBy) {
      console.log(`Validation du client: ${clientId} par ${validatedBy}`);
      
      const { data, error } = await supabase
        .from("sfd_clients")
        .update({
          status: "validated",
          validated_at: new Date().toISOString(),
          validated_by: validatedBy
        })
        .eq("id", clientId)
        .select()
        .single();
        
      if (error) {
        console.error("Erreur lors de la validation du client:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Créer une activité client pour tracer cette validation
      await supabase
        .from("client_activities")
        .insert({
          client_id: clientId,
          activity_type: "account_validation",
          description: "Compte client validé",
          performed_by: validatedBy
        });
      
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "rejectClient" && clientId && validatedBy) {
      console.log(`Rejet du client: ${clientId} par ${validatedBy}`);
      
      const { data, error } = await supabase
        .from("sfd_clients")
        .update({
          status: "rejected",
          validated_at: new Date().toISOString(),
          validated_by: validatedBy
        })
        .eq("id", clientId)
        .select()
        .single();
        
      if (error) {
        console.error("Erreur lors du rejet du client:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Créer une activité client pour tracer ce rejet
      await supabase
        .from("client_activities")
        .insert({
          client_id: clientId,
          activity_type: "account_rejection",
          description: "Compte client rejeté",
          performed_by: validatedBy
        });
      
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "deleteClient" && clientId) {
      console.log(`Suppression du client: ${clientId}`);
      
      // D'abord, supprimer les documents associés
      await supabase
        .from("client_documents")
        .delete()
        .eq("client_id", clientId);
      
      // Ensuite, supprimer les activités associées
      await supabase
        .from("client_activities")
        .delete()
        .eq("client_id", clientId);
      
      // Enfin, supprimer le client
      const { error } = await supabase
        .from("sfd_clients")
        .delete()
        .eq("id", clientId);
        
      if (error) {
        console.error("Erreur lors de la suppression du client:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Action non supportée
    return new Response(
      JSON.stringify({ error: "Action non supportée" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Erreur serveur:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur inattendue s'est produite" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
