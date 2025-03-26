
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as crypto from "https://deno.land/std@0.140.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// AES encryption for QR code payloads
const encryptionKey = Deno.env.get("QR_ENCRYPTION_KEY") ?? "default-key-replace-in-production";

// Generate a secure QR code
async function generateSecureQrCode(data: any): Promise<{ code: string, encryptedData: string, expiresAt: Date }> {
  // Convert data to JSON string
  const jsonData = JSON.stringify(data);
  
  // Generate a random nonce
  const nonce = crypto.randomBytes(16);
  
  // Create a text encoder
  const encoder = new TextEncoder();
  
  // Convert encryption key to bytes
  const keyBytes = encoder.encode(encryptionKey);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce
    },
    key,
    encoder.encode(jsonData)
  );
  
  // Convert encrypted data to base64
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
  
  // Convert nonce to base64
  const nonceBase64 = btoa(String.fromCharCode(...nonce));
  
  // Combine nonce and encrypted data
  const encryptedData = `${nonceBase64}.${encryptedBase64}`;
  
  // Generate a unique code
  const code = crypto.randomUUID();
  
  // Set expiration time (15 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  
  return { code, encryptedData, expiresAt };
}

// Verify and decrypt a QR code
async function verifyQrCode(encryptedData: string): Promise<any | null> {
  try {
    // Split the data
    const [nonceBase64, encryptedBase64] = encryptedData.split('.');
    
    // Decode the nonce
    const nonceString = atob(nonceBase64);
    const nonce = new Uint8Array(nonceString.length);
    for (let i = 0; i < nonceString.length; i++) {
      nonce[i] = nonceString.charCodeAt(i);
    }
    
    // Decode the encrypted data
    const encryptedString = atob(encryptedBase64);
    const encryptedArray = new Uint8Array(encryptedString.length);
    for (let i = 0; i < encryptedString.length; i++) {
      encryptedArray[i] = encryptedString.charCodeAt(i);
    }
    
    // Create a text encoder and decoder
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Convert encryption key to bytes
    const keyBytes = encoder.encode(encryptionKey);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce
      },
      key,
      encryptedArray
    );
    
    // Convert decrypted data to JSON
    const decryptedText = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error("Error verifying QR code:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if this is a request to generate a QR code
    const url = new URL(req.url);
    if (url.pathname.endsWith('/generate')) {
      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { 
            status: 405, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      const { loanId, amount, userId } = await req.json();
      
      if (!loanId || !amount || !userId) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      console.log(`Generating QR code for loan ${loanId}`);
      
      // Generate a secure QR code
      const { code, encryptedData, expiresAt } = await generateSecureQrCode({
        loanId,
        amount,
        userId,
        timestamp: new Date().toISOString()
      });
      
      // Store the QR code in the database
      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          code,
          encrypted_data: encryptedData,
          user_id: userId,
          loan_id: loanId,
          amount,
          expires_at: expiresAt.toISOString(),
          used: false
        });
      
      if (error) {
        console.error("Error storing QR code:", error);
        throw error;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          code,
          expiresAt: expiresAt.toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle verification requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { code } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Missing QR code" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Verifying QR code ${code}`);

    // Look up the QR code in the database
    const { data: qrData, error: qrError } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("code", code)
      .eq("used", false)
      .single();
    
    if (qrError || !qrData) {
      console.error("Error retrieving QR code:", qrError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired QR code" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Check if the QR code has expired
    if (new Date(qrData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "QR code has expired" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Verify and decrypt the QR code
    const decryptedData = await verifyQrCode(qrData.encrypted_data);
    
    if (!decryptedData) {
      return new Response(
        JSON.stringify({ error: "Invalid QR code data" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Mark the QR code as used
    await supabase
      .from("qr_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("code", code);
    
    // Record the payment in the database
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: qrData.user_id,
        amount: qrData.amount,
        name: "Remboursement prêt",
        type: "Paiement en agence SFD",
        reference: code
      });

    if (error) {
      console.error("Error recording payment:", error);
      throw error;
    }

    // Broadcast the loan status update using Supabase Realtime
    const broadcastResult = await supabase
      .channel('loan-status-changes')
      .send({
        type: 'broadcast',
        event: 'loan_status_update',
        payload: {
          paidAmount: 13.90,
          remainingAmount: 11.50,
          progress: 55,
          securityData: {
            qrCode: code,
            method: 'AES-256',
            usedAt: new Date().toISOString()
          },
          paymentHistory: [
            { id: 4, date: new Date().toLocaleDateString('fr-FR'), amount: 3.50, status: 'paid' },
            { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
            { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
            { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
          ]
        }
      });

    console.log("Broadcast result:", broadcastResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "QR code verified and payment recorded",
        paymentId: data?.[0]?.id || "payment-123"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing QR code verification:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
