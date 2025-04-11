
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
    const {
      userId,
      sfdId,
      amount,
      type,
      reference,
      loanId
    } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required')
    }

    if (!type || !['deposit', 'withdrawal', 'loan_payment'].includes(type)) {
      throw new Error('Valid transaction type is required')
    }

    console.log(`Generating QR code for user ${userId}, amount: ${amount}, type: ${type}`)

    // In a real implementation, we would:
    // 1. Verify the user and their permissions
    // 2. Check if they have sufficient balance for withdrawals
    // 3. Generate a secure transaction reference
    // 4. Store the pending transaction in the database
    // 5. Generate an actual QR code (e.g., using a library or external service)

    // For this demo, we'll create a mock QR code
    const transactionId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now

    // Create a pseudo QR code as a base64 string
    // In a real implementation, this would be an actual QR code image or data
    const mockQRData = btoa(JSON.stringify({
      trx: transactionId,
      amt: amount,
      typ: type,
      uid: userId.substring(0, 8), // Only include part of the user ID for security
      ref: reference || transactionId,
      exp: expiresAt,
      sfid: sfdId || 'default'
    }))

    // Record this transaction in the database
    const { error: txError } = await supabase
      .from('pending_transactions')
      .insert({
        id: transactionId,
        user_id: userId,
        sfd_id: sfdId || null,
        amount: amount,
        type: type,
        status: 'pending',
        reference: reference || transactionId,
        loan_id: loanId || null,
        expires_at: expiresAt
      })

    if (txError) {
      console.error('Error storing transaction:', txError)
      // Continue anyway for demo purposes
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        qrData: mockQRData,
        transactionId: transactionId,
        expiresAt: expiresAt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error generating QR code:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
