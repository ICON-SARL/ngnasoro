
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

    // Get the token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Authentication failed')
    }

    // Parse the request body
    const {
      userId,
      loanId,
      amount,
      paymentMethod
    } = await req.json()

    // Validate userId matches authenticated user or is an admin
    if (userId !== user.id) {
      // Check if user is an admin
      const { data: isAdmin } = await supabase.rpc('is_sfd_admin_auth')
      if (!isAdmin) {
        throw new Error('Unauthorized - You can only process payments for your own account')
      }
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

    console.log(`Processing loan repayment: Loan ID: ${loanId}, Amount: ${amount}, Method: ${paymentMethod}`)

    // Get the loan details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('client_id, sfd_id, status')
      .eq('id', loanId)
      .single()

    if (loanError || !loan) {
      throw new Error(`Loan not found: ${loanError?.message || 'Unknown error'}`)
    }

    if (loan.status !== 'active' && loan.status !== 'approved') {
      throw new Error(`Cannot make payment on a loan with status ${loan.status}`)
    }

    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount: amount,
        payment_method: paymentMethod,
        status: 'completed'
      })
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`)
    }

    // Update the loan status if needed
    await updateLoanStatus(supabase, loanId, amount)

    // Update SFD repayment account
    if (loan.sfd_id) {
      const { error: accountError } = await supabase
        .from('sfd_accounts')
        .update({ 
          balance: supabase.rpc('increment_balance', { amount_to_add: amount }) 
        })
        .eq('sfd_id', loan.sfd_id)
        .eq('account_type', 'remboursement')

      if (accountError) {
        console.error('Error updating SFD repayment account:', accountError)
        // Continue anyway - we don't want to fail the payment if just the account update fails
      }
    }

    // Record this transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        sfd_id: loan.sfd_id,
        client_id: loan.client_id,
        type: 'loan_repayment',
        amount: -amount, // Negative amount for payments
        status: 'success',
        payment_method: paymentMethod,
        description: `Remboursement de prêt #${loanId}`,
        reference_id: payment.id,
        name: 'Remboursement de prêt'
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
      // Continue anyway - we don't want to fail the payment if just the transaction record fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: payment,
        message: 'Payment processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing payment:', error)

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Helper function to update loan status based on payments
async function updateLoanStatus(supabase, loanId, currentPaymentAmount) {
  try {
    // Get the loan details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('amount, duration_months, interest_rate')
      .eq('id', loanId)
      .single()

    if (loanError) throw loanError

    // Get total payments made
    const { data: payments, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('amount')
      .eq('loan_id', loanId)
      .eq('status', 'completed')

    if (paymentsError) throw paymentsError

    // Calculate total paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Calculate expected total (principal + interest)
    const monthlyInterestRate = loan.interest_rate / 100 / 12
    const totalAmount = loan.amount * Math.pow(1 + monthlyInterestRate, loan.duration_months)

    console.log(`Loan status check: Total paid = ${totalPaid}, Expected total = ${totalAmount}`)

    // If total paid is >= expected total, mark loan as completed
    if (totalPaid >= totalAmount) {
      console.log('Loan fully repaid, updating status to completed')
      const { error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'completed',
          last_payment_date: new Date().toISOString()
        })
        .eq('id', loanId)

      if (error) throw error

      // Add loan completion activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_completed',
          description: 'Prêt entièrement remboursé'
        })
    } else {
      // Just update the last payment date and next payment date
      const nextPaymentDate = new Date()
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30) // Set next payment 30 days from now

      const { error } = await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: new Date().toISOString(),
          next_payment_date: nextPaymentDate.toISOString()
        })
        .eq('id', loanId)

      if (error) throw error
    }
  } catch (error) {
    console.error('Error updating loan status:', error)
    // We don't throw here - we want the payment to succeed even if status update fails
  }
}
