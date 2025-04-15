
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// Define CORS headers
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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Create a Supabase admin client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from Auth context to verify they're allowed to do this
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'User not authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verify the user has admin privileges by checking their role
    const { data: userData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userData || !(userData.role === 'admin' || userData.role === 'sfd_admin')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'User not authorized to perform this action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log('Starting synchronization of users and roles...');
    
    // Step 1: Synchronize SFD administrators with Auth metadata
    console.log('Synchronizing SFD administrators with Auth metadata...');
    
    // Get all active SFD administrators from the sfd_administrators table
    const { data: sfdAdmins, error: adminsError } = await supabaseClient
      .from('sfd_administrators')
      .select('user_id, sfd_id, status')
      .eq('status', 'active');

    if (adminsError) {
      throw new Error(`Failed to fetch SFD administrators: ${adminsError.message}`);
    }

    console.log(`Found ${sfdAdmins?.length || 0} active SFD administrators`);

    // Update auth metadata for each SFD admin
    for (const admin of sfdAdmins || []) {
      console.log(`Updating metadata for SFD admin: ${admin.user_id}`);
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        admin.user_id,
        { app_metadata: { role: 'sfd_admin', sfd_id: admin.sfd_id } }
      );
      
      if (updateError) {
        console.error(`Failed to update user ${admin.user_id} metadata:`, updateError);
      } else {
        console.log(`Successfully updated metadata for user ${admin.user_id}`);
      }
    }

    // Step 2: Ensure user_roles table is in sync for SFD admins
    console.log('Synchronizing user_roles table for SFD admins...');

    for (const admin of sfdAdmins || []) {
      // Check if role already exists
      const { data: existingRole, error: roleCheckError } = await supabaseClient
        .from('user_roles')
        .select('id')
        .eq('user_id', admin.user_id)
        .eq('role', 'sfd_admin')
        .maybeSingle();

      if (roleCheckError) {
        console.error(`Error checking existing role for ${admin.user_id}:`, roleCheckError);
        continue;
      }

      if (!existingRole) {
        // Create the role if it doesn't exist
        const { error: insertRoleError } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: admin.user_id,
            role: 'sfd_admin'
          });

        if (insertRoleError) {
          console.error(`Failed to insert role for user ${admin.user_id}:`, insertRoleError);
        } else {
          console.log(`Created sfd_admin role for user ${admin.user_id}`);
        }
      } else {
        console.log(`User ${admin.user_id} already has sfd_admin role`);
      }
    }

    // Step 3: Verify user_sfds associations
    console.log('Verifying user_sfds associations...');
    
    for (const admin of sfdAdmins || []) {
      // Check if association already exists
      const { data: existingAssoc, error: assocCheckError } = await supabaseClient
        .from('user_sfds')
        .select('id')
        .eq('user_id', admin.user_id)
        .eq('sfd_id', admin.sfd_id)
        .maybeSingle();

      if (assocCheckError) {
        console.error(`Error checking user_sfds for ${admin.user_id}:`, assocCheckError);
        continue;
      }

      if (!existingAssoc) {
        // Create the association if it doesn't exist
        const { error: insertAssocError } = await supabaseClient
          .from('user_sfds')
          .insert({
            user_id: admin.user_id,
            sfd_id: admin.sfd_id,
            is_default: true
          });

        if (insertAssocError) {
          console.error(`Failed to create user_sfds association for ${admin.user_id}:`, insertAssocError);
        } else {
          console.log(`Created user_sfds association for user ${admin.user_id} and SFD ${admin.sfd_id}`);
        }
      } else {
        console.log(`User ${admin.user_id} already has association with SFD ${admin.sfd_id}`);
      }
    }

    // Audit log
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'roles_synchronized',
        category: 'ADMIN_ACTION',
        severity: 'INFO',
        status: 'success',
        details: {
          admin_count: sfdAdmins?.length || 0,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User roles synchronized successfully',
        count: sfdAdmins?.length || 0,
        timestamp: new Date().toISOString() 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in synchronize-user-roles function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

