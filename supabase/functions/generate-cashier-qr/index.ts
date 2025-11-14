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

    const { sessionId, stationName } = await req.json();

    // Vérifier que la session existe et appartient à l'utilisateur
    const { data: session, error: sessionError } = await supabaseClient
      .from('cash_sessions')
      .select('*, sfds(code, name)')
      .eq('id', sessionId)
      .eq('cashier_id', user.id)
      .eq('status', 'open')
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session de caisse non trouvée ou fermée' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Expirer l'ancien QR code s'il existe
    await supabaseClient
      .from('cashier_qr_codes')
      .update({ status: 'expired', expires_at: new Date().toISOString() })
      .eq('cash_session_id', sessionId)
      .eq('status', 'active');

    // Générer les données du QR code
    const qrData = {
      type: 'cashier_station',
      cash_session_id: sessionId,
      sfd_id: session.sfd_id,
      sfd_code: (session.sfds as any).code,
      sfd_name: (session.sfds as any).name,
      cashier_id: user.id,
      station_name: stationName || session.station_name || 'Caisse Principale',
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 heures
    };

    // Créer la signature HMAC
    const secret = Deno.env.get('QR_CODE_SECRET') || 'default-secret-key-change-in-production';
    const hmac = createHmac('sha256', secret);
    hmac.update(JSON.stringify(qrData));
    const signature = hmac.digest('hex');

    const qrDataWithSignature = { ...qrData, signature };
    const qrCodeData = JSON.stringify(qrDataWithSignature);

    // Stocker le QR code dans la base de données
    const { data: qrCode, error: qrError } = await supabaseClient
      .from('cashier_qr_codes')
      .insert({
        cash_session_id: sessionId,
        sfd_id: session.sfd_id,
        cashier_id: user.id,
        qr_code_data: qrCodeData,
        qr_code_hash: signature,
        status: 'active',
        expires_at: qrData.expires_at,
        station_name: qrData.station_name,
      })
      .select()
      .single();

    if (qrError) {
      console.error('Error creating QR code:', qrError);
      return new Response(JSON.stringify({ error: 'Erreur lors de la génération du QR code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mettre à jour la session avec le QR code actif
    await supabaseClient
      .from('cash_sessions')
      .update({ active_qr_code_id: qrCode.id })
      .eq('id', sessionId);

    // Logger dans audit_logs
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'generate_cashier_qr',
      category: 'cash_management',
      severity: 'info',
      status: 'success',
      details: {
        session_id: sessionId,
        qr_code_id: qrCode.id,
        station_name: qrData.station_name,
      }
    });

    return new Response(JSON.stringify({
      success: true,
      qrCode: {
        id: qrCode.id,
        data: qrCodeData,
        expires_at: qrData.expires_at,
        station_name: qrData.station_name,
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
