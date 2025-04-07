
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

interface SubsidyData {
  sfd_id: string;
  amount: number;
  remaining_amount: number;
  allocated_by: string;
  status: string;
  description: string;
}

interface RequestBody {
  subsidy_data: SubsidyData;
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
    const { subsidy_data }: RequestBody = await req.json();

    // Vérifications
    if (!subsidy_data.sfd_id) {
      return new Response(
        JSON.stringify({ error: 'ID de SFD invalide' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!subsidy_data.amount || subsidy_data.amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Montant de subvention invalide' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que la SFD existe
    const { data: sfd, error: sfdError } = await supabaseClient
      .from('sfds')
      .select('id')
      .eq('id', subsidy_data.sfd_id)
      .single();

    if (sfdError || !sfd) {
      return new Response(
        JSON.stringify({ error: 'SFD introuvable', details: sfdError }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insérer la nouvelle subvention
    const { data: newSubsidy, error: insertError } = await supabaseClient
      .from('sfd_subsidies')
      .insert([subsidy_data])
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la subvention', details: insertError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer une activité de subvention
    await supabaseClient.from('subsidy_activities').insert({
      subsidy_id: newSubsidy.id,
      performed_by: subsidy_data.allocated_by,
      activity_type: 'creation',
      description: 'Subvention initiale créée lors de l\'ajout de la SFD',
    });

    return new Response(
      JSON.stringify(newSubsidy),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
