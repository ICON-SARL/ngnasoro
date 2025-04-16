
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with service key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract request parameters
    const { adhesionRequestId, adminUserId, notes } = await req.json();
    
    console.log(`Processing adhesion approval request: ${adhesionRequestId} by admin: ${adminUserId}`);
    
    if (!adhesionRequestId || !adminUserId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the existing adhesion request
    const { data: adhesionRequest, error: fetchError } = await supabase
      .from("client_adhesion_requests")
      .select("*")
      .eq("id", adhesionRequestId)
      .single();
      
    if (fetchError || !adhesionRequest) {
      console.error("Error fetching adhesion request:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError?.message || "Adhesion request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Found adhesion request:", adhesionRequest);
    
    // Begin transaction-like operations (no actual transaction support in JS SDK)
    try {
      // 1. Update the adhesion request status
      const { error: updateError } = await supabase
        .from("client_adhesion_requests")
        .update({
          status: "approved",
          processed_by: adminUserId,
          processed_at: new Date().toISOString(),
          notes: notes
        })
        .eq("id", adhesionRequestId);
        
      if (updateError) {
        console.error("Error updating adhesion request:", updateError);
        throw updateError;
      }
      
      console.log("Adhesion request updated to approved");
      
      // 2. Create a record in sfd_clients if it doesn't exist
      const { data: existingClients, error: checkClientError } = await supabase
        .from("sfd_clients")
        .select("id")
        .eq("user_id", adhesionRequest.user_id)
        .eq("sfd_id", adhesionRequest.sfd_id);
        
      if (checkClientError) {
        console.error("Error checking existing client:", checkClientError);
        throw checkClientError;
      }
      
      if (!existingClients || existingClients.length === 0) {
        console.log("Creating new SFD client record");
        
        const { data: newClient, error: createClientError } = await supabase
          .from("sfd_clients")
          .insert({
            user_id: adhesionRequest.user_id,
            sfd_id: adhesionRequest.sfd_id,
            full_name: adhesionRequest.full_name,
            email: adhesionRequest.email,
            phone: adhesionRequest.phone,
            address: adhesionRequest.address,
            id_number: adhesionRequest.id_number,
            id_type: adhesionRequest.id_type,
            status: "validated",
            validated_by: adminUserId,
            validated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createClientError) {
          console.error("Error creating client record:", createClientError);
          throw createClientError;
        }
        
        console.log("SFD client created:", newClient?.id);
      } else {
        console.log("Client already exists, updating status");
        
        // Update existing client record to validated
        const { error: updateClientError } = await supabase
          .from("sfd_clients")
          .update({
            status: "validated",
            validated_by: adminUserId,
            validated_at: new Date().toISOString()
          })
          .eq("user_id", adhesionRequest.user_id)
          .eq("sfd_id", adhesionRequest.sfd_id);
          
        if (updateClientError) {
          console.error("Error updating client record:", updateClientError);
          throw updateClientError;
        }
      }
      
      // 3. Check if user has an account already
      console.log("Creating or checking account for user");
      
      const { data: existingAccount, error: checkAccountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", adhesionRequest.user_id);
        
      if (checkAccountError) {
        console.error("Error checking existing account:", checkAccountError);
        throw checkAccountError;
      }
      
      if (!existingAccount || existingAccount.length === 0) {
        console.log("Creating new account for user");
        
        // Create account for the user
        const { error: createAccountError } = await supabase
          .from("accounts")
          .insert({
            user_id: adhesionRequest.user_id,
            balance: 0,
            currency: "FCFA",
            sfd_id: adhesionRequest.sfd_id
          });
          
        if (createAccountError) {
          console.error("Error creating account:", createAccountError);
          throw createAccountError;
        }
        
        console.log("Account created successfully");
      } else {
        console.log("User already has an account, no need to create a new one");
      }
      
      // 4. Create a user_sfds entry
      const { data: existingUserSfds, error: checkUserSfdsError } = await supabase
        .from("user_sfds")
        .select("id")
        .eq("user_id", adhesionRequest.user_id)
        .eq("sfd_id", adhesionRequest.sfd_id);
        
      if (checkUserSfdsError) {
        console.error("Error checking user_sfds:", checkUserSfdsError);
        throw checkUserSfdsError;
      }
      
      if (!existingUserSfds || existingUserSfds.length === 0) {
        console.log("Creating user_sfds association");
        
        // Check if this is the first SFD for this user
        const { data: userSfdsCount, error: countError } = await supabase
          .from("user_sfds")
          .select("id", { count: "exact" })
          .eq("user_id", adhesionRequest.user_id);
          
        if (countError) {
          console.error("Error counting user's SFDs:", countError);
          throw countError;
        }
        
        const isFirstSfd = !userSfdsCount || userSfdsCount.length === 0;
        
        // Create user_sfds entry
        const { error: createUserSfdsError } = await supabase
          .from("user_sfds")
          .insert({
            user_id: adhesionRequest.user_id,
            sfd_id: adhesionRequest.sfd_id,
            is_default: isFirstSfd
          });
          
        if (createUserSfdsError) {
          console.error("Error creating user_sfds association:", createUserSfdsError);
          throw createUserSfdsError;
        }
        
        console.log("user_sfds association created");
      } else {
        console.log("user_sfds association already exists");
      }
      
      // 5. Create notification for the user
      console.log("Creating notification for the user");
      
      const { error: notificationError } = await supabase
        .from("admin_notifications")
        .insert({
          type: "adhesion_approved",
          title: "Demande approuvée",
          message: "Votre demande d'adhésion a été approuvée. Vous pouvez maintenant accéder aux services de la SFD.",
          recipient_id: adhesionRequest.user_id,
          sender_id: adminUserId,
          action_link: "/mobile-flow/main"
        });
        
      if (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't throw, notification is not critical
      } else {
        console.log("Notification created successfully");
      }
      
      // Success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Adhesion request approved successfully",
          requestId: adhesionRequestId
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (transactionError) {
      console.error("Transaction error:", transactionError);
      return new Response(
        JSON.stringify({ error: "Failed to process adhesion approval: " + transactionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
