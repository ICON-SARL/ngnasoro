
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
    const { userId, sfdId, loanId, amount, paymentMethod } = await req.json()

    if (!userId || !sfdId) {
      throw new Error('User ID and SFD ID are required')
    }

    if (!loanId) {
      throw new Error('Loan ID is required')
    }

    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required')
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required')
    }

    console.log(`Processing loan repayment: ${amount} on loan ${loanId} for user ${userId} via ${paymentMethod}`)

    // In a real implementation, we would:
    // 1. Verify the loan belongs to the user
    // 2. Process the payment through the appropriate payment processor
    // 3. Update the loan status and remaining balance
    // 4. Create transaction records
    // 5. Notify the user of the result

    // For this demo, we'll create a transaction record and update a mock loan
    const transactionId = `repay-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create transaction record
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        user_id: userId,
        sfd_id: sfdId,
        type: 'loan_repayment',
        amount: -amount, // Negative amount for outgoing funds
        status: 'success',
        name: 'Remboursement de prêt',
        description: `Remboursement de ${amount} FCFA pour le prêt ${loanId.substring(0, 8)}`,
        payment_method: paymentMethod,
        reference_id: loanId
      })

    if (txError) {
      console.error('Error creating transaction record:', txError)
      throw new Error('Failed to record transaction')
    }

    // Find the loan and update it
    const { data: loanData, error: loanFetchError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .eq('client_id', userId)
      .single()

    if (loanFetchError) {
      console.error('Error fetching loan:', loanFetchError)
      throw new Error('Loan not found or not accessible by this user')
    }

    if (!loanData) {
      throw new Error('Loan not found')
    }

    // Update the loan with the new payment
    const newRemainingAmount = Math.max(0, loanData.remaining_amount - amount)
    const newStatus = newRemainingAmount === 0 ? 'paid' : loanData.status

    const { error: loanUpdateError } = await supabase
      .from('sfd_loans')
      .update({
        remaining_amount: newRemainingAmount,
        last_payment_date: new Date().toISOString(),
        status: newStatus
      })
      .eq('id', loanId)

    if (loanUpdateError) {
      console.error('Error updating loan:', loanUpdateError)
      throw new Error('Failed to update loan status')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactionId: transactionId,
        remainingAmount: newRemainingAmount,
        status: newStatus
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing repayment:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
