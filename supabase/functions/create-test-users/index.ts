
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
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Test accounts to create
    const testAccounts = [
      {
        email: "admin@test.com",
        password: "password123",
        data: { full_name: "Admin Test", role: "admin" }
      },
      {
        email: "sfd@test.com",
        password: "password123",
        data: { full_name: "SFD Admin Test", role: "sfd_admin", sfd_id: "sfd-1" }
      },
      {
        email: "client@test.com",
        password: "password123",
        data: { full_name: "Client Test", role: "client" }
      }
    ];
    
    const results = [];
    
    // Create each test account
    for (const account of testAccounts) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
          email: account.email,
        });
        
        if (existingUsers && existingUsers.users.length > 0) {
          // Update user if already exists
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUsers.users[0].id,
            {
              email: account.email,
              password: account.password,
              email_confirm: true,
              user_metadata: account.data,
              app_metadata: { role: account.data.role }
            }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          results.push({ email: account.email, status: 'updated', role: account.data.role });
          
        } else {
          // Create new user
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: account.data,
            app_metadata: { role: account.data.role }
          });
          
          if (error) {
            throw error;
          }
          
          results.push({ email: account.email, status: 'created', role: account.data.role });
        }
      } catch (error) {
        console.error(`Error processing account ${account.email}:`, error);
        results.push({ email: account.email, status: 'error', message: error.message });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
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
      JSON.stringify({ success: false, error: error.message }),
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
