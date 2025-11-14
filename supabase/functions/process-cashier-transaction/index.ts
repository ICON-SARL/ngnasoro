import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { qr_code_data, amount, transaction_type } = await req.json();

    if (!qr_code_data || !amount || !transaction_type) {
      throw new Error('Missing required fields: qr_code_data, amount, transaction_type');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['deposit', 'withdrawal'].includes(transaction_type)) {
      throw new Error('Invalid transaction_type. Must be "deposit" or "withdrawal"');
    }

    // Parse QR code data
    let qrData;
    try {
      qrData = JSON.parse(qr_code_data);
    } catch {
      throw new Error('Invalid QR code format');
    }

    // Verify QR code signature
    const { signature, ...dataToVerify } = qrData;
    const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fallback-secret-key';
    const hmac = createHmac('sha256', secret);
    hmac.update(JSON.stringify(dataToVerify));
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid QR code signature');
    }

    // Check QR code expiration
    const expiresAt = new Date(qrData.expires_at);
    if (expiresAt < new Date()) {
      throw new Error('QR code has expired');
    }

    // Verify QR code in database
    const { data: qrCode, error: qrError } = await supabaseClient
      .from('cashier_qr_codes')
      .select('*')
      .eq('qr_code_hash', signature)
      .eq('status', 'active')
      .single();

    if (qrError || !qrCode) {
      throw new Error('QR code not found or inactive');
    }

    // Check scan count
    if (qrCode.scan_count >= qrCode.max_scans) {
      throw new Error('QR code has reached maximum scan count');
    }

    // Verify cash session is still open
    const { data: session, error: sessionError } = await supabaseClient
      .from('cash_sessions')
      .select('*')
      .eq('id', qrData.cash_session_id)
      .eq('status', 'open')
      .single();

    if (sessionError || !session) {
      throw new Error('Cash session not found or closed');
    }

    // Get user's SFD client record
    const { data: client, error: clientError } = await supabaseClient
      .from('sfd_clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('sfd_id', session.sfd_id)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found in this SFD');
    }

    // Get user's account
    const { data: account, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('sfd_id', session.sfd_id)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // For withdrawal, verify sufficient balance
    if (transaction_type === 'withdrawal' && account.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const newBalance = transaction_type === 'deposit' 
      ? Number(account.balance) + Number(amount)
      : Number(account.balance) - Number(amount);

    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        sfd_id: session.sfd_id,
        account_id: account.id,
        amount: amount,
        type: transaction_type,
        payment_method: 'cash',
        status: 'completed',
        description: `${transaction_type === 'deposit' ? 'Dépôt' : 'Retrait'} à la ${qrCode.station_name || 'caisse'}`,
        created_by: session.cashier_id,
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction error:', txError);
      throw new Error('Failed to create transaction');
    }

    // Update account balance
    const { error: updateError } = await supabaseClient
      .from('accounts')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', account.id);

    if (updateError) {
      console.error('Balance update error:', updateError);
      throw new Error('Failed to update balance');
    }

    // Create cash operation
    await supabaseClient
      .from('cash_operations')
      .insert({
        session_id: session.id,
        transaction_id: transaction.id,
        operation_type: transaction_type,
        amount: amount,
        balance_after: newBalance,
        client_id: client.id,
        description: `${transaction_type === 'deposit' ? 'Dépôt' : 'Retrait'} client via QR`,
      });

    // Update QR code scan count and last scanned
    await supabaseClient
      .from('cashier_qr_codes')
      .update({
        scan_count: qrCode.scan_count + 1,
        last_scanned_at: new Date().toISOString(),
      })
      .eq('id', qrCode.id);

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: `cashier_${transaction_type}`,
      category: 'cash_management',
      severity: 'info',
      status: 'success',
      details: {
        transaction_id: transaction.id,
        amount,
        cash_session_id: session.id,
        qr_code_id: qrCode.id,
        station_name: qrCode.station_name,
      },
    });

    console.log('Transaction processed successfully:', transaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          id: transaction.id,
          amount: amount,
          type: transaction_type,
          new_balance: newBalance,
          reference: transaction.reference,
          station_name: qrCode.station_name,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-cashier-transaction:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
