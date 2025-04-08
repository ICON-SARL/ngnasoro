
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
    const userIds = {};

    // Set up the default SFDs
    const defaultSfds = [
      {
        name: 'Premier SFD',
        code: 'P',
        region: 'Centre',
        logo_url: null,
        status: 'active'
      },
      {
        name: 'Deuxième SFD',
        code: 'D',
        region: 'Nord',
        logo_url: null,
        status: 'active'
      },
      {
        name: 'Troisième SFD',
        code: 'T',
        region: 'Sud',
        logo_url: null,
        status: 'active'
      }
    ];

    // Create or update the SFDs
    for (const sfdData of defaultSfds) {
      // Check if SFD already exists
      const { data: existingSfds, error: sfdCheckError } = await supabase
        .from('sfds')
        .select('id')
        .eq('name', sfdData.name)
        .eq('code', sfdData.code);
        
      if (sfdCheckError) {
        console.error(`Error checking SFD ${sfdData.name}:`, sfdCheckError);
        continue;
      }
      
      let sfdId;
      
      if (!existingSfds || existingSfds.length === 0) {
        // Create the SFD
        const { data: newSfd, error: sfdCreateError } = await supabase
          .from('sfds')
          .insert(sfdData)
          .select('id')
          .single();
          
        if (sfdCreateError) {
          console.error(`Error creating SFD ${sfdData.name}:`, sfdCreateError);
          continue;
        }
        
        sfdId = newSfd.id;
        console.log(`Created SFD: ${sfdData.name} with ID: ${sfdId}`);
        
        // Create SFD stats
        await supabase
          .from('sfd_stats')
          .insert({
            sfd_id: sfdId,
            total_clients: 0,
            total_loans: 0,
            repayment_rate: 0
          });
        
        // Create demo subsidy
        await supabase
          .from('sfd_subsidies')
          .insert({
            sfd_id: sfdId,
            amount: 5000000,
            remaining_amount: 5000000,
            allocated_by: '00000000-0000-0000-0000-000000000000', // Placeholder admin ID
            description: 'Subvention de démonstration'
          });
      } else {
        sfdId = existingSfds[0].id;
        console.log(`SFD ${sfdData.name} already exists with ID: ${sfdId}`);
      }
    }

    // Fetch all SFDs for later use
    const { data: allSfds, error: allSfdsError } = await supabase
      .from('sfds')
      .select('id, name, code')
      .eq('status', 'active');
      
    if (allSfdsError) {
      console.error("Error fetching SFDs:", allSfdsError);
    }

    // Create the user accounts
    for (const account of accounts) {
      // Check if user already exists
      const { data: existingUsers, error: userCheckError } = await supabase.auth.admin.listUsers();
      if (userCheckError) throw userCheckError;
      
      const existingUser = existingUsers.users.find(u => u.email === account.email);
      let userId;
      
      if (existingUser) {
        console.log(`User ${account.email} already exists with ID ${existingUser.id}, updating role`);
        userId = existingUser.id;
        
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
      } else {
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

        userId = userData.user.id;
        console.log(`Created user ${account.email} with ID ${userId} and role ${account.role}`);

        // Assign role to the user in user_roles table
        try {
          await supabase.rpc('assign_role', {
            user_id: userId,
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
      
      // Store the userId for later use
      userIds[account.role] = userId;
      
      // Create entry in profiles table if it doesn't exist
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: account.full_name,
            email: account.email
          });
      }
      
      // For client users, create test accounts with all SFDs
      if (account.role === 'user' && allSfds && allSfds.length > 0) {
        // First delete any existing user_sfds associations for this user
        await supabase
          .from('user_sfds')
          .delete()
          .eq('user_id', userId);
          
        // Then create new associations for all SFDs
        for (let i = 0; i < allSfds.length; i++) {
          await supabase
            .from('user_sfds')
            .insert({
              user_id: userId,
              sfd_id: allSfds[i].id,
              is_default: i === 1  // Make the second SFD (Deuxième SFD) the default
            });
        }
        
        // Ensure client has an account with balance
        const { data: existingAccount } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (!existingAccount) {
          await supabase
            .from('accounts')
            .insert({
              user_id: userId,
              balance: 50000,
              currency: 'FCFA'
            });
        }
      }
      
      // For sfd_admin users, associate them with the first SFD
      if (account.role === 'sfd_admin' && allSfds && allSfds.length > 0) {
        // First delete any existing user_sfds associations for this user
        await supabase
          .from('user_sfds')
          .delete()
          .eq('user_id', userId);
          
        // Associate with first SFD
        await supabase
          .from('user_sfds')
          .insert({
            user_id: userId,
            sfd_id: allSfds[0].id,
            is_default: true
          });
      }
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
