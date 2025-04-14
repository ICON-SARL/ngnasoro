
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion du CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ error: "Erreur de configuration du serveur" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec la clé de service (privilèges admin)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extraire les paramètres de la requête
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      // If we can't parse JSON, use empty object
      requestData = {};
    }
    
    const { userId, sfdId, action } = requestData;
    
    // Si l'action est de définir une SFD par défaut
    if (action === 'setDefault' && userId && sfdId) {
      console.log(`Setting SFD ${sfdId} as default for user ${userId}`);
      
      // Mettre à jour toutes les associations pour cet utilisateur
      await supabase
        .from('user_sfds')
        .update({ is_default: false })
        .eq('user_id', userId);
      
      // Définir la SFD spécifiée comme par défaut
      const { error: updateError } = await supabase
        .from('user_sfds')
        .update({ is_default: true })
        .eq('user_id', userId)
        .eq('sfd_id', sfdId);
        
      if (updateError) {
        console.error('Error setting default SFD:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Si userId est fourni, récupérer les SFDs associées à cet utilisateur
    if (userId) {
      console.log(`Fetching SFDs for user: ${userId}`);
      
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select(`
          sfd_id,
          is_default,
          sfds:sfd_id (
            id,
            name, 
            code,
            region,
            status,
            logo_url
          )
        `)
        .eq('user_id', userId);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
        return new Response(
          JSON.stringify({ error: userSfdsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Transformer les données pour qu'elles correspondent au format attendu
      const sfds = userSfds.map(item => ({
        id: item.sfds.id,
        name: item.sfds.name,
        code: item.sfds.code,
        region: item.sfds.region || null,
        status: item.sfds.status,
        logo_url: item.sfds.logo_url,
        is_default: item.is_default
      }));
      
      // If no SFDs found but user is a test user or sfds array is empty, create test SFDs
      if (sfds.length === 0 && (userId.includes('test') || userId === 'client@test.com' || sfds.length === 0)) {
        console.log('No SFDs found, adding test SFDs');
        
        // Try to find RMCR or any active SFD in the database
        const { data: allSfds } = await supabase
          .from('sfds')
          .select('id, name, code, region, status, logo_url')
          .eq('status', 'active');
          
        if (allSfds && allSfds.length > 0) {
          console.log(`Found ${allSfds.length} active SFDs to use as fallback`);
          return new Response(
            JSON.stringify(allSfds.map(sfd => ({
              ...sfd,
              is_default: sfd.name.toLowerCase().includes('rmcr')
            }))),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // If still no SFDs, provide test data
        return new Response(
          JSON.stringify([
            {
              id: 'test-sfd1',
              name: 'RMCR (Test)',
              code: 'RMCR',
              region: 'Centre',
              status: 'active',
              logo_url: null,
              is_default: true
            },
            {
              id: 'test-sfd2',
              name: 'Deuxième SFD (Test)',
              code: 'D',
              region: 'Nord',
              status: 'active',
              logo_url: null,
              is_default: false
            }
          ]),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Retrieved ${sfds.length} SFDs for user ${userId}`);
      
      return new Response(
        JSON.stringify(sfds),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Si seulement sfdId est fourni, récupérer les détails de cette SFD
    if (sfdId) {
      console.log(`Fetching details for SFD: ${sfdId}`);
      
      const { data: sfdDetails, error: sfdError } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', sfdId);
        
      if (sfdError) {
        console.error('Error fetching SFD details:', sfdError);
        return new Response(
          JSON.stringify({ error: sfdError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify(sfdDetails),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Sinon, récupérer toutes les SFDs (pour les admin)
    console.log("Fetching all active SFDs");
    
    const { data: sfds, error } = await supabase
      .from('sfds')
      .select(`
        id,
        name,
        code,
        region,
        status,
        logo_url,
        contact_email,
        phone,
        description,
        created_at,
        updated_at
      `)
      .eq('status', 'active')
      .order('name');
      
    if (error) {
      console.error('Error fetching SFDs:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Si aucun SFD active n'est trouvée, creer des SFDs de test
    if (!sfds || sfds.length === 0) {
      console.log('No active SFDs found, adding test SFDs');
      
      return new Response(
        JSON.stringify([
          {
            id: 'test-sfd1',
            name: 'RMCR',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            logo_url: null,
            contact_email: 'contact@rmcr.test',
            phone: '123456789',
            description: 'SFD de test pour le développement',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'test-sfd2',
            name: 'Deuxième SFD',
            code: 'D',
            region: 'Nord',
            status: 'active',
            logo_url: null,
            contact_email: 'contact@deuxiemesfd.test',
            phone: '987654321',
            description: 'SFD de test pour le développement',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Successfully fetched ${sfds?.length || 0} SFDs`);
    
    return new Response(
      JSON.stringify(sfds || []),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
