import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { vault_id } = await req.json();

    if (!vault_id) {
      return new Response(
        JSON.stringify({ error: 'vault_id requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le coffre avec son taux d'intérêt
    const { data: vault, error: vaultError } = await supabase
      .from('collaborative_vaults')
      .select('id, interest_rate, status')
      .eq('id', vault_id)
      .single();

    if (vaultError || !vault) {
      return new Response(
        JSON.stringify({ error: 'Coffre non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (vault.status === 'closed') {
      return new Response(
        JSON.stringify({ error: 'Ce coffre est fermé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const interestRate = vault.interest_rate || 0;
    if (interestRate <= 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Pas de taux d\'intérêt configuré', calculated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer tous les membres actifs avec leurs dépôts
    const { data: members, error: membersError } = await supabase
      .from('collaborative_vault_members')
      .select('id, user_id, total_contributed, interest_earned, last_interest_calculation')
      .eq('vault_id', vault_id)
      .eq('status', 'active');

    if (membersError) {
      throw membersError;
    }

    const now = new Date();
    let totalInterestCalculated = 0;
    const updates: any[] = [];

    for (const member of members || []) {
      // Récupérer toutes les transactions de dépôt de ce membre
      const { data: deposits } = await supabase
        .from('collaborative_vault_transactions')
        .select('amount, created_at')
        .eq('vault_id', vault_id)
        .eq('user_id', member.user_id)
        .eq('transaction_type', 'deposit')
        .order('created_at', { ascending: true });

      if (!deposits || deposits.length === 0) continue;

      // Calculer l'intérêt au prorata pour chaque dépôt
      let memberInterest = 0;
      const lastCalc = member.last_interest_calculation 
        ? new Date(member.last_interest_calculation) 
        : null;

      for (const deposit of deposits) {
        const depositDate = new Date(deposit.created_at);
        const startDate = lastCalc && lastCalc > depositDate ? lastCalc : depositDate;
        const daysSinceDeposit = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceDeposit > 0) {
          // Intérêt = (montant * taux_annuel / 100) * (jours / 365)
          const interest = (deposit.amount * (interestRate / 100)) * (daysSinceDeposit / 365);
          memberInterest += interest;
        }
      }

      if (memberInterest > 0) {
        totalInterestCalculated += memberInterest;
        updates.push({
          id: member.id,
          interest_earned: (member.interest_earned || 0) + memberInterest,
          last_interest_calculation: now.toISOString()
        });
      }
    }

    // Mettre à jour les intérêts de chaque membre
    for (const update of updates) {
      await supabase
        .from('collaborative_vault_members')
        .update({
          interest_earned: update.interest_earned,
          last_interest_calculation: update.last_interest_calculation
        })
        .eq('id', update.id);
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'vault_interest_calculated',
      category: 'savings',
      severity: 'info',
      status: 'success',
      details: {
        vault_id,
        total_interest: totalInterestCalculated,
        members_updated: updates.length
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Intérêts calculés',
        calculated: totalInterestCalculated,
        members_updated: updates.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur calculate-vault-interest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
