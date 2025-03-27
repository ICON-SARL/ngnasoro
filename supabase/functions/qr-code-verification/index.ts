
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

// AES-256 encryption for QR code payloads
const encryptionKey = Deno.env.get("QR_ENCRYPTION_KEY") ?? "default-key-replace-in-production";

// AES-256 encryption function
async function aesEncrypt(data: string, key: string): Promise<{ encrypted: string, iv: string }> {
  // Convert data to Uint8Array
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  // Derive a key from the passphrase
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  // Generate random salt
  const salt = crypto.randomBytes(16);
  
  // Derive the actual encryption key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  
  // Generate a random IV (Initialization Vector)
  const iv = crypto.randomBytes(12);
  
  // Encrypt the data
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    derivedKey,
    dataBytes
  );
  
  // Combine salt + iv + ciphertext and convert to base64
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
  
  return {
    encrypted: btoa(String.fromCharCode(...combined)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

// AES-256 decryption function
async function aesDecrypt(encryptedData: string, key: string): Promise<string> {
  // Decode the base64 string to binary
  const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // Extract salt, iv and ciphertext
  const salt = encryptedBytes.slice(0, 16);
  const iv = encryptedBytes.slice(16, 16 + 12);
  const ciphertext = encryptedBytes.slice(16 + 12);
  
  // Derive the key from the passphrase
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  // Derive the decryption key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    derivedKey,
    ciphertext
  );
  
  // Convert the decrypted data back to a string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Generate a secure QR code
async function generateSecureQrCode(data: any): Promise<{ code: string, encryptedData: string, expiresAt: Date }> {
  // Convert data to JSON string
  const jsonData = JSON.stringify(data);
  
  // Encrypt the data with AES-256
  const { encrypted } = await aesEncrypt(jsonData, encryptionKey);
  
  // Generate a unique code
  const code = crypto.randomUUID();
  
  // Set expiration time (15 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  
  return { code, encryptedData: encrypted, expiresAt };
}

// Verify and decrypt a QR code
async function verifyQrCode(encryptedData: string): Promise<any | null> {
  try {
    // Decrypt the data using AES-256
    const decryptedJson = await aesDecrypt(encryptedData, encryptionKey);
    
    // Parse the JSON data
    return JSON.parse(decryptedJson);
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
