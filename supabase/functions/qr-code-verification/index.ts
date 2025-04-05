
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

    // Scanning QR codes (mobile app)
    if (body.action === "scan" && body.code && body.userId) {
      const { code, userId } = body;
      
      // Check if the QR code exists and is valid
      const { data: qrData, error: qrError } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("code", code)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .single();
      
      if (qrError || !qrData) {
        console.error("QR code not found or expired:", qrError);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Code QR invalide ou expiré", 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Process the transaction based on the QR code data
      const transactionType = qrData.is_withdrawal ? "withdrawal" : "payment";
      const transactionAmount = qrData.is_withdrawal ? -qrData.amount : -qrData.amount;
      const transactionName = qrData.is_withdrawal 
        ? "Retrait en agence SFD" 
        : "Paiement en agence SFD";
      
      // Record the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: transactionAmount,
          type: transactionType,
          payment_method: "agency_qr",
          name: transactionName,
          description: `Transaction via QR code (${qrData.code})`,
          status: "success",
          date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Erreur lors de l'enregistrement de la transaction", 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Update the QR code status to used
      await supabase
        .from("qr_codes")
        .update({ status: "used", used_at: new Date().toISOString(), used_by: userId })
        .eq("id", qrData.id);
      
      // Record the operation in audit logs
      await supabase
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: `qr_code_${transactionType}`,
          category: "payment",
          status: "success",
          details: {
            qr_code: qrData.code,
            transaction_id: transaction.id,
            amount: qrData.amount
          }
        });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: qrData.is_withdrawal 
            ? "Retrait en espèces confirmé" 
            : "Paiement en espèces confirmé",
          transaction: transaction,
          isWithdrawal: qrData.is_withdrawal
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Verification endpoint for QR codes
    if (body.code) {
      const code = body.code;
      
      // Verify the QR code against database records
      const { data: qrCode, error: qrError } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("code", code)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .single();
      
      if (qrError || !qrCode) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Code QR invalide ou expiré", 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Record the verification in the audit logs
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
          message: "QR code vérifié avec succès",
          qrData: qrCode
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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
