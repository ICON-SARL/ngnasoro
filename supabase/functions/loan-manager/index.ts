
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
    // Initialiser le client Supabase avec les autorisations de service
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
    
    // Récupérer le jeton d'autorisation du client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: No auth header");
    }
    
    // Vérifier l'utilisateur actuel
    const authToken = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
    
    if (userError || !user) {
      throw new Error("Unauthorized: Invalid user");
    }
    
    // Analyser le corps de la demande
    const { action, data } = await req.json();
    
    if (action === "create_loan") {
      // Vérifier que l'utilisateur a le droit de créer un prêt pour ce client
      const { data: clientCheck, error: clientCheckError } = await supabase
        .from("sfd_clients")
        .select("id, user_id")
        .eq("id", data.client_id)
        .single();
      
      if (clientCheckError || !clientCheck) {
        throw new Error("Client not found or unauthorized");
      }
      
      if (clientCheck.user_id !== user.id && !user.app_metadata?.role === "sfd_admin") {
        throw new Error("Unauthorized: You cannot create a loan for this client");
      }
      
      // Créer l'enregistrement de prêt avec le compte de service qui contourne le RLS
      const { data: loan, error: loanError } = await supabase
        .from("sfd_loans")
        .insert({
          client_id: data.client_id,
          sfd_id: data.sfd_id,
          amount: data.amount,
          duration_months: data.duration_months,
          purpose: data.purpose,
          loan_plan_id: data.loan_plan_id,
          interest_rate: data.interest_rate,
          monthly_payment: data.monthly_payment,
          status: data.status || "pending"
        })
        .select()
        .single();
      
      if (loanError) {
        console.error("Error creating loan:", loanError);
        throw new Error(`Error creating loan: ${loanError.message}`);
      }
      
      // Créer une activité pour ce prêt
      await supabase.from("loan_activities").insert({
        loan_id: loan.id,
        activity_type: "application_submitted",
        description: "Demande de prêt soumise",
        performed_by: user.id
      });
      
      // Créer une notification pour l'administrateur SFD
      await supabase.from("admin_notifications").insert({
        title: "Nouvelle demande de prêt",
        message: `Nouvelle demande de prêt pour ${data.amount.toLocaleString()} FCFA a été soumise.`,
        type: "loan_application",
        recipient_role: "sfd_admin",
        action_link: `/sfd/loans/${loan.id}`,
        sender_id: user.id
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
    
    // New action for loan disbursement
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
          description: `Prêt disbursé pour un montant de ${loan.amount.toLocaleString()} FCFA`,
          performed_by: payload.disbursedBy || user.id
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
