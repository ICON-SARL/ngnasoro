
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as OTPAuth from "https://esm.sh/otpauth@9.1.4";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const { userId, code, secret, mode } = await req.json();
    
    if (!userId || !code || !secret) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create a TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: 'Ngnasoro',
      label: `Ngnasoro Admin`,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });

    // Verify the TOTP token
    const delta = totp.validate({ token: code, window: 1 });
    const verified = delta !== null;

    if (verified) {
      // If we're in setup mode and verification succeeded,
      // store the secret in the database for future verifications
      if (mode === 'setup') {
        const { error } = await supabase
          .from('user_2fa')
          .upsert({ 
            user_id: userId,
            secret_key: secret,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Log successful verification
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: mode === 'setup' ? '2fa_setup' : '2fa_verification',
        category: 'authentication',
        severity: 'info',
        status: 'success'
      });
    } else {
      // Log failed verification attempt
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: mode === 'setup' ? '2fa_setup_failed' : '2fa_verification_failed',
        category: 'authentication',
        severity: 'warning',
        status: 'failure'
      });
    }

    return new Response(
      JSON.stringify({ 
        verified,
        delta
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in verify-2fa function:', error);
    
    return new Response(
      JSON.stringify({ 
        verified: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
