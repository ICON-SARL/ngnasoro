
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const { email, password, clientId } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Email ou mot de passe manquant" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get client information
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('full_name, sfd_id')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return new Response(
        JSON.stringify({ success: false, error: "Client non trouvé", details: clientError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get SFD information
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('name')
      .eq('id', clientData.sfd_id)
      .single();

    if (sfdError || !sfdData) {
      return new Response(
        JSON.stringify({ success: false, error: "SFD non trouvée", details: sfdError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Log an activity for the credential creation
    await supabase
      .from('client_activities')
      .insert({
        client_id: clientId,
        activity_type: 'account_creation',
        description: 'Informations de connexion envoyées au client',
      });

    // In a real system, you would actually send an email here
    // For now, let's just log the information
    console.log(`
      Informations de connexion pour ${clientData.full_name}
      ----------------------------------------------
      Email: ${email}
      Mot de passe temporaire: ${password}
      SFD: ${sfdData.name}
      
      Merci de vous connecter à l'application et de changer votre mot de passe dès que possible.
    `);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Informations de connexion envoyées avec succès",
        // Dans un environnement de production, ne pas renvoyer le mot de passe
        // Ceci est uniquement pour le développement
        credentials: { email, password }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
