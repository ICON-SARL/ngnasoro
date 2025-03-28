
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
      const { data: existingUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', account.role);
      
      const existingUser = existingUsers && existingUsers.length > 0 
        ? await supabase.auth.admin.getUserById(existingUsers[0].user_id) 
        : null;
      
      if (existingUser?.data?.user?.email === account.email) {
        results.push({
          email: account.email,
          status: 'already_exists',
          role: account.role
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

      // Assign role to the user
      if (account.role !== 'user') {
        await supabase.rpc('assign_role', {
          user_id: userData.user.id,
          role: account.role
        });
        
        // Update user app_metadata with role
        await supabase.auth.admin.updateUserById(userData.user.id, {
          app_metadata: { role: account.role }
        });
      }

      results.push({
        email: account.email,
        status: 'created',
        role: account.role
      });
    }

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
      JSON.stringify({ success: false, error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
