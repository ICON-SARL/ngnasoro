
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader?.split(" ")[1]);
      console.log("Authenticated user:", user?.id);
    }

    const { action, data } = await req.json();
    console.log(`Processing ${action} action with data:`, data);

    if (action === "create_loan") {
      console.log("Creating loan record in database...");
      
      // Ensure required fields are present
      if (!data.client_id || !data.sfd_id || !data.amount || !data.duration_months) {
        return new Response(
          JSON.stringify({ error: "Missing required loan fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate monthly payment if not provided
      if (!data.monthly_payment && data.interest_rate) {
        const monthlyInterestRate = data.interest_rate / 100 / 12;
        const totalMonths = data.duration_months;
        const principal = data.amount;
        
        const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
          (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
        
        data.monthly_payment = Math.round(monthlyPayment);
      }

      // Create the loan record
      const { data: loan, error } = await supabase
        .from("sfd_loans")
        .insert({
          client_id: data.client_id,
          sfd_id: data.sfd_id,
          amount: data.amount,
          duration_months: data.duration_months,
          interest_rate: data.interest_rate || 5.5,
          monthly_payment: data.monthly_payment || 0,
          purpose: data.purpose || "General purpose",
          status: data.status || "pending",
          loan_plan_id: data.loan_plan_id,
          subsidy_amount: data.subsidy_amount || 0,
          subsidy_rate: data.subsidy_rate || 0
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating loan:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Loan created successfully:", loan);
      return new Response(
        JSON.stringify(loan),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "get_loan") {
      const { loanId } = data;
      
      if (!loanId) {
        return new Response(
          JSON.stringify({ error: "Loan ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { data: loan, error } = await supabase
        .from("sfd_loans")
        .select(`
          *,
          sfd_clients (
            full_name, 
            email,
            phone
          ),
          sfds (
            name,
            logo_url
          )
        `)
        .eq("id", loanId)
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(loan),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
