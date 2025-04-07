
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

interface SfdData {
  name: string;
  code: string;
  region: string | null;
  status: string;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  legal_document_url: string | null;
}

interface RequestBody {
  sfd_data: SfdData;
  admin_id: string;
}

serve(async (req: Request) => {
  try {
    // Création du client supabase avec le rôle service_role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Récupérer et vérifier les données envoyées
    const { sfd_data, admin_id }: RequestBody = await req.json();

    // Vérifier si l'utilisateur est admin
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', admin_id)
      .eq('role', 'admin');

    if (roleError) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification des droits', details: roleError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userRoles || userRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Droits insuffisants pour créer une SFD' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insérer la nouvelle SFD
    const { data: newSfd, error: insertError } = await supabaseClient
      .from('sfds')
      .insert([sfd_data])
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la SFD', details: insertError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer une entrée dans les stats pour la nouvelle SFD
    await supabaseClient
      .from('sfd_stats')
      .insert({
        sfd_id: newSfd.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0,
      });

    // Enregistrer un audit log
    await supabaseClient.from('audit_logs').insert({
      user_id: admin_id,
      action: 'create_sfd',
      category: 'SFD_OPERATIONS',
      severity: 'INFO',
      status: 'success',
      details: { sfd_id: newSfd.id, sfd_name: newSfd.name },
    });

    return new Response(
      JSON.stringify(newSfd),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
