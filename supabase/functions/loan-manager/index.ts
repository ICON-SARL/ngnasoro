
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with service key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Extract auth token from header (if available)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const authToken = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
      
      if (userError) {
        console.error("Auth error:", userError.message);
      } else {
        user = userData.user;
      }
    }
    
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }
    
    const { action, data } = body;
    console.log(`Processing ${action} action with data:`, JSON.stringify(data, null, 2));
    
    if (action === "create_loan") {
      // Validate required fields
      if (!data || !data.client_id || !data.sfd_id || !data.amount || !data.duration_months) {
        throw new Error("Missing required loan data");
      }
      
      // Verify that the user has permission to create a loan for this client
      // For client-created loans, we'll verify the client_id belongs to the user
      if (user) {
        const { data: clientCheck, error: clientCheckError } = await supabase
          .from("sfd_clients")
          .select("id, user_id, sfd_id")
          .eq("id", data.client_id)
          .single();
        
        if (clientCheckError) {
          console.error("Error checking client:", clientCheckError);
          throw new Error("Client not found or unauthorized");
        }
        
        // If the client's user_id doesn't match the authenticated user, 
        // and user is not an SFD admin, deny access
        const isAdmin = user?.app_metadata?.role === "sfd_admin" || 
                       user?.app_metadata?.role === "admin";
                       
        if (clientCheck.user_id !== user.id && !isAdmin) {
          throw new Error("Unauthorized: You cannot create a loan for this client");
        }
      }
      
      console.log("Creating loan record in database...");
      
      // Create loan record using service role to bypass RLS
      const { data: loan, error: loanError } = await supabase
        .from("sfd_loans")
        .insert({
          client_id: data.client_id,
          sfd_id: data.sfd_id,
          amount: data.amount,
          duration_months: data.duration_months,
          purpose: data.purpose,
          loan_plan_id: data.loan_plan_id || null,
          interest_rate: data.interest_rate || 5.5,
          monthly_payment: data.monthly_payment || 0,
          status: data.status || "pending"
        })
        .select()
        .single();
      
      if (loanError) {
        console.error("Error creating loan:", loanError);
        throw new Error(`Error creating loan: ${loanError.message}`);
      }
      
      console.log("Loan created successfully:", loan);
      
      // Create loan activity for audit trail
      const performerId = user?.id || "system";
      await supabase.from("loan_activities").insert({
        loan_id: loan.id,
        activity_type: "application_submitted",
        description: "Demande de prêt soumise",
        performed_by: performerId
      });
      
      // Create notification for SFD admin
      await supabase.from("admin_notifications").insert({
        title: "Nouvelle demande de prêt",
        message: `Nouvelle demande de prêt pour ${data.amount.toLocaleString()} FCFA a été soumise.`,
        type: "loan_application",
        recipient_role: "sfd_admin",
        action_link: `/sfd/loans/${loan.id}`,
        sender_id: performerId
      });
      
      return new Response(
        JSON.stringify(loan),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }
    
    // Loan disbursement action
    if (action === "disburse_loan") {
      const { payload } = data;
      
      if (!payload || !payload.loanId) {
        throw new Error("Missing loan information");
      }
      
      // Fetch the loan
      const { data: loan, error: loanError } = await supabase
        .from("sfd_loans")
        .select("*, client:client_id(user_id)")
        .eq("id", payload.loanId)
        .single();
      
      if (loanError || !loan) {
        throw new Error("Loan not found");
      }
      
      // Check if loan is already disbursed
      if (loan.disbursement_status === "completed") {
        throw new Error("Loan has already been disbursed");
      }
      
      // Update loan status
      const { error: updateError } = await supabase
        .from("sfd_loans")
        .update({
          disbursement_status: "completed",
          disbursed_at: new Date().toISOString(),
          status: "active"
        })
        .eq("id", payload.loanId);
        
      if (updateError) {
        throw new Error(`Error updating loan: ${updateError.message}`);
      }
      
      // Create transaction for loan disbursement
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: loan.client.user_id,
          sfd_id: loan.sfd_id,
          type: "loan_disbursement",
          amount: loan.amount,
          status: "success",
          name: "Décaissement de prêt",
          description: `Prêt approuvé et montant crédité sur votre compte`,
          reference_id: loan.id,
          method: payload.method || "bank_transfer",
          notes: payload.notes
        })
        .select();
        
      if (transactionError) {
        throw new Error(`Error creating transaction: ${transactionError.message}`);
      }
      
      // Create loan activity
      await supabase
        .from("loan_activities")
        .insert({
          loan_id: loan.id,
          activity_type: "disbursement",
          description: `Prêt décaissé pour un montant de ${loan.amount.toLocaleString()} FCFA`,
          performed_by: payload.disbursedBy || (user ? user.id : 'system')
        });
      
      return new Response(
        JSON.stringify({ success: true, transaction: transactionData }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }
    
    // If action is not recognized
    throw new Error(`Unsupported action: ${action}`);
    
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
