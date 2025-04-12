
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
    
    // Parse the request body if it exists
    let requestData = {};
    try {
      if (req.body) {
        requestData = await req.json();
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
      // Continue with default settings if parse fails
    }
    
    const testAccounts = [
      {
        email: "client@test.com",
        password: "password123",
        data: { full_name: "Client Test", email_verified: true },
        role: "user"
      },
      {
        email: "sfd@test.com",
        password: "password123",
        data: { full_name: "SFD Admin 1", email_verified: true, sfd_id: "primary-sfd" },
        role: "sfd_admin"
      },
      {
        email: "admin@test.com",
        password: "password123",
        data: { full_name: "MEREF Admin", email_verified: true },
        role: "admin"
      },
      {
        email: "sfd2@test.com",
        password: "password123",
        data: { full_name: "SFD Admin 2", email_verified: true, sfd_id: "secondary-sfd" },
        role: "sfd_admin"
      }
    ];
    
    const results = [];
    
    // Create accounts one by one
    for (const account of testAccounts) {
      try {
        console.log(`Processing account: ${account.email}, role: ${account.role}`);
        
        // First check if user exists
        const { data: existingUsers, error: queryError } = await supabaseClient.auth.admin.listUsers({
          filters: {
            email: account.email
          }
        });
        
        if (queryError) {
          console.error(`Error checking existing user ${account.email}:`, queryError);
          results.push({
            email: account.email,
            status: 'error',
            message: queryError.message
          });
          continue;
        }
        
        let userId = null;
        let isNewUser = false;
        
        // If user exists in auth.users
        if (existingUsers && existingUsers.users.length > 0) {
          const existingUser = existingUsers.users[0];
          userId = existingUser.id;
          console.log(`User ${account.email} exists with ID: ${userId}`);
          
          // Update user metadata and role
          await supabaseClient.auth.admin.updateUserById(userId, {
            user_metadata: account.data,
            app_metadata: { role: account.role },
            email_confirm: true
          });
          
          console.log(`Updated user ${account.email} metadata and role`);
        } else {
          // Create new auth user
          console.log(`Creating new user: ${account.email}`);
          const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            app_metadata: { role: account.role },
            user_metadata: account.data
          });
          
          if (userError) {
            console.error(`Error creating user ${account.email}:`, userError);
            results.push({
              email: account.email,
              status: 'error',
              message: userError.message
            });
            continue;
          }
          
          userId = userData.user.id;
          isNewUser = true;
          console.log(`Created new user ${account.email} with ID: ${userId}`);
        }
        
        // Check if the user has an entry in admin_users table (for admin and sfd_admin)
        if (account.role === 'admin' || account.role === 'sfd_admin') {
          const { data: existingAdmin } = await supabaseClient
            .from('admin_users')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
          
          if (!existingAdmin) {
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
              console.error(`Error adding ${account.email} to admin_users:`, adminError);
              results.push({
                email: account.email,
                status: 'error',
                message: adminError.message
              });
              continue;
            }
            
            console.log(`Added ${account.email} to admin_users table`);
          } else {
            // Update existing admin user
            const { error: updateError } = await supabaseClient
              .from('admin_users')
              .update({
                email: account.email,
                full_name: account.data.full_name,
                role: account.role
              })
              .eq('id', userId);
            
            if (updateError) {
              console.error(`Error updating ${account.email} in admin_users:`, updateError);
            } else {
              console.log(`Updated ${account.email} in admin_users table`);
            }
          }
        }
        
        // Assign role using RPC function
        const { error: roleError } = await supabaseClient.rpc(
          'assign_role',
          {
            user_id: userId,
            role: account.role
          }
        );
        
        if (roleError) {
          console.error(`Error assigning role to ${account.email}:`, roleError);
        } else {
          console.log(`Assigned role ${account.role} to ${account.email}`);
        }
        
        // If this is an SFD admin, make sure the SFD exists
        if (account.role === "sfd_admin" && account.data.sfd_id) {
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
            } else {
              console.log(`Created SFD: ${sfdName} with code: ${account.data.sfd_id}`);
            }
          }
        }
        
        results.push({
          email: account.email,
          status: isNewUser ? 'created' : 'updated',
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
    
    console.log("Final results:", results);
    
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
