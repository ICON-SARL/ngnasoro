
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

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
    // Create a Supabase client with the service role
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
    
    // Verify authentication if a token is provided
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
        
        // Verify if the user is an admin
        const { data: userRoles, error: roleError } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');
        
        if (roleError || !userRoles || userRoles.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: insufficient permissions' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Get the request data
    const { adminId } = await req.json();
    
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: 'Admin ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Attempting to delete SFD admin with ID: ${adminId}`);
    
    // Start a transaction
    // 1. First, get the user's SFDs
    const { data: userSfds, error: sfdsError } = await supabaseAdmin
      .from('user_sfds')
      .select('id, sfd_id')
      .eq('user_id', adminId);
    
    if (sfdsError) {
      console.error('Error fetching user SFDs:', sfdsError);
      return new Response(
        JSON.stringify({ error: `Error fetching user SFDs: ${sfdsError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 2. Remove SFD associations
    if (userSfds && userSfds.length > 0) {
      const { error: deleteAssociationsError } = await supabaseAdmin
        .from('user_sfds')
        .delete()
        .eq('user_id', adminId);
      
      if (deleteAssociationsError) {
        console.error('Error removing SFD associations:', deleteAssociationsError);
        return new Response(
          JSON.stringify({ error: `Error removing SFD associations: ${deleteAssociationsError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // 3. Remove user roles
    const { error: deleteRolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', adminId)
      .eq('role', 'sfd_admin');
    
    if (deleteRolesError) {
      console.error('Error removing user roles:', deleteRolesError);
      return new Response(
        JSON.stringify({ error: `Error removing user roles: ${deleteRolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Remove from admin_users
    const { error: deleteAdminError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', adminId);
    
    if (deleteAdminError) {
      console.error('Error removing admin user:', deleteAdminError);
      return new Response(
        JSON.stringify({ error: `Error removing admin user: ${deleteAdminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log an audit entry
    if (userId) {
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'delete_sfd_admin',
          category: 'ADMIN_OPERATIONS',
          severity: 'INFO',
          status: 'success',
          target_resource: `admin_users/${adminId}`,
          details: {
            deleted_admin_id: adminId,
            removed_sfds: userSfds.map(us => us.sfd_id)
          }
        });
    }
    
    console.log(`Successfully deleted admin ${adminId}`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'SFD admin deleted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-sfd-admin:', error);
    
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
