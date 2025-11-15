import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase avec service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🚀 Démarrage du setup du système admin...');

    const createdAdmins = [];

    // 1. Créer Super Admin MEREF
    console.log('📝 Création Super Admin MEREF...');
    const { data: merefAdmin, error: merefError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@meref.gov.ml',
      password: 'Meref2025Admin!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrateur MEREF',
        role: 'admin'
      }
    });

    if (merefError) throw new Error(`Erreur création MEREF: ${merefError.message}`);
    console.log(`✅ Super Admin MEREF créé: ${merefAdmin.user.id}`);

    // Insérer profil
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: merefAdmin.user.id,
      full_name: 'Administrateur MEREF',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.error('Erreur profil MEREF:', profileError);
    }

    // Assigner rôle admin
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: merefAdmin.user.id,
      role: 'admin'
    });

    if (roleError) {
      console.error('Erreur rôle MEREF:', roleError);
    }

    createdAdmins.push({
      role: 'Super Admin MEREF',
      email: 'admin@meref.gov.ml',
      password: 'Meref2025Admin!',
      id: merefAdmin.user.id
    });

    // 2. Récupérer les IDs des SFDs
    const { data: sfds, error: sfdError } = await supabaseAdmin
      .from('sfds')
      .select('id, code, name')
      .in('code', ['NSM001', 'KJ001', 'NY001']);

    if (sfdError || !sfds || sfds.length === 0) {
      throw new Error('Impossible de récupérer les SFDs');
    }

    console.log(`✅ SFDs trouvés: ${sfds.length}`);

    // 3. Créer admins SFD
    const sfdAdminsConfig = [
      { email: 'admin.nsm@sfd.ml', password: 'NSM2025Admin!', name: 'Admin NSM', code: 'NSM001' },
      { email: 'admin.kj@sfd.ml', password: 'KJ2025Admin!', name: 'Admin Kafo Jiginew', code: 'KJ001' },
      { email: 'admin.ny@sfd.ml', password: 'NY2025Admin!', name: 'Admin Nyèsigiso', code: 'NY001' }
    ];

    for (const config of sfdAdminsConfig) {
      const sfd = sfds.find(s => s.code === config.code);
      if (!sfd) {
        console.warn(`⚠️ SFD ${config.code} non trouvé, skip`);
        continue;
      }

      console.log(`📝 Création admin ${config.code}...`);
      
      const { data: sfdAdmin, error: sfdAdminError } = await supabaseAdmin.auth.admin.createUser({
        email: config.email,
        password: config.password,
        email_confirm: true,
        user_metadata: {
          full_name: config.name,
          role: 'sfd_admin',
          sfd_id: sfd.id
        }
      });

      if (sfdAdminError) {
        console.error(`❌ Erreur création ${config.code}: ${sfdAdminError.message}`);
        continue;
      }

      console.log(`✅ Admin ${config.code} créé: ${sfdAdmin.user.id}`);

      // Insérer profil
      await supabaseAdmin.from('profiles').insert({
        id: sfdAdmin.user.id,
        full_name: config.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Assigner rôle sfd_admin
      await supabaseAdmin.from('user_roles').insert({
        user_id: sfdAdmin.user.id,
        role: 'sfd_admin'
      });

      // Associer au SFD
      await supabaseAdmin.from('user_sfds').insert({
        user_id: sfdAdmin.user.id,
        sfd_id: sfd.id,
        is_default: true
      });

      createdAdmins.push({
        role: `Admin SFD ${config.code}`,
        email: config.email,
        password: config.password,
        id: sfdAdmin.user.id,
        sfd: sfd.name
      });
    }

    // Logger dans audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      action: 'system_setup',
      category: 'authentication',
      severity: 'critical',
      status: 'success',
      details: {
        admins_created: createdAdmins.length,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Setup terminé avec succès!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Système admin initialisé avec succès',
        admins: createdAdmins
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Erreur setup:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
