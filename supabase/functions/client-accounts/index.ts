
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Get the Supabase client with service role key for admin access to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const { action, userId, amount, description, clientId, sfdId } = await req.json();
    
    console.log(`Processing ${action} request for user ID: ${userId || clientId}, amount: ${amount}`);
    
    // Handle different actions
    switch (action) {
      case "getBalance":
        return await getBalance(supabaseAdmin, clientId);
      
      case "deposit":
        return await processDeposit(supabaseAdmin, userId, amount, description, sfdId);
      
      case "withdrawal":
        return await processWithdrawal(supabaseAdmin, userId, amount, description, sfdId);
      
      case "getTransactions":
        return await getTransactions(supabaseAdmin, clientId, req.url);
      
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function getBalance(supabase, clientId) {
  try {
    // First get the user_id from the client record
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('user_id')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw new Error('Client not found');
    
    // Then get account details
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', client.user_id)
      .maybeSingle();
    
    if (accountError) throw new Error('Error fetching account');
    
    return new Response(
      JSON.stringify(account || { balance: 0, currency: 'FCFA' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error fetching balance:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function processDeposit(supabase, userId, amount, description, sfdId) {
  try {
    if (!userId || !amount || amount <= 0 || !sfdId) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Processing deposit: ${amount} for user ${userId}`);
    
    // First check if user has an account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (accountError) throw new Error('Error fetching account');
    
    if (!account) {
      // Create account if it doesn't exist
      const { data: newAccount, error: createError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          balance: amount,
          currency: 'FCFA',
          sfd_id: sfdId
        })
        .select()
        .single();
        
      if (createError) throw new Error('Error creating account');
    } else {
      // Update existing account balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: account.balance + amount,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) throw new Error('Error updating account balance');
    }
    
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'deposit',
        name: 'Dépôt',
        description: description || 'Dépôt sur compte client',
        status: 'success',
        sfd_id: sfdId
      });
      
    if (transactionError) throw new Error('Error creating transaction record');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Deposit processed successfully' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error processing deposit:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function processWithdrawal(supabase, userId, amount, description, sfdId) {
  try {
    if (!userId || !amount || amount <= 0 || !sfdId) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Processing withdrawal: ${amount} for user ${userId}`);
    
    // Check if user has an account with sufficient balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (accountError) throw new Error('Error fetching account');
    if (!account) throw new Error('Account not found');
    if (account.balance < amount) throw new Error('Insufficient balance');
    
    // Update account balance
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        balance: account.balance - amount,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) throw new Error('Error updating account balance');
    
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -amount,  // Negative amount for withdrawal
        type: 'withdrawal',
        name: 'Retrait',
        description: description || 'Retrait du compte client',
        status: 'success',
        sfd_id: sfdId
      });
      
    if (transactionError) throw new Error('Error creating transaction record');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Withdrawal processed successfully' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function getTransactions(supabase, clientId, requestUrl) {
  try {
    const url = new URL(requestUrl);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Get the user_id from the client record
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('user_id')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw new Error('Client not found');
    
    // Get transactions
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', client.user_id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error('Error fetching transactions');
    
    return new Response(
      JSON.stringify(data || []),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
