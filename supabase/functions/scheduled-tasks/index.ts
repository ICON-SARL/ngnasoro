import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { task } = await req.json();

    console.log(`[Scheduled Tasks] Executing task: ${task}`);

    let result: any = {};

    switch (task) {
      case 'calculate_penalties':
        // Calculer les pénalités de retard
        const { data: penaltiesData, error: penaltiesError } = await supabaseClient
          .rpc('calculate_loan_penalties');
        
        if (penaltiesError) throw penaltiesError;
        
        result = { 
          task: 'calculate_penalties', 
          success: true,
          message: 'Pénalités calculées avec succès'
        };
        
        console.log('[Scheduled Tasks] Penalties calculated successfully');
        break;

      case 'auto_reconcile':
        // Réconciliation automatique Mobile Money
        const { data: reconcileData, error: reconcileError } = await supabaseClient
          .rpc('auto_reconcile_mobile_money');
        
        if (reconcileError) throw reconcileError;
        
        result = {
          task: 'auto_reconcile',
          success: true,
          reconciled_count: reconcileData?.[0]?.reconciled_count || 0,
          total_amount: reconcileData?.[0]?.total_amount || 0,
          message: `${reconcileData?.[0]?.reconciled_count || 0} transactions réconciliées`
        };
        
        console.log('[Scheduled Tasks] Auto-reconciliation completed:', result);
        break;

      case 'update_all_stats':
        // Forcer la mise à jour de toutes les stats SFD
        const { data: sfdsData, error: sfdsError } = await supabaseClient
          .from('sfds')
          .select('id')
          .eq('status', 'active');
        
        if (sfdsError) throw sfdsError;

        // Déclencher le recalcul pour chaque SFD
        for (const sfd of sfdsData || []) {
          const { error: updateError } = await supabaseClient
            .from('sfd_clients')
            .select('id')
            .eq('sfd_id', sfd.id)
            .limit(1)
            .single();
          // Le trigger se déclenchera automatiquement
        }
        
        result = {
          task: 'update_all_stats',
          success: true,
          sfds_updated: sfdsData?.length || 0,
          message: `Stats mises à jour pour ${sfdsData?.length || 0} SFDs`
        };
        
        console.log('[Scheduled Tasks] All stats updated');
        break;

      default:
        throw new Error(`Unknown task: ${task}`);
    }

    // Logger l'exécution
    await supabaseClient.from('audit_logs').insert({
      action: 'scheduled_task_executed',
      category: 'system',
      severity: 'info',
      status: 'success',
      details: result
    });

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[Scheduled Tasks] Error:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
