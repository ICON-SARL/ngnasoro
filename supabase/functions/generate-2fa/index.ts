
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as OTPAuth from "https://esm.sh/otpauth@9.1.4";
import * as qrcode from "https://esm.sh/qrcode@1.5.3";

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
    // Parse request data
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Generate a new secret key for TOTP
    const secret = generateRandomBase32();
    
    // Create a new TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: 'Ngnasoro',
      label: `Ngnasoro Admin`,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });

    // Get the TOTP Auth URL
    const url = totp.toString();
    
    // Generate QR code as data URL
    const qrCode = await qrcode.toDataURL(url);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        secret,
        qrCode 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-2fa function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
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

// Helper function to generate a random Base32 string
function generateRandomBase32(length = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}
