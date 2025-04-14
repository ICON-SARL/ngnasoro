
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, payload } = await req.json();

    if (action === 'disburse_loan') {
      const { loanId, amount, method, notes, disbursedBy } = payload;
      console.log(`Processing loan disbursement for loan ${loanId}`);

      // 1. Verify loan exists and is approved
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select(`
          id,
          amount,
          status,
          client_id,
          sfd_id,
          disbursement_status
        `)
        .eq('id', loanId)
        .single();

      if (loanError) {
        throw new Error(`Error fetching loan: ${loanError.message}`);
      }

      if (!loan) {
        throw new Error('Loan not found');
      }

      if (loan.status !== 'approved') {
        throw new Error('Loan must be approved before disbursement');
      }

      if (loan.disbursement_status === 'completed') {
        throw new Error('Loan has already been disbursed');
      }

      // 2. Create disbursement record
      const reference = `DISB-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { data: disbursement, error: disbursementError } = await supabase
        .from('loan_disbursements')
        .insert({
          loan_id: loanId,
          amount: amount,
          disbursement_method: method,
          status: 'completed',
          reference_number: reference,
          disbursed_by: disbursedBy,
          notes: notes
        })
        .select()
        .single();

      if (disbursementError) {
        throw new Error(`Error creating disbursement: ${disbursementError.message}`);
      }

      // Log the activity
      await supabase.from('loan_activities').insert({
        loan_id: loanId,
        activity_type: 'disbursement',
        description: `Loan disbursed via ${method}. Reference: ${reference}`,
        performed_by: disbursedBy
      });

      return new Response(
        JSON.stringify({ success: true, data: disbursement }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Unknown action" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
