
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Starting process-account-transaction function");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      userId, 
      clientId,
      sfdId, 
      amount, 
      transactionType, 
      description, 
      performedBy 
    } = await req.json();

    console.log("Transaction request:", { 
      userId, clientId, sfdId, amount, transactionType, description, performedBy 
    });

    if (!userId) {
      console.error("User ID is required");
      return new Response(
        JSON.stringify({ error: "User ID is required", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      console.error("Amount must be greater than 0");
      return new Response(
        JSON.stringify({ error: "Amount must be greater than 0", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (transactionType !== 'deposit' && transactionType !== 'withdrawal') {
      console.error("Invalid transaction type");
      return new Response(
        JSON.stringify({ error: "Transaction type must be 'deposit' or 'withdrawal'", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get account with proper SFD ID if specified
    let accountQuery = supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    
    // If SFD ID is specified, try to find an account for that SFD
    if (sfdId) {
      accountQuery = accountQuery.eq('sfd_id', sfdId);
    }
    
    const { data: accounts, error: accountError } = await accountQuery;
    
    if (accountError) {
      console.error("Error fetching accounts:", accountError);
      return new Response(
        JSON.stringify({ error: "Error fetching accounts", success: false }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    if (!accounts || accounts.length === 0) {
      console.error("No accounts found for user");
      return new Response(
        JSON.stringify({ error: "No accounts found for user", success: false }),
        { headers: corsHeaders, status: 404 }
      );
    }
    
    // Choose the right account - prefer the one with matching SFD ID if specified
    let account = accounts[0]; // Default to first account
    
    if (sfdId && accounts.length > 1) {
      const matchingSfdAccount = accounts.find(a => a.sfd_id === sfdId);
      if (matchingSfdAccount) {
        account = matchingSfdAccount;
      }
    }
    
    console.log("Using account:", account);

    // Check if sufficient balance for withdrawal
    if (transactionType === 'withdrawal' && account.balance < amount) {
      console.error("Insufficient balance for withdrawal");
      return new Response(
        JSON.stringify({ error: "Insufficient balance for withdrawal", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Adjust the amount based on transaction type
    const adjustedAmount = transactionType === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount);
    
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        sfd_id: account.sfd_id, // Use the account's SFD ID
        amount: adjustedAmount,
        type: transactionType,
        name: transactionType === 'deposit' ? 'Dépôt' : 'Retrait',
        description: description || (transactionType === 'deposit' ? 'Dépôt sur compte' : 'Retrait du compte'),
        payment_method: 'sfd_account',
        status: 'success'
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to create transaction:", transactionError);
      return new Response(
        JSON.stringify({ error: "Failed to create transaction", success: false }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Update account balance
    const newBalance = transactionType === 'deposit' 
      ? account.balance + amount 
      : account.balance - amount;

    const { error: updateError } = await supabaseAdmin
      .from('accounts')
      .update({ 
        balance: newBalance,
        last_updated: new Date().toISOString()
      })
      .eq('id', account.id);

    if (updateError) {
      console.error("Failed to update account balance:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update account balance", success: false }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Create a notification for the user
    await supabaseAdmin
      .from('admin_notifications')
      .insert({
        title: transactionType === 'deposit' ? 'Dépôt reçu' : 'Retrait effectué',
        message: transactionType === 'deposit' 
          ? `Un dépôt de ${amount} FCFA a été effectué sur votre compte` 
          : `Un retrait de ${amount} FCFA a été effectué de votre compte`,
        type: 'transaction',
        recipient_id: userId,
        sender_id: performedBy || null,
        metadata: {
          amount: amount,
          transactionId: transaction.id,
          transactionType: transactionType
        }
      });

    // Create audit log entry
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: performedBy || null,
        action: `${transactionType}_processed`,
        category: 'TRANSACTION',
        severity: 'info',
        status: 'success',
        target_resource: `accounts/${account.id}`,
        details: {
          clientId: clientId,
          userId: userId,
          amount: amount,
          transactionType: transactionType,
          transactionId: transaction.id
        }
      });

    console.log("Transaction processed successfully:", {
      transaction: transaction.id,
      newBalance,
      transactionType
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${transactionType === 'deposit' ? 'Dépôt' : 'Retrait'} effectué avec succès`,
        transaction: transaction,
        newBalance: newBalance
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error("Error in process-account-transaction function:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
