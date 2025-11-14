import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { qrCodeData, amount, transactionType } = await req.json();

    if (!qrCodeData || !amount || !transactionType) {
      return new Response(JSON.stringify({ error: 'Données manquantes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Décoder le QR code
    let qrData;
    try {
      qrData = JSON.parse(qrCodeData);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'QR code invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier la signature HMAC
    const { signature, ...dataToVerify } = qrData;
    const secret = Deno.env.get('QR_CODE_SECRET') || 'default-secret-key-change-in-production';
    const hmac = createHmac('sha256', secret);
    hmac.update(JSON.stringify(dataToVerify));
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'QR code frauduleux - signature invalide' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier l'expiration
    const expiresAt = new Date(qrData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(JSON.stringify({ error: 'QR code expiré' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier que la session est toujours active
    const { data: session, error: sessionError } = await supabaseClient
      .from('cash_sessions')
      .select('*')
      .eq('id', qrData.cash_session_id)
      .eq('status', 'open')
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session de caisse fermée' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Récupérer le compte du client
    const { data: account, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('sfd_id', qrData.sfd_id)
      .single();

    if (accountError || !account) {
      return new Response(JSON.stringify({ error: 'Compte non trouvé' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier le solde pour les retraits
    if (transactionType === 'withdrawal' && account.balance < amount) {
      return new Response(JSON.stringify({ error: 'Solde insuffisant' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Récupérer le client SFD pour le client_id
    const { data: sfdClient } = await supabaseClient
      .from('sfd_clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('sfd_id', qrData.sfd_id)
      .single();

    // Créer la transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        sfd_id: qrData.sfd_id,
        account_id: account.id,
        amount: amount,
        type: transactionType,
        payment_method: 'cash',
        status: 'completed',
        description: `${transactionType === 'deposit' ? 'Dépôt' : 'Retrait'} via ${qrData.station_name}`,
        reference: `CASH-${qrData.cash_session_id.substring(0, 8)}-${Date.now()}`,
        created_by: qrData.cashier_id,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return new Response(JSON.stringify({ error: 'Erreur lors de la création de la transaction' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mettre à jour le solde du compte
    const newBalance = transactionType === 'deposit' 
      ? Number(account.balance) + Number(amount)
      : Number(account.balance) - Number(amount);

    await supabaseClient
      .from('accounts')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', account.id);

    // Créer l'opération de caisse
    await supabaseClient
      .from('cash_operations')
      .insert({
        session_id: qrData.cash_session_id,
        transaction_id: transaction.id,
        operation_type: transactionType,
        amount: amount,
        balance_after: newBalance,
        client_id: sfdClient?.id || null,
        description: transaction.description,
      });

    // Mettre à jour le QR code (scan count)
    await supabaseClient
      .from('cashier_qr_codes')
      .update({ 
        scan_count: supabaseClient.rpc('increment', { row_id: qrData.cash_session_id }),
        last_scanned_at: new Date().toISOString()
      })
      .eq('cash_session_id', qrData.cash_session_id)
      .eq('status', 'active');

    // Logger dans audit_logs
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: `cashier_${transactionType}`,
      category: 'cash_management',
      severity: 'info',
      status: 'success',
      details: {
        transaction_id: transaction.id,
        amount: amount,
        station: qrData.station_name,
        cashier_id: qrData.cashier_id,
        session_id: qrData.cash_session_id,
      }
    });

    return new Response(JSON.stringify({
      success: true,
      transaction: {
        id: transaction.id,
        amount: amount,
        type: transactionType,
        balance: newBalance,
        reference: transaction.reference,
        station: qrData.station_name,
        timestamp: transaction.created_at,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
