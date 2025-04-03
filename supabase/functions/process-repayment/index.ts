
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the request body
    const { userId, sfdId, loanId, amount } = await req.json()

    if (!userId || !sfdId || !loanId || !amount) {
      throw new Error('Missing required parameters')
    }

    console.log(`Processing repayment for user ${userId}, loan ${loanId}, amount ${amount}`)

    // 1. Create a loan payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount: amount,
        payment_method: 'mobile_app',
        status: 'completed'
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Error recording loan payment: ${paymentError.message}`)
    }

    // 2. Create a transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        sfd_id: sfdId,
        amount: -amount, // Negative because it's money leaving the account
        type: 'loan_repayment',
        name: 'Remboursement de prêt',
        description: `Remboursement pour le prêt ${loanId.substring(0, 8)}`,
        payment_method: 'sfd_account'
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Error recording transaction: ${transactionError.message}`)
    }

    // 3. Get the loan details to update
    const { data: loanData, error: loanFetchError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanFetchError) {
      throw new Error(`Error fetching loan: ${loanFetchError.message}`)
    }

    // Update loan with new last payment date and potentially update status
    const { error: loanUpdateError } = await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: new Date().toISOString(),
        next_payment_date: new Date(
          new Date().setMonth(new Date().getMonth() + 1)
        ).toISOString(),
        // If this was the last payment, mark loan as completed
        status: (loanData.monthly_payment * loanData.duration_months - amount <= 0) 
          ? 'completed' 
          : 'active'
      })
      .eq('id', loanId);

    if (loanUpdateError) {
      throw new Error(`Error updating loan: ${loanUpdateError.message}`)
    }

    // 4. Add a loan activity record
    const { error: activityError } = await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'payment',
        description: `Paiement de ${amount} FCFA effectué via l'application mobile`
      });

    if (activityError) {
      throw new Error(`Error recording loan activity: ${activityError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Repayment processed successfully',
        payment: paymentData,
        transaction: transactionData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error handling repayment:', error)
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
