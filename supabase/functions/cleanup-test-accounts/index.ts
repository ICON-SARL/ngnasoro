
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
    // Create a Supabase client with the service key (admin privileges)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // The accounts to preserve
    const preserveAccounts = [
      'carriere@icon-sarl.com',
      'admin@test.com',
      'client@test.com'
    ];
    
    console.log(`Starting account cleanup process. Preserving: ${preserveAccounts.join(', ')}`);
    
    // Fetch all users
    const { data: allUsers, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }
    
    if (!allUsers || !allUsers.users) {
      throw new Error("No users data returned");
    }
    
    const usersToDelete = allUsers.users.filter(user => 
      !preserveAccounts.includes(user.email || '')
    );
    
    console.log(`Found ${usersToDelete.length} accounts to delete out of ${allUsers.users.length} total accounts`);
    
    const results = {
      total: allUsers.users.length,
      toDelete: usersToDelete.length,
      preserved: allUsers.users.length - usersToDelete.length,
      deleted: 0,
      errors: 0,
      details: []
    };
    
    // Delete each user account
    for (const user of usersToDelete) {
      try {
        console.log(`Attempting to delete user: ${user.email} (${user.id})`);
        
        // First remove any associations with SFDs
        try {
          const { error: assocError } = await supabaseClient
            .from('user_sfds')
            .delete()
            .eq('user_id', user.id);
            
          if (assocError) {
            console.warn(`Warning: Could not delete SFD associations for ${user.email}: ${assocError.message}`);
          }
        } catch (error) {
          console.warn(`Exception when deleting SFD associations: ${error.message}`);
        }
        
        // Remove from admin_users if present
        try {
          const { error: adminError } = await supabaseClient
            .from('admin_users')
            .delete()
            .eq('id', user.id);
            
          if (adminError && !adminError.message.includes('no rows')) {
            console.warn(`Warning: Could not delete from admin_users for ${user.email}: ${adminError.message}`);
          }
        } catch (error) {
          console.warn(`Exception when deleting from admin_users: ${error.message}`);
        }
        
        // Remove client adhesion requests if present
        try {
          const { error: adhesionError } = await supabaseClient
            .from('client_adhesion_requests')
            .delete()
            .eq('user_id', user.id);
            
          if (adhesionError && !adhesionError.message.includes('no rows')) {
            console.warn(`Warning: Could not delete client adhesion requests for ${user.email}: ${adhesionError.message}`);
          }
        } catch (error) {
          console.warn(`Exception when deleting adhesion requests: ${error.message}`);
        }
        
        // Finally delete the auth user
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`Error deleting user ${user.email}: ${deleteError.message}`);
          results.errors++;
          results.details.push({
            email: user.email,
            id: user.id,
            status: 'error',
            message: deleteError.message
          });
        } else {
          console.log(`Successfully deleted user ${user.email}`);
          results.deleted++;
          results.details.push({
            email: user.email,
            id: user.id,
            status: 'deleted'
          });
        }
      } catch (error) {
        console.error(`Exception when deleting user ${user.email}: ${error.message}`);
        results.errors++;
        results.details.push({
          email: user.email || 'Unknown',
          id: user.id,
          status: 'error',
          message: error.message
        });
      }
    }
    
    console.log(`Cleanup completed. Deleted ${results.deleted} accounts with ${results.errors} errors`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Account cleanup completed. Deleted ${results.deleted} accounts with ${results.errors} errors.`,
        results
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Unhandled error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An unexpected error occurred",
        error: error 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
