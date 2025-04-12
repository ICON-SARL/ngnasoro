
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const testAccounts = [
      {
        email: "client@test.com",
        password: "password123",
        data: { full_name: "Client Test", email_verified: true, role: "client" },
        role: "client"
      },
      {
        email: "sfd@test.com",
        password: "password123",
        data: { full_name: "SFD Admin 1", email_verified: true, role: "sfd_admin", sfd_id: "primary-sfd" },
        role: "sfd_admin"
      },
      {
        email: "admin@test.com",
        password: "password123",
        data: { full_name: "MEREF Admin", email_verified: true, role: "admin" },
        role: "admin"
      },
      {
        email: "sfd2@test.com",
        password: "password123",
        data: { full_name: "SFD Admin 2", email_verified: true, role: "sfd_admin", sfd_id: "secondary-sfd" },
        role: "sfd_admin"
      }
    ];
    
    const results = [];
    
    // Create accounts one by one
    for (const account of testAccounts) {
      try {
        // First check if user exists
        const { data: existingUsers, error: queryError } = await supabaseClient
          .from('admin_users')
          .select('id, role, email')
          .eq('email', account.email);
        
        if (queryError) {
          console.error(`Error checking existing user ${account.email}:`, queryError);
          results.push({
            email: account.email,
            status: 'error',
            message: queryError.message
          });
          continue;
        }
        
        // If user already exists in admin_users table
        if (existingUsers && existingUsers.length > 0) {
          const existingUser = existingUsers[0];
          const hasCorrectRole = existingUser.role === account.role;
          
          // Check if user exists in auth.users
          const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(existingUser.id);
          
          if (authError || !authUser) {
            // User exists in admin_users but not in auth.users, create it
            const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
              email: account.email,
              password: account.password,
              email_confirm: true,
              user_metadata: account.data
            });
            
            if (userError) {
              results.push({
                email: account.email,
                status: 'error',
                message: userError.message
              });
              continue;
            }
            
            results.push({
              email: account.email,
              status: 'created',
              role: account.role
            });
          } else {
            // Update role if needed
            if (!hasCorrectRole) {
              await supabaseClient
                .from('admin_users')
                .update({ role: account.role })
                .eq('id', existingUser.id);
                
              // Also update user_roles table
              await supabaseClient.rpc(
                'assign_role',
                {
                  user_id: existingUser.id,
                  role: account.role
                }
              );
            }
            
            results.push({
              email: account.email,
              status: 'already_exists',
              role: account.role,
              hasCorrectRole
            });
          }
          
          continue;
        }
        
        // Check if user exists in auth.users but not in admin_users
        const { data: { users }, error: authListError } = await supabaseClient.auth.admin.listUsers({
          filters: {
            email: account.email
          }
        });
        
        if (authListError) {
          console.error(`Error listing users for ${account.email}:`, authListError);
          results.push({
            email: account.email,
            status: 'error',
            message: authListError.message
          });
          continue;
        }
        
        let userId = null;
        
        // If user exists in auth.users, get its ID
        if (users && users.length > 0) {
          userId = users[0].id;
          
          // Update user metadata
          await supabaseClient.auth.admin.updateUserById(userId, {
            user_metadata: account.data,
            email_confirm: true
          });
        } else {
          // Create new auth user
          const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: account.data
          });
          
          if (userError) {
            results.push({
              email: account.email,
              status: 'error',
              message: userError.message
            });
            continue;
          }
          
          userId = userData.user.id;
        }
        
        // Add user to admin_users table
        const { error: adminError } = await supabaseClient
          .from('admin_users')
          .insert({
            id: userId,
            email: account.email,
            full_name: account.data.full_name,
            role: account.role,
            has_2fa: false
          });
        
        if (adminError) {
          results.push({
            email: account.email,
            status: 'error',
            message: adminError.message
          });
          continue;
        }
        
        // Assign role
        const { error: roleError } = await supabaseClient.rpc(
          'assign_role',
          {
            user_id: userId,
            role: account.role
          }
        );
        
        if (roleError) {
          results.push({
            email: account.email,
            status: 'error',
            message: roleError.message
          });
          continue;
        }
        
        // If this is an SFD admin, make sure the SFD exists
        if (account.role === "sfd_admin") {
          // Check if the SFD already exists
          const { data: existingSfds } = await supabaseClient
            .from('sfds')
            .select('id')
            .eq('code', account.data.sfd_id);
          
          if (!existingSfds || existingSfds.length === 0) {
            const sfdName = account.data.sfd_id === "primary-sfd" ? 
              "SFD Primaire" : "SFD Secondaire";
            
            // Create the SFD if it doesn't exist
            const { error: sfdError } = await supabaseClient
              .from('sfds')
              .insert({
                name: sfdName,
                code: account.data.sfd_id,
                region: "Bamako",
                status: "active"
              });
            
            if (sfdError) {
              console.error("Error creating SFD:", sfdError);
            }
          }
        }
        
        results.push({
          email: account.email,
          status: 'created',
          role: account.role
        });
        
      } catch (error) {
        console.error(`Error processing account ${account.email}:`, error);
        results.push({
          email: account.email,
          status: 'error',
          message: error.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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
