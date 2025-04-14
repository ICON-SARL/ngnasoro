
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

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

interface RequestBody {
  sfd_data: SfdData;
  admin_id: string;
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

    // Get and validate the data sent
    const { sfd_data, admin_id }: RequestBody = await req.json();
    console.log('Received request to create SFD:', { sfd_data, admin_id });

    // Check if the user is an admin
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', admin_id)
      .eq('role', 'admin');

    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification des droits', details: roleError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userRoles || userRoles.length === 0) {
      console.error('User does not have admin role:', admin_id);
      return new Response(
        JSON.stringify({ error: 'Droits insuffisants pour créer une SFD' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Log an audit event
    const { error: auditError } = await supabaseClient.from('audit_logs').insert({
      user_id: admin_id,
      action: 'create_sfd',
      category: 'SFD_OPERATIONS',
      severity: 'INFO',
      status: 'success',
      details: { sfd_id: newSfd.id, sfd_name: newSfd.name },
    });

    if (auditError) {
      console.warn('Error logging audit event:', auditError);
      // Continue anyway, as the SFD was created successfully
    }

    return new Response(
      JSON.stringify(newSfd),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-sfd function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
