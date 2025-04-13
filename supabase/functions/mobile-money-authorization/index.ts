
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
    const { sfdId, loanId, action, amount } = await req.json();
    
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
    
    // Authorize the mobile money operation
    // In a real-world scenario, this would involve checking balances, permissions, etc.
    
    let isAuthorized = true;
    let message = "";
    
    // For withdrawals, check if the user has sufficient balance
    if (action === 'withdrawal') {
      // Get user's balance from the accounts table
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .single();
      
      if (accountError || !accountData) {
        isAuthorized = false;
        message = "Could not retrieve account information";
      } else if (accountData.balance < amount) {
        isAuthorized = false;
        message = "Insufficient balance for withdrawal";
      }
    }
    
    // For loan repayments, verify the loan exists and belongs to the user
    if (action === 'payment' && loanId) {
      const { data: loanData, error: loanError } = await supabase
        .from('sfd_loans')
        .select('status, amount_due')
        .eq('id', loanId)
        .eq('user_id', user.id)
        .single();
      
      if (loanError || !loanData) {
        isAuthorized = false;
        message = "Loan not found or does not belong to you";
      } else if (loanData.status === 'fully_paid') {
        isAuthorized = false;
        message = "This loan has already been fully paid";
      }
    }
    
    // Create audit log of the authorization attempt
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `mobile_money_${action}_authorization`,
        status: isAuthorized ? 'success' : 'failure',
        details: {
          amount,
          sfd_id: sfdId,
          loan_id: loanId,
          message
        }
      });
    
    return new Response(
      JSON.stringify({
        authorized: isAuthorized,
        message: isAuthorized ? 
          "Operation authorized" : 
          message || "Operation not authorized"
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
