
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
    
    // Step 1: Create CAURIE-MF SFD if it doesn't exist yet
    const { data: existingSfd, error: sfdCheckError } = await supabase
      .from('sfds')
      .select('id, name, code')
      .eq('code', 'CAURIE')
      .maybeSingle();
    
    if (sfdCheckError) throw sfdCheckError;
    
    let sfdId;
    
    if (!existingSfd) {
      // Create the CAURIE-MF SFD
      const { data: newSfd, error: sfdCreateError } = await supabase
        .from('sfds')
        .insert({
          name: 'CAURIE Microfinance',
          code: 'CAURIE',
          region: 'Dakar',
          status: 'active',
        })
        .select('id')
        .single();
      
      if (sfdCreateError) throw sfdCreateError;
      sfdId = newSfd.id;
      console.log('Created new SFD:', newSfd);
    } else {
      sfdId = existingSfd.id;
      console.log('Using existing SFD:', existingSfd);
    }
    
    // Step 2: Create SFD admin user if it doesn't exist
    const adminEmail = 'caurie-admin@test.com';
    const adminPassword = 'password123';
    
    // Check if the user already exists
    const { data: existingUsers, error: userCheckError } = await supabase.auth.admin.listUsers();
    if (userCheckError) throw userCheckError;
    
    const existingUser = existingUsers.users.find(u => u.email === adminEmail);
    
    let userId;
    
    if (existingUser) {
      console.log(`User ${adminEmail} already exists with ID ${existingUser.id}`);
      userId = existingUser.id;
      
      // Ensure the user has the sfd_admin role in app_metadata
      await supabase.auth.admin.updateUserById(existingUser.id, {
        app_metadata: { role: 'sfd_admin' }
      });
    } else {
      // Create the user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'CAURIE Admin'
        },
        app_metadata: { 
          role: 'sfd_admin'
        }
      });

      if (userError) throw userError;
      userId = userData.user.id;
      console.log(`Created user ${adminEmail} with ID ${userId}`);
    }
    
    // Step 3: Assign sfd_admin role to the user
    try {
      await supabase.rpc('assign_role', {
        user_id: userId,
        role: 'sfd_admin'
      });
      console.log(`Assigned role 'sfd_admin' to user ${adminEmail}`);
    } catch (roleError) {
      console.error(`Error assigning role to ${adminEmail}:`, roleError);
    }
    
    // Step 4: Associate the SFD with the user
    const { data: existingUserSfd, error: userSfdCheckError } = await supabase
      .from('user_sfds')
      .select('id')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();
      
    if (userSfdCheckError) throw userSfdCheckError;
    
    if (!existingUserSfd) {
      const { error: userSfdError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          is_default: true
        });
      
      if (userSfdError) throw userSfdError;
      console.log(`Associated SFD ${sfdId} with user ${userId}`);
    } else {
      console.log(`SFD ${sfdId} already associated with user ${userId}`);
    }
    
    // Return the SFD and user details
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CAURIE-MF SFD and admin user setup completed',
        sfd: {
          id: sfdId,
          name: existingSfd ? existingSfd.name : 'CAURIE Microfinance',
          code: existingSfd ? existingSfd.code : 'CAURIE'
        },
        admin: {
          email: adminEmail,
          password: adminPassword
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating CAURIE-MF SFD and admin:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
