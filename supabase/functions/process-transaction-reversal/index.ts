
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { disputeId, transactionId } = await req.json();

    // Get the original transaction
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError) throw txError;

    // Create reversal transaction
    const { data: reversal, error: reversalError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: transaction.user_id,
        sfd_id: transaction.sfd_id,
        type: 'reversal',
        amount: -transaction.amount, // Negative amount to reverse
        status: 'success',
        name: 'Annulation de transaction',
        description: `Annulation suite au litige #${disputeId}`,
        reference_id: `rev-${transaction.id}`
      })
      .select()
      .single();

    if (reversalError) throw reversalError;

    // Update account balance if needed
    if (transaction.affects_balance) {
      const { error: balanceError } = await supabaseClient.rpc(
        'update_account_balance',
        { 
          p_user_id: transaction.user_id,
          p_amount: -transaction.amount
        }
      );

      if (balanceError) throw balanceError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: reversal
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
