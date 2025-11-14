import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InitializeClientAccountRequest {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, sfdId, makeDefault = true }: InitializeClientAccountRequest = await req.json();

    console.log('🚀 Initializing client account:', { userId, sfdId, makeDefault });

    // 1. Vérifier si l'utilisateur existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // 2. Vérifier si le SFD existe et est actif
    const { data: sfd, error: sfdError } = await supabase
      .from('sfds')
      .select('*')
      .eq('id', sfdId)
      .eq('status', 'active')
      .single();

    if (sfdError || !sfd) {
      throw new Error('SFD not found or inactive');
    }

    console.log('✅ Found SFD:', sfd.name);

    // 3. Vérifier si l'association existe déjà
    const { data: existingAssociation } = await supabase
      .from('user_sfds')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();

    if (existingAssociation) {
      console.log('ℹ️ User already associated with this SFD');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User already associated with this SFD',
          data: existingAssociation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Si makeDefault, retirer le default des autres SFDs
    if (makeDefault) {
      await supabase
        .from('user_sfds')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // 5. Créer l'association user_sfds
    const { data: userSfd, error: userSfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id: sfdId,
        is_default: makeDefault
      })
      .select()
      .single();

    if (userSfdError) {
      throw userSfdError;
    }

    console.log('✅ Created user_sfds association');

    // 6. Vérifier si le client existe déjà dans sfd_clients
    const { data: existingClient } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();

    let sfdClient;
    if (!existingClient) {
      // 7. Générer le code client
      const { data: clientCodeData, error: clientCodeError } = await supabase
        .rpc('generate_client_code', { sfd_code: sfd.code });

      if (clientCodeError) {
        console.error('Error generating client code:', clientCodeError);
        throw clientCodeError;
      }

      const clientCode = clientCodeData;
      console.log('✅ Generated client code:', clientCode);

      // 8. Créer l'entrée sfd_clients
      const { data: newClient, error: clientError } = await supabase
        .from('sfd_clients')
        .insert({
          sfd_id: sfdId,
          user_id: userId,
          full_name: profile.full_name || 'Unknown',
          email: profile.id, // Will be replaced by actual email if available
          phone: profile.phone,
          status: 'active',
          kyc_level: profile.kyc_level || 1,
          client_code: clientCode
        })
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }

      sfdClient = newClient;
      console.log('✅ Created sfd_clients entry');

      // 9. Mettre à jour le profil avec le code client
      await supabase
        .from('profiles')
        .update({ client_code: clientCode })
        .eq('id', userId);

      console.log('✅ Updated profile with client code');
    } else {
      sfdClient = existingClient;
      console.log('ℹ️ Client already exists in sfd_clients');
    }

    // 10. Vérifier si le compte existe déjà
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();

    let account;
    if (!existingAccount) {
      // 11. Créer le compte dans accounts
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          balance: 0,
          currency: 'FCFA',
          status: 'active'
        })
        .select()
        .single();

      if (accountError) {
        throw accountError;
      }

      account = newAccount;
      console.log('✅ Created accounts entry');
    } else {
      account = existingAccount;
      console.log('ℹ️ Account already exists');
    }

    // 12. Upgrade le rôle à 'client' si c'est encore 'user'
    const { data: currentRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const hasClientRole = currentRoles?.some(r => r.role === 'client');

    if (!hasClientRole) {
      // Supprimer le rôle 'user' s'il existe
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'user');

      // Ajouter le rôle 'client'
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'client'
        });

      console.log('✅ Upgraded user role to client');
    }

    // 13. Logger l'événement
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'client_account_initialized',
        category: 'user_management',
        severity: 'info',
        status: 'success',
        details: {
          sfd_id: sfdId,
          sfd_name: sfd.name,
          client_code: sfdClient.client_code,
          account_id: account.id
        }
      });

    console.log('✅ Client account initialization complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client account initialized successfully',
        data: {
          userSfd,
          sfdClient,
          account,
          sfd
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error initializing client account:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
