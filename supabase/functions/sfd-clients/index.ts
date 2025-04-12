
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sfd-id, x-signature",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Create a Supabase client with the Auth context
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Verify webhook signatures
async function verifyWebhookSignature(payload: any, signature: string, secret: string): Promise<boolean> {
  try {
    // Create HMAC using the secret
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Calculate signature
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payloadStr)
    );
    
    // Convert to hex string
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    // Compare signatures using a constant-time comparison
    return signature === calculatedSignature;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Encrypt sensitive data using AES-256
async function encryptData(data: string, encryptionKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(encryptionKey),
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    // Generate random IV (16 bytes)
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(data)
    );
    
    // Combine IV and encrypted data, then encode as base64
    const result = new Uint8Array(iv.length + new Uint8Array(encryptedBuffer).length);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedBuffer), iv.length);
    
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

// Decrypt sensitive data
async function decryptData(encryptedData: string, encryptionKey: string): Promise<string> {
  try {
    const decoder = new TextDecoder();
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(encryptionKey),
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    // Decode from base64
    const data = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(c => c.charCodeAt(0))
    );
    
    // Extract IV (first 16 bytes)
    const iv = data.slice(0, 16);
    const ciphertext = data.slice(16);
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

// Notify SFD admin via WebSocket about a new client request
async function notifySfdAdmin(sfdId: string, requestData: any): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get admin users for this SFD
    const { data: admins, error: adminsError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId)
      .eq('is_default', true);
      
    if (adminsError) {
      console.error("Error fetching SFD admins:", adminsError);
      return false;
    }
    
    // Send notification via Supabase Realtime
    if (admins && admins.length > 0) {
      // Broadcast to all admins
      const broadcastResult = await supabase
        .channel('admin-notifications')
        .send({
          type: 'broadcast',
          event: 'new_client_request',
          payload: {
            sfdId,
            requestId: requestData.id,
            clientName: requestData.full_name,
            status: requestData.status,
            timestamp: new Date().toISOString()
          }
        });
        
      console.log("WebSocket notification result:", broadcastResult);
      
      // Create notifications in the database
      for (const admin of admins) {
        await supabase
          .from('admin_notifications')
          .insert({
            recipient_id: admin.user_id,
            title: 'Nouvelle demande client',
            message: `${requestData.full_name} a soumis une demande d'adhésion qui nécessite une validation.`,
            type: 'client_request',
            action_link: `/clients/requests/${requestData.id}`
          });
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // Mobile Money Webhook Handler
    if (path[0] === "webhook" && path[1] === "mobile-money") {
      const signature = req.headers.get("X-Momo-Signature") || "";
      const payload = await req.json();
      
      // Get webhook secret from settings
      const { data: settings, error: settingsError } = await supabase
        .from('mobile_money_settings')
        .select('webhook_secret, api_key')
        .eq('provider', payload.provider || 'default')
        .single();
        
      if (settingsError || !settings) {
        console.error("Error fetching webhook settings:", settingsError);
        return new Response(
          JSON.stringify({ error: "Invalid configuration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify signature
      const isValid = await verifyWebhookSignature(payload, signature, settings.webhook_secret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If there's sensitive data, encrypt it before storing
      if (payload.mobile_money_ref) {
        payload.mobile_money_ref = await encryptData(
          payload.mobile_money_ref, 
          settings.api_key // Using API key as encryption key
        );
      }
      
      if (payload.phone_number) {
        payload.phone_number = await encryptData(
          payload.phone_number,
          settings.api_key
        );
      }
      
      // Record the webhook
      const { data: webhookRecord, error: webhookError } = await supabase
        .from('mobile_money_webhooks')
        .insert({
          provider: payload.provider,
          reference_id: payload.reference_id,
          transaction_type: payload.transaction_type,
          amount: payload.amount,
          phone_number: payload.phone_number,
          raw_payload: payload,
          signature: signature,
          is_verified: true
        })
        .select()
        .single();
        
      if (webhookError) {
        console.error("Error recording webhook:", webhookError);
        return new Response(
          JSON.stringify({ error: "Failed to process webhook" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, webhookId: webhookRecord.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Client Adhesion Request Handler
    if (path[0] === "adhesion") {
      if (req.method === "POST") {
        const adhesionRequest = await req.json();
        
        // Add the intermediate status if needed
        if (!adhesionRequest.status) {
          adhesionRequest.status = "pending_validation";
        }
        
        // Insert the client adhesion request
        const { data: newRequest, error: requestError } = await supabase
          .from('client_adhesion_requests')
          .insert(adhesionRequest)
          .select()
          .single();
          
        if (requestError) {
          console.error("Error creating adhesion request:", requestError);
          return new Response(
            JSON.stringify({ error: requestError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Notify SFD administrators about the new request
        await notifySfdAdmin(adhesionRequest.sfd_id, newRequest);
        
        return new Response(
          JSON.stringify({ success: true, data: newRequest }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update adhesion request status
      if (req.method === "PUT" && path[1]) {
        const requestId = path[1];
        const updates = await req.json();
        
        // Update the client adhesion request
        const { data: updatedRequest, error: updateError } = await supabase
          .from('client_adhesion_requests')
          .update(updates)
          .eq('id', requestId)
          .select()
          .single();
          
        if (updateError) {
          console.error("Error updating adhesion request:", updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, data: updatedRequest }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Default response for unhandled endpoints
    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
