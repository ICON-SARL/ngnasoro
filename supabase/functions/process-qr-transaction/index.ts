
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Initialize the Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Extract the JWT token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get the current user from the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get request body
    const { qrData, clientId } = await req.json();
    
    if (!qrData || !clientId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Parse QR data
    let parsedQrData;
    try {
      parsedQrData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid QR code data format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate QR code data
    if (!parsedQrData.amount || !parsedQrData.timestamp || !parsedQrData.code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid QR code data content' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if QR code is expired
    const expirationTimestamp = new Date(parsedQrData.expiresAt).getTime();
    if (Date.now() > expirationTimestamp) {
      return new Response(
        JSON.stringify({ success: false, message: 'QR code has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Process the transaction based on type
    const isWithdrawal = parsedQrData.isWithdrawal === true;
    const amount = parsedQrData.amount;
    
    // For withdrawals, check if the client has sufficient funds
    if (isWithdrawal) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', clientId)
        .single();
      
      if (accountError) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unable to retrieve account information' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (!account || account.balance < amount) {
        return new Response(
          JSON.stringify({ success: false, message: 'Insufficient funds for withdrawal' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    // Create the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: clientId,
        amount: isWithdrawal ? -amount : amount,
        type: isWithdrawal ? 'withdrawal' : 'deposit',
        name: isWithdrawal ? 'Retrait QR Code' : 'Dépôt QR Code',
        description: `Transaction ${isWithdrawal ? 'retrait' : 'dépôt'} par QR Code en agence`,
        status: 'success',
        payment_method: 'qr_code',
        reference_id: parsedQrData.code
      })
      .select()
      .single();
    
    if (transactionError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to process transaction', error: transactionError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log the activity
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `qr_code_${isWithdrawal ? 'withdrawal' : 'deposit'}`,
      category: 'financial',
      status: 'success',
      details: {
        client_id: clientId,
        amount,
        qr_code: parsedQrData.code,
        transaction_id: transaction.id
      }
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${isWithdrawal ? 'Withdrawal' : 'Deposit'} processed successfully`,
        transaction: transaction 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  
  } catch (error) {
    console.error('Error processing QR transaction:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
