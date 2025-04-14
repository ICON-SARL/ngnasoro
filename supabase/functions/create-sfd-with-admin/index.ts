
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

    // Verify authorization - the JWT check is temporarily disabled in config.toml
    // but we'll log the access attempt
    const authHeader = req.headers.get('Authorization');
    let userId = 'unknown';
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        
        if (!error && user) {
          userId = user.id;
          console.log(`Request authenticated from user: ${userId}, role: ${user.app_metadata?.role || 'unknown'}`);
          
          // Log the action in audit logs
          await supabaseClient.from('audit_logs').insert({
            user_id: userId,
            action: 'create_sfd',
            category: 'ADMIN_ACTION',
            status: 'initiated',
            severity: 'info',
            target_resource: 'sfds',
            details: { sfd_name: sfdData.name }
          });
        } else {
          console.log('Auth token provided but invalid:', error?.message);
        }
      } catch (authError) {
        console.error('Error verifying authentication:', authError);
      }
    } else {
      console.log('No authentication provided for SFD creation');
    }

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
          
          // Log the failure
          await supabaseClient.from('audit_logs').insert({
            user_id: userId,
            action: 'create_sfd',
            category: 'ADMIN_ACTION',
            status: 'failure',
            severity: 'error',
            target_resource: 'sfds',
            details: { 
              sfd_name: sfdData.name,
              error: error.message 
            },
            error_message: error.message
          });
          
          return new Response(
            JSON.stringify({ error: `Erreur lors de la création de la SFD et de l'administrateur: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Successfully created SFD with admin:', data);
        
        // Log success
        await supabaseClient.from('audit_logs').insert({
          user_id: userId,
          action: 'create_sfd',
          category: 'ADMIN_ACTION',
          status: 'success',
          severity: 'info',
          target_resource: 'sfds',
          details: { 
            sfd_id: data.sfd?.id,
            sfd_name: data.sfd?.name,
            admin_id: data.admin?.id
          }
        });
        
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
      
      // Log failure
      await supabaseClient.from('audit_logs').insert({
        user_id: userId,
        action: 'create_sfd',
        category: 'ADMIN_ACTION',
        status: 'failure',
        severity: 'error',
        target_resource: 'sfds',
        details: { 
          sfd_name: sfdData.name,
          error: insertError.message 
        },
        error_message: insertError.message
      });
      
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
    
    // Log successful creation
    await supabaseClient.from('audit_logs').insert({
      user_id: userId,
      action: 'create_sfd',
      category: 'ADMIN_ACTION',
      status: 'success',
      severity: 'info',
      target_resource: 'sfds',
      details: { 
        sfd_id: newSfd.id,
        sfd_name: newSfd.name,
        admin_id: adminUser?.id || existingAdminId
      }
    });

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
