
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
    
    // TRAITEMENT DES REQUÊTES
    
    // Actions existantes
    if (action === "getClients" && sfdId) {
      console.log(`Récupération des clients pour la SFD: ${sfdId}`);
      
      let query = supabase
        .from("sfd_clients")
        .select("*")
        .eq("sfd_id", sfdId);
        
      // Apply filters if provided
      if (body.status) {
        query = query.eq("status", body.status);
      }
      
      if (body.searchTerm) {
        query = query.or(`full_name.ilike.%${body.searchTerm}%,email.ilike.%${body.searchTerm}%,phone.ilike.%${body.searchTerm}%`);
      }
      
      // Apply pagination if provided
      if (body.limit) {
        const page = body.page || 0;
        const limit = body.limit;
        const offset = page * limit;
        query = query.range(offset, offset + limit - 1);
      }
      
      // Apply sorting
      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
        
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

    // NOUVELLES ACTIONS POUR LA GESTION EN MASSE
    
    // Validation en masse
    if (action === "batchValidateClients" && body.clientIds && Array.isArray(body.clientIds) && validatedBy) {
      console.log(`Validation en masse de ${body.clientIds.length} clients par ${validatedBy}`);
      
      // Mise à jour des clients
      const { data, error } = await supabase
        .from("sfd_clients")
        .update({
          status: "validated",
          validated_at: new Date().toISOString(),
          validated_by: validatedBy,
          notes: body.notes
        })
        .in("id", body.clientIds)
        .select();
        
      if (error) {
        console.error("Erreur lors de la validation en masse des clients:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Créer des activités client pour chaque validation
      const activities = body.clientIds.map(clientId => ({
        client_id: clientId,
        activity_type: "account_validation",
        description: "Compte client validé (opération en masse)",
        performed_by: validatedBy
      }));
      
      await supabase
        .from("client_activities")
        .insert(activities);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: data.length,
          clients: data
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Rejet en masse
    if (action === "batchRejectClients" && body.clientIds && Array.isArray(body.clientIds) && validatedBy) {
      console.log(`Rejet en masse de ${body.clientIds.length} clients par ${validatedBy}`);
      
      // Mise à jour des clients
      const { data, error } = await supabase
        .from("sfd_clients")
        .update({
          status: "rejected",
          validated_at: new Date().toISOString(),
          validated_by: validatedBy,
          notes: body.rejectionReason
        })
        .in("id", body.clientIds)
        .select();
        
      if (error) {
        console.error("Erreur lors du rejet en masse des clients:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Créer des activités client pour chaque rejet
      const activities = body.clientIds.map(clientId => ({
        client_id: clientId,
        activity_type: "account_rejection",
        description: `Compte client rejeté (opération en masse): ${body.rejectionReason || ''}`,
        performed_by: validatedBy
      }));
      
      await supabase
        .from("client_activities")
        .insert(activities);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: data.length,
          clients: data
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Import en masse de clients
    if (action === "importClients" && sfdId && body.clients && Array.isArray(body.clients) && body.importedBy) {
      console.log(`Import en masse de ${body.clients.length} clients pour la SFD: ${sfdId}`);
      
      // Ajouter le sfd_id et le statut par défaut à chaque client
      const clientsToInsert = body.clients.map(client => ({
        ...client,
        sfd_id: sfdId,
        status: "pending",
        kyc_level: 0
      }));
      
      // Insérer les clients en masse
      const { data, error } = await supabase
        .from("sfd_clients")
        .insert(clientsToInsert)
        .select();
        
      if (error) {
        console.error("Erreur lors de l'import en masse des clients:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Créer des activités client pour chaque import
      const activities = data.map(client => ({
        client_id: client.id,
        activity_type: "client_import",
        description: "Client importé en masse",
        performed_by: body.importedBy
      }));
      
      await supabase
        .from("client_activities")
        .insert(activities);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: data.length,
          clients: data
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Export de clients
    if (action === "exportClients" && sfdId) {
      console.log(`Export des clients pour la SFD: ${sfdId}`);
      
      let query = supabase
        .from("sfd_clients")
        .select(`
          id, 
          full_name, 
          email, 
          phone, 
          address, 
          id_number, 
          id_type, 
          status, 
          created_at, 
          validated_at, 
          kyc_level,
          client_documents (id, document_type, document_url, verified)
        `)
        .eq("sfd_id", sfdId);
      
      // Appliquer les filtres si fournis
      if (body.status) {
        query = query.eq("status", body.status);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Erreur lors de l'export des clients:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Format CSV si demandé
      if (body.format === 'csv') {
        // Simplifier les données pour le CSV (aplatir les documents)
        const simplifiedData = data.map(client => {
          const { client_documents, ...clientData } = client;
          return {
            ...clientData,
            document_count: client_documents?.length || 0,
            verified_documents: client_documents?.filter(d => d.verified)?.length || 0
          };
        });
        
        // Convertir en CSV
        const headers = Object.keys(simplifiedData[0] || {}).join(',');
        const rows = simplifiedData.map(client => 
          Object.values(client).map(val => 
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
          ).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${rows}`;
        
        return new Response(
          csv,
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="sfd_clients_${sfdId}_${new Date().toISOString().split('T')[0]}.csv"`
            }
          }
        );
      }
      
      // Format JSON par défaut
      return new Response(
        JSON.stringify(data || []),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Analytiques des clients
    if (action === "getClientAnalytics" && sfdId) {
      console.log(`Récupération des analytiques clients pour la SFD: ${sfdId}`);
      
      const period = body.period || 'month';
      let timeInterval: string;
      
      // Déterminer l'intervalle de temps pour les requêtes
      switch (period) {
        case 'day':
          timeInterval = '1 day';
          break;
        case 'week':
          timeInterval = '1 week';
          break;
        case 'year':
          timeInterval = '1 year';
          break;
        case 'month':
        default:
          timeInterval = '1 month';
          break;
      }
      
      // Récupérer le nombre total de clients
      const { count: totalClients, error: countError } = await supabase
        .from("sfd_clients")
        .select("id", { count: 'exact', head: true })
        .eq("sfd_id", sfdId);
      
      if (countError) {
        console.error("Erreur lors de la récupération du nombre total de clients:", countError);
        return new Response(
          JSON.stringify({ error: countError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Récupérer les statistiques par statut
      const { data: statusStats, error: statusError } = await supabase
        .from("sfd_clients")
        .select("status, count")
        .eq("sfd_id", sfdId)
        .group("status");
      
      if (statusError) {
        console.error("Erreur lors de la récupération des statistiques par statut:", statusError);
        return new Response(
          JSON.stringify({ error: statusError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Récupérer les nouveaux clients par période
      const { data: newClientsData, error: newClientsError } = await supabase.rpc(
        'get_new_clients_by_period',
        { 
          p_sfd_id: sfdId,
          p_interval: timeInterval
        }
      );
      
      if (newClientsError) {
        console.error("Erreur lors de la récupération des nouveaux clients par période:", newClientsError);
        return new Response(
          JSON.stringify({ error: newClientsError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Récupérer le taux de conversion (clients validés / total)
      const { data: conversionData, error: conversionError } = await supabase
        .from("sfd_clients")
        .select("status, count")
        .eq("sfd_id", sfdId)
        .in("status", ["validated", "rejected"])
        .group("status");
      
      if (conversionError) {
        console.error("Erreur lors de la récupération du taux de conversion:", conversionError);
        return new Response(
          JSON.stringify({ error: conversionError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Calculer le taux de conversion
      const validatedCount = conversionData?.find(item => item.status === "validated")?.count || 0;
      const rejectedCount = conversionData?.find(item => item.status === "rejected")?.count || 0;
      const totalProcessed = validatedCount + rejectedCount;
      const conversionRate = totalProcessed > 0 ? (validatedCount / totalProcessed) * 100 : 0;
      
      // Construire les résultats
      const analytics = {
        totalClients: totalClients || 0,
        statusDistribution: statusStats || [],
        newClients: newClientsData || [],
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        period
      };
      
      return new Response(
        JSON.stringify(analytics),
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
