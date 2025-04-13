
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the Authorization header from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Parse the request body
    const { userId, amount, type, loanId } = await req.json();
    
    // Create Supabase client with the auth header
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Verify the user is the same as in the request (for security)
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Generate a unique transaction ID
    const transactionId = `${type.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Generate QR code data
    const qrData = {
      transactionId,
      userId,
      amount,
      type,
      loanId: loanId || null,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, you would generate an actual QR code image or data
    // For this demo, we'll just use the JSON data that would be encoded
    
    // Store transaction data in the database
    const { error: txError } = await supabase
      .from('qr_transactions')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        amount,
        type,
        loan_id: loanId,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes expiry
      });
    
    if (txError) {
      console.error("Error storing transaction:", txError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate QR code' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // In a real implementation, this would be an actual image
    // For this demo, we're returning the data that would be encoded in the QR
    const qrImageData = `data:image/svg+xml;base64,${btoa(JSON.stringify(qrData))}`;
    
    return new Response(
      JSON.stringify({
        success: true,
        qrData: qrImageData,
        transactionId,
        expiresAt: new Date(Date.now() + 30 * 60000).toISOString()
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
