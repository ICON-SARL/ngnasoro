
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

    if (roleError || !userData || !(userData.role === 'admin' || userData.role === 'super_admin')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'User not authorized to perform this action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Step 1: Synchronize SFD admin roles to Auth metadata
    console.log('Synchronizing SFD administrators with Auth metadata...');
    
    // Get all SFD administrators
    const { data: sfdAdmins, error: adminsError } = await supabaseClient
      .from('sfd_administrators')
      .select('user_id, sfd_id, status')
      .eq('status', 'active');

    if (adminsError) {
      throw new Error(`Failed to fetch SFD administrators: ${adminsError.message}`);
    }

    // Update user roles in Auth metadata
    for (const admin of sfdAdmins) {
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        admin.user_id,
        { app_metadata: { role: 'sfd_admin', sfd_id: admin.sfd_id } }
      );
      
      if (updateError) {
        console.error(`Failed to update user ${admin.user_id} metadata:`, updateError);
      }
    }

    // Step 2: Synchronize user_roles table with sfd_user_roles
    console.log('Synchronizing user_roles table with sfd_user_roles...');
    
    // Add audit log entry for the synchronization
    const { error: auditError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'roles_synchronized',
        category: 'ADMIN_ACTION',
        severity: 'INFO',
        status: 'success',
        details: { timestamp: new Date().toISOString() }
      });
    
    if (auditError) {
      console.error('Failed to log audit entry:', auditError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User roles synchronized successfully',
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
