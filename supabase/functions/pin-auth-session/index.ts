import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Derive a technical password from phone and PIN (min 6 chars for Supabase)
function deriveTechPassword(phone: string, pin: string): string {
  const phoneDigits = phone.replace(/\D/g, '');
  const lastDigits = phoneDigits.slice(-4);
  // Format: PIN + last 4 digits of phone = 8 characters (meets min 6 requirement)
  return `${pin}${lastDigits}`;
}

// Create synthetic email from phone number
function createSyntheticEmail(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `client_${cleanPhone}@noemail.ngnasoro.local`;
}

interface PinAuthRequest {
  phone: string;
  pin: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Admin client for user management
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Parse request body
    const { phone, pin }: PinAuthRequest = await req.json();

    // Validate inputs
    if (!phone || !pin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Téléphone et PIN requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Le PIN doit contenir 4 chiffres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone.replace(/\s/g, '');
    console.log('[pin-auth-session] Verifying PIN for phone:', cleanPhone);

    // Verify PIN using database function (handles lockout + bcrypt)
    const { data: verifyResult, error: verifyError } = await supabaseAdmin.rpc('verify_user_pin', {
      p_phone: cleanPhone,
      p_pin: pin
    });

    if (verifyError) {
      console.error('[pin-auth-session] Error verifying PIN:', verifyError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur de vérification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check verification result
    if (!verifyResult.success) {
      // Handle locked account
      if (verifyResult.locked_until) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Compte temporairement bloqué',
            locked_until: verifyResult.locked_until
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle needs setup
      if (verifyResult.needs_setup) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'PIN non configuré',
            needs_setup: true,
            user_id: verifyResult.user_id
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle wrong PIN
      return new Response(
        JSON.stringify({
          success: false,
          error: verifyResult.error || 'PIN incorrect',
          attempts_remaining: verifyResult.attempts_remaining
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PIN verified successfully - get user details
    const userId = verifyResult.user_id;
    console.log('[pin-auth-session] PIN verified for user:', userId);

    // Get user from auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      console.error('[pin-auth-session] Error fetching user:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Utilisateur non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;
    
    // Generate synthetic email and technical password
    const syntheticEmail = createSyntheticEmail(cleanPhone);
    const techPassword = deriveTechPassword(cleanPhone, pin);
    
    // Ensure user has a valid email (set synthetic if missing or different)
    let userEmail = user.email;
    if (!userEmail || !userEmail.includes('@')) {
      console.log('[pin-auth-session] Setting synthetic email for user');
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: syntheticEmail,
        email_confirm: true
      });
      
      if (emailError) {
        console.error('[pin-auth-session] Error setting email:', emailError);
        // Try to continue with existing email if any
      } else {
        userEmail = syntheticEmail;
      }
    }

    if (!userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email utilisateur non configuré' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's password to the derived technical password (>= 6 chars)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: techPassword
    });

    if (updateError) {
      console.error('[pin-auth-session] Error updating password:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur de mise à jour des identifiants' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create session by signing in with email/password using anon client
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.signInWithPassword({
      email: userEmail,
      password: techPassword
    });

    if (sessionError || !sessionData.session) {
      console.error('[pin-auth-session] Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur de création de session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful session creation
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'pin_session_created',
      category: 'authentication',
      severity: 'info',
      status: 'success',
      details: { phone: cleanPhone }
    });

    console.log('[pin-auth-session] Session created successfully for user:', userId);

    // Return tokens to frontend
    return new Response(
      JSON.stringify({
        success: true,
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user_id: userId,
        expires_at: sessionData.session.expires_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[pin-auth-session] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur inattendue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
