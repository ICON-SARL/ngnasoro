
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create test accounts with defined passwords
    const accounts = [
      {
        email: 'client@test.com',
        password: 'password123',
        role: 'user',
        full_name: 'Client Test'
      },
      {
        email: 'sfd@test.com',
        password: 'password123',
        role: 'sfd_admin',
        full_name: 'SFD Admin Test'
      },
      {
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        full_name: 'MEREF Admin Test'
      }
    ];

    const results = [];

    for (const account of accounts) {
      // Check if user already exists
      const { data: existingUsers, error: userCheckError } = await supabase.auth.admin.listUsers();
      if (userCheckError) throw userCheckError;
      
      const existingUser = existingUsers.users.find(u => u.email === account.email);
      
      if (existingUser) {
        console.log(`User ${account.email} already exists with ID ${existingUser.id}, updating role`);
        
        // Check if the user already has the correct role in app_metadata
        const hasCorrectMetadataRole = existingUser.app_metadata?.role === account.role;
        
        // Update user app_metadata with role if needed
        if (!hasCorrectMetadataRole) {
          console.log(`Updating app_metadata role for ${account.email} to ${account.role}`);
          await supabase.auth.admin.updateUserById(existingUser.id, {
            app_metadata: { role: account.role }
          });
        }
        
        // Check if user has role in user_roles table
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .eq('role', account.role);
          
        if (rolesError) throw rolesError;
        
        // Assign role to the user if it doesn't exist in user_roles
        if (!userRoles || userRoles.length === 0) {
          console.log(`Assigning role ${account.role} to user ${account.email} in user_roles table`);
          await supabase.rpc('assign_role', {
            user_id: existingUser.id,
            role: account.role
          });
        }
        
        results.push({
          email: account.email,
          status: 'already_exists',
          role: account.role,
          hasCorrectRole: hasCorrectMetadataRole || (userRoles && userRoles.length > 0)
        });
        continue;
      }

      // Create the user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.full_name
        },
        app_metadata: { 
          role: account.role  // Set role in app_metadata
        }
      });

      if (userError) {
        results.push({
          email: account.email,
          status: 'error',
          message: userError.message
        });
        continue;
      }

      console.log(`Created user ${account.email} with ID ${userData.user.id} and role ${account.role}`);

      // Assign role to the user in user_roles table
      try {
        await supabase.rpc('assign_role', {
          user_id: userData.user.id,
          role: account.role
        });
        console.log(`Assigned role ${account.role} to user ${account.email} in user_roles table`);
      } catch (roleError) {
        console.error(`Error assigning role to ${account.email}:`, roleError);
      }

      results.push({
        email: account.email,
        status: 'created',
        role: account.role
      });
    }

    // Log success for debugging
    console.log("Test accounts processed successfully:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test accounts processed', 
        results 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating test accounts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, stack: error.stack }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
