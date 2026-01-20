import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Derive a technical password from phone and PIN (min 6 chars for Supabase)
function deriveTechPassword(phone: string, pin: string): string {
  // Use phone digits + PIN to create a password >= 6 characters
  const phoneDigits = phone.replace(/\D/g, '');
  const lastDigits = phoneDigits.slice(-4);
  // Format: PIN + last 4 digits of phone = 8 characters
  return `${pin}${lastDigits}`;
}

// Create synthetic email from phone number
function createSyntheticEmail(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `client_${cleanPhone}@noemail.ngnasoro.local`;
}

interface SignupRequest {
  fullName: string;
  phone: string;
  pin: string;
  acceptTerms: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Admin client for user creation
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Anon client for session creation
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const body: SignupRequest = await req.json();
    const { fullName, phone, pin, acceptTerms } = body;

    // Validate input
    if (!fullName || fullName.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nom complet requis (minimum 2 caractères)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || phone.replace(/\D/g, '').length < 11) {
      return new Response(
        JSON.stringify({ success: false, error: 'Numéro de téléphone invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pin || !/^\d{4}$/.test(pin)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Le PIN doit contenir exactement 4 chiffres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!acceptTerms) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vous devez accepter les conditions d\'utilisation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if phone already exists
    const cleanPhone = phone.replace(/\s/g, '');
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ce numéro de téléphone est déjà utilisé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate synthetic email and technical password
    const syntheticEmail = createSyntheticEmail(cleanPhone);
    const techPassword = deriveTechPassword(cleanPhone, pin);

    console.log('[client-signup] Creating user with synthetic email:', syntheticEmail);

    // Create user via admin API
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      password: techPassword,
      email_confirm: true,
      phone: cleanPhone,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        phone: cleanPhone
      }
    });

    if (createError) {
      console.error('[client-signup] Error creating user:', createError);
      return new Response(
        JSON.stringify({ success: false, error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur lors de la création du compte' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log('[client-signup] User created with ID:', userId);

    // Set the PIN hash using the database function
    const { data: pinResult, error: pinError } = await adminClient.rpc('set_user_pin', {
      p_user_id: userId,
      p_pin: pin
    });

    if (pinError) {
      console.error('[client-signup] Error setting PIN:', pinError);
      // Don't fail the signup, just log the warning
    }

    // Update profile with full name and terms acceptance
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: cleanPhone,
        terms_accepted_at: new Date().toISOString(),
        terms_version: '1.0'
      })
      .eq('id', userId);

    if (profileError) {
      console.warn('[client-signup] Profile update warning:', profileError);
    }

    // Create session using anon client
    const { data: sessionData, error: sessionError } = await anonClient.auth.signInWithPassword({
      email: syntheticEmail,
      password: techPassword
    });

    if (sessionError || !sessionData.session) {
      console.error('[client-signup] Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Compte créé mais erreur de session. Veuillez vous connecter.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful signup
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      action: 'client_signup',
      category: 'authentication',
      severity: 'info',
      status: 'success',
      details: { phone: cleanPhone, full_name: fullName.trim() }
    });

    console.log('[client-signup] Signup successful for user:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[client-signup] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur inattendue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
