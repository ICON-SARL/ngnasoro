
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { action, role, userId, permission } = await req.json();
    
    // Handle different actions
    switch (action) {
      case 'verify_permissions':
        // Get permissions for a specific role
        return await handleVerifyPermissions(supabase, role, corsHeaders);
        
      case 'check_permission':
        // Check if a user has a specific permission
        return await handleCheckPermission(supabase, userId, permission, corsHeaders);
        
      case 'get_user_role':
        // Get a user's role
        return await handleGetUserRole(supabase, userId, corsHeaders);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in test-roles function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to verify permissions for a role
async function handleVerifyPermissions(supabase, role, corsHeaders) {
  try {
    // Query the permissions view for this role
    const { data, error } = await supabase
      .from('role_permissions_view')
      .select('permission')
      .eq('role', role);
      
    if (error) {
      console.error('Database error fetching permissions:', error);
      
      // Fallback to querying the get_role_permissions function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_role_permissions', { role_name: role });
        
      if (rpcError) {
        throw new Error(`Error fetching permissions: ${rpcError.message}`);
      }
      
      return new Response(
        JSON.stringify({ 
          permissions: rpcData || [],
          source: 'rpc_function' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract permissions from the data
    const permissions = data.map(row => row.permission);
    
    return new Response(
      JSON.stringify({ 
        permissions,
        source: 'permissions_view' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleVerifyPermissions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Function to check if a user has a specific permission
async function handleCheckPermission(supabase, userId, permission, corsHeaders) {
  try {
    if (!userId || !permission) {
      return new Response(
        JSON.stringify({ error: 'User ID and permission are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Try to use the check_real_time_permission function if it exists
    try {
      const { data: checkData, error: checkError } = await supabase
        .rpc('check_real_time_permission', { 
          user_id: userId, 
          permission_name: permission 
        });
        
      if (!checkError) {
        return new Response(
          JSON.stringify({ 
            has_permission: checkData.has_permission,
            checked_at: checkData.checked_at,
            source: 'real_time_check'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      // Ignore error and fall back to manual check
      console.log('Real-time permission check not available, falling back to manual check');
    }
    
    // Get the user's role
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      // Try getting the role from auth.users metadata
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const role = authUser.user.app_metadata?.role || 'user';
      
      // Get permissions for this role
      const { data: permData, error: permError } = await supabase
        .rpc('get_role_permissions', { role_name: role });
        
      if (permError) {
        throw new Error(`Error fetching permissions: ${permError.message}`);
      }
      
      const hasPermission = permData.includes(permission);
      
      return new Response(
        JSON.stringify({ 
          has_permission: hasPermission,
          user_role: role,
          source: 'auth_metadata'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const role = userData.role;
    
    // Get permissions for this role
    const { data: permData, error: permError } = await supabase
      .rpc('get_role_permissions', { role_name: role });
      
    if (permError) {
      throw new Error(`Error fetching permissions: ${permError.message}`);
    }
    
    const hasPermission = permData.includes(permission);
    
    return new Response(
      JSON.stringify({ 
        has_permission: hasPermission,
        user_role: role,
        source: 'user_roles_table'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleCheckPermission:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Function to get a user's role
async function handleGetUserRole(supabase, userId, corsHeaders) {
  try {
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the user's role from user_roles table
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      // Try getting the role from auth.users metadata
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !authUser) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const role = authUser.user.app_metadata?.role || 'user';
      
      return new Response(
        JSON.stringify({ 
          role,
          source: 'auth_metadata'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        role: userData.role,
        source: 'user_roles_table'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetUserRole:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
