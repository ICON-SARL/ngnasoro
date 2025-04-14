
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

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
    const { sfdData, createAdmin, adminData, existingAdminId } = await req.json();
    console.log('Received request to create SFD with admin:', { 
      sfdData, 
      createAdmin, 
      adminData: adminData ? { ...adminData, password: '***' } : null,
      existingAdminId
    });

    // Attempt to use the existing Supabase function for creating SFD with admin if admin is needed
    if (createAdmin && adminData) {
      try {
        // Call the database function to create SFD with admin
        const { data, error } = await supabaseClient.rpc('create_sfd_with_admin_and_accounts', {
          sfd_data: sfdData,
          admin_data: adminData
        });

        if (error) {
          console.error('Error creating SFD with admin:', error);
          return new Response(
            JSON.stringify({ error: `Erreur lors de la création de la SFD et de l'administrateur: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Successfully created SFD with admin:', data);
        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (dbFunctionError) {
        console.error('Error calling database function:', dbFunctionError);
        // Fall back to manual creation below
      }
    }

    // Insert the new SFD
    const { data: newSfd, error: insertError } = await supabaseClient
      .from('sfds')
      .insert([sfdData])
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
    await supabaseClient
      .from('sfd_stats')
      .insert({
        sfd_id: newSfd.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0,
      });

    // If we're associating an existing admin
    let adminUser = null;
    if (existingAdminId) {
      try {
        console.log('Associating existing admin', existingAdminId, 'with SFD', newSfd.id);
        
        // Create association in user_sfds table
        const { data: association, error: associationError } = await supabaseClient
          .from('user_sfds')
          .insert({
            user_id: existingAdminId,
            sfd_id: newSfd.id,
            is_default: true
          })
          .select()
          .single();
          
        if (associationError) {
          console.error('Error creating user-sfd association:', associationError);
          // Continue anyway, as the SFD is created
        }
        
        // Get admin details to return
        const { data: admin, error: adminError } = await supabaseClient
          .from('admin_users')
          .select('*')
          .eq('id', existingAdminId)
          .single();
          
        if (!adminError && admin) {
          adminUser = admin;
        }
        
        console.log('Admin association created:', association);
      } catch (associationError) {
        console.error('Error in admin association process:', associationError);
        // Continue anyway, as the SFD is created
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sfd: newSfd,
        admin: adminUser
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-sfd-with-admin function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
