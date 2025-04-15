
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

interface SfdData {
  name: string;
  code: string;
  region: string | null;
  status: string;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  description: string | null;
}

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the data from the request
    const sfd_data: SfdData = await req.json();
    console.log('Received request to create SFD:', sfd_data);
    
    // Ensure the status field is valid
    if (!sfd_data.status) {
      sfd_data.status = 'active'; // Default to active if not specified
    }
    
    // Validate status value is one of the allowed values
    const validStatuses = ['active', 'pending', 'suspended'];
    if (!validStatuses.includes(sfd_data.status)) {
      return new Response(
        JSON.stringify({ 
          error: 'Statut invalide', 
          details: `Le statut doit être l'un des suivants: ${validStatuses.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if SFD code already exists
    const { data: existingSfd, error: checkError } = await supabaseClient
      .from('sfds')
      .select('code')
      .eq('code', sfd_data.code)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is what we want
      console.error('Error checking SFD code uniqueness:', checkError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification du code SFD', details: checkError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (existingSfd) {
      return new Response(
        JSON.stringify({ error: 'Le code SFD existe déjà', details: 'Veuillez utiliser un code unique' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the new SFD
    const { data: newSfd, error: insertError } = await supabaseClient
      .from('sfds')
      .insert([sfd_data])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting SFD:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la SFD', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SFD created successfully:', newSfd);

    // Create an entry in the stats for the new SFD
    const { error: statsError } = await supabaseClient
      .from('sfd_stats')
      .insert({
        sfd_id: newSfd.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0,
      });

    if (statsError) {
      console.warn('Error creating stats for SFD:', statsError);
      // Continue anyway, as the SFD was created successfully
    }

    return new Response(
      JSON.stringify(newSfd),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-new-sfd function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
