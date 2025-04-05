
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    
    console.log("Request body:", body);

    // Verification endpoint for QR codes
    if (body.code) {
      const code = body.code;
      
      // In a real implementation, we would verify the QR code against database records
      // For now, let's simulate verification with mock logic
      const isValid = code.startsWith("QR") || code.startsWith("SFD");
      
      if (isValid) {
        // Record the transaction in the audit logs
        await supabase.from("audit_logs").insert({
          action: "qr_code_verified",
          status: "success",
          category: "payment",
          details: {
            code,
            verified_at: new Date().toISOString(),
          },
        });
        
        return new Response(
          JSON.stringify({ 
            success: true,
            message: "QR code verified successfully", 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Invalid QR code", 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // QR code generation endpoint (for SFD admins only)
    if (body.userId && body.amount) {
      const { userId, loanId, amount, isWithdrawal } = body;
      
      // Generate a unique code for this transaction
      const code = `SFD${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 30 * 60000).toISOString(); // 30 minutes expiry
      
      // Store QR code data in database
      const { data, error } = await supabase.from("qr_codes").insert({
        code,
        user_id: userId,
        loan_id: loanId || null,
        amount,
        is_withdrawal: isWithdrawal,
        expires_at: expiresAt,
        status: "active"
      }).select();
      
      if (error) {
        console.error("Error storing QR code:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to generate QR code" 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          code,
          expiresAt,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Invalid request parameters" 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
