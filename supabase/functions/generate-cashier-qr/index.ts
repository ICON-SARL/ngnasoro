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

    const { cash_session_id, station_name } = await req.json();

    if (!cash_session_id) {
      throw new Error('cash_session_id is required');
    }

    // Get cash session details
    const { data: session, error: sessionError } = await supabaseClient
      .from('cash_sessions')
      .select('*, sfds(code, name)')
      .eq('id', cash_session_id)
      .eq('status', 'open')
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found or not open');
    }

    // Verify user is the cashier or SFD admin
    if (session.cashier_id !== user.id) {
      const { data: isSfdAdmin } = await supabaseClient
        .from('user_sfds')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', session.sfd_id)
        .single();

      if (!isSfdAdmin) {
        throw new Error('Unauthorized: Not the session cashier or SFD admin');
      }
    }

    // Expire any active QR codes for this session
    await supabaseClient
      .from('cashier_qr_codes')
      .update({ status: 'expired' })
      .eq('cash_session_id', cash_session_id)
      .eq('status', 'active');

    // Generate QR code data
    const timestamp = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const qrData = {
      type: 'cashier_station',
      cash_session_id: cash_session_id,
      sfd_id: session.sfd_id,
      cashier_id: session.cashier_id,
      station_name: station_name || session.station_name || 'Caisse Principale',
      generated_at: timestamp,
      expires_at: expiresAt.toISOString(),
    };

    // Create HMAC signature
    const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fallback-secret-key';
    const hmac = createHmac('sha256', secret);
    hmac.update(JSON.stringify(qrData));
    const signature = hmac.digest('hex');

    const qrDataWithSignature = {
      ...qrData,
      signature,
    };

    const qrCodeData = JSON.stringify(qrDataWithSignature);

    // Insert QR code into database
    const { data: qrCode, error: insertError } = await supabaseClient
      .from('cashier_qr_codes')
      .insert({
        cash_session_id: cash_session_id,
        sfd_id: session.sfd_id,
        cashier_id: session.cashier_id,
        qr_code_data: qrCodeData,
        qr_code_hash: signature,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        station_name: station_name || session.station_name,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting QR code:', insertError);
      throw new Error('Failed to create QR code');
    }

    // Update cash_sessions with active QR code ID
    await supabaseClient
      .from('cash_sessions')
      .update({ active_qr_code_id: qrCode.id })
      .eq('id', cash_session_id);

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'generate_cashier_qr',
      category: 'cash_management',
      severity: 'info',
      status: 'success',
      details: {
        cash_session_id,
        qr_code_id: qrCode.id,
        station_name: qrData.station_name,
      },
    });

    console.log('QR code generated successfully:', qrCode.id);

    return new Response(
      JSON.stringify({
        success: true,
        qr_code: {
          id: qrCode.id,
          data: qrCodeData,
          expires_at: expiresAt.toISOString(),
          station_name: qrData.station_name,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-cashier-qr:', error);
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
