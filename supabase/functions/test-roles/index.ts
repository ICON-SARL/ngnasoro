
// Adding real-time permission checking functionality to the test-roles edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const requestBody = await req.json();
    const { action, role, email, password, fullName, sfdId, userId, permission } = requestBody;
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Test account creation
    if (action === 'create_test_account') {
      if (!role || !email || !password || !fullName) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters for account creation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Validate role
      if (!['admin', 'sfd_admin', 'client'].includes(role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid role. Must be one of: admin, sfd_admin, client' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Additional validation for SFD Admin
      if (role === 'sfd_admin' && !sfdId) {
        return new Response(
          JSON.stringify({ error: 'SFD ID is required for sfd_admin role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create the user
      const userMetadata: Record<string, any> = { full_name: fullName };
      
      // Add SFD ID for SFD admin
      if (role === 'sfd_admin' && sfdId) {
        userMetadata.sfd_id = sfdId;
      }
      
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
        user_metadata: userMetadata
      });
      
      if (userError) {
        return new Response(
          JSON.stringify({ error: userError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const userId = userData.user.id;
      
      // Assign role in user_roles table
      await supabase.from('user_roles').insert({
        user_id: userId,
        role
      });
      
      // For SFD admins, create admin_users entry
      if (role === 'sfd_admin') {
        await supabase.from('admin_users').insert({
          id: userId,
          email,
          full_name: fullName,
          role: 'sfd_admin',
          has_2fa: false
        });
        
        // Associate with SFD
        if (sfdId) {
          await supabase.from('user_sfds').insert({
            user_id: userId,
            sfd_id: sfdId,
            is_default: true
          });
        }
      }
      
      // For MEREF admins, create admin_users entry
      if (role === 'admin') {
        await supabase.from('admin_users').insert({
          id: userId,
          email,
          full_name: fullName,
          role: 'admin',
          has_2fa: false
        });
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Test ${role} account created successfully`,
          user: {
            id: userId,
            email,
            role,
            full_name: fullName
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Test role verification
    if (action === 'verify_permissions') {
      if (!role) {
        return new Response(
          JSON.stringify({ error: 'Missing required role parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get permissions for the role from our view
      const { data: rolePermissions, error: roleError } = await supabase
        .from('role_permissions_view')
        .select('permission')
        .eq('role', role);
      
      if (roleError) {
        // If the view doesn't exist, return hard-coded permissions based on role
        // This is a fallback mechanism
        let permissions: string[] = [];
        
        if (role === 'admin') {
          permissions = [
            'validate_sfd_funds', 'audit_sfd_accounts', 'generate_reports',
            'manage_users', 'manage_sfds', 'manage_clients', 'manage_loans',
            'manage_subsidies', 'view_reports', 'export_data', 'approve_credit',
            'access_admin_dashboard', 'view_client_adhesions', 'create_sfd',
            'create_sfd_admin', 'audit_reports', 'pki_management'
          ];
        } else if (role === 'sfd_admin') {
          permissions = [
            'validate_client_accounts', 'create_client_accounts', 'manage_sfd_loans',
            'manage_sfd_repayments', 'manage_sfd_savings', 'validate_mobile_money',
            'manage_clients', 'manage_loans', 'access_sfd_dashboard', 'manage_subsidies',
            'approve_client_adhesion', 'reject_client_adhesion', 'view_client_adhesions'
          ];
        } else if (role === 'client') {
          permissions = [
            'access_savings', 'deposit_savings', 'withdraw_savings',
            'use_mobile_money', 'view_loan_history', 'access_client_dashboard',
            'request_adhesion', 'request_loan', 'repay_loan'
          ];
        }
        
        return new Response(
          JSON.stringify({ 
            success: true,
            role,
            permissions,
            source: 'hardcoded_fallback'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Extract permission values from result
      const permissions = rolePermissions.map(row => row.permission);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          role,
          permissions,
          source: 'database'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Test real-time permission checking
    if (action === 'check_permission') {
      if (!userId || !permission) {
        return new Response(
          JSON.stringify({ error: 'Missing required userId or permission parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get user role first
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (userRoleError) {
        // Fallback to auth.users metadata if no explicit role
        const { data: userData, error: authError } = await supabase.auth.admin.getUserById(userId);
        
        if (authError) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'User not found'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Use role from auth metadata
        const role = userData.user.app_metadata?.role || 'user';
        
        // Now check permission using role_permissions_view
        const { data: permData, error: permError } = await supabase
          .from('role_permissions_view')
          .select('permission')
          .eq('role', role)
          .eq('permission', permission);
        
        const hasPermission = permData && permData.length > 0;
        
        return new Response(
          JSON.stringify({ 
            success: true,
            permission,
            has_permission: hasPermission,
            source: 'auth_metadata_check',
            checked_at: new Date().toISOString(),
            user_id: userId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the role from user_roles
      const role = userRoleData.role;
      
      // Check permission using role_permissions_view
      const { data: permData, error: permError } = await supabase
        .from('role_permissions_view')
        .select('permission')
        .eq('role', role)
        .eq('permission', permission);
      
      const hasPermission = permData && permData.length > 0;
      
      return new Response(
        JSON.stringify({ 
          success: true,
          permission,
          has_permission: hasPermission,
          source: 'user_roles_check',
          checked_at: new Date().toISOString(),
          user_id: userId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
