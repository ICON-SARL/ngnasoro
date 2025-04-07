
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Configurez les en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extraire les données de la requête
    const { admin_id, sfd_id, is_primary } = await req.json();
    
    if (!admin_id || !sfd_id) {
      return new Response(
        JSON.stringify({ error: 'admin_id et sfd_id sont requis' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Vérifier si l'admin existe
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', admin_id)
      .single();
    
    if (adminError || !adminData) {
      return new Response(
        JSON.stringify({ error: `Administrateur non trouvé: ${adminError?.message || 'Unknown error'}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }

    // Vérifier si la SFD existe
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('*')
      .eq('id', sfd_id)
      .single();
    
    if (sfdError || !sfdData) {
      return new Response(
        JSON.stringify({ error: `SFD non trouvée: ${sfdError?.message || 'Unknown error'}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 404 }
      );
    }

    // Pour l'instant, stocker l'association dans les métadonnées utilisateur (comme solution temporaire)
    // et nous pouvons créer une véritable table d'association plus tard si nécessaire
    const { data: userData, error: userError } = await supabase.auth.admin.updateUserById(
      admin_id,
      {
        user_metadata: { 
          sfd_id: sfd_id,
          is_primary_admin: is_primary === true
        }
      }
    );
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la mise à jour des métadonnées: ${userError.message}` }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    // Retourner les données mises à jour
    return new Response(
      JSON.stringify({ success: true, data: userData }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ error: `Une erreur est survenue: ${error.message || 'Unknown error'}` }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
