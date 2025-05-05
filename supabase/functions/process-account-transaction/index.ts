
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

    // Validate inputs
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

    // Step 1: Get account by clientId if provided (admin flow) or userId (mobile app flow)
    let account = null;
    
    // If clientId is provided (admin interface)
    if (clientId) {
      // First, get the user_id from the sfd_clients table if needed
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error("Error fetching client:", clientError);
        return new Response(
          JSON.stringify({ error: "Error fetching client", success: false }),
          { headers: corsHeaders, status: 500 }
        );
      }

      if (!clientData || !clientData.user_id) {
        console.error("Client has no associated user account");
        return new Response(
          JSON.stringify({ error: "Client has no associated user account", success: false }),
          { headers: corsHeaders, status: 404 }
        );
      }

      // Get account using the client's user_id
      const { data: accounts, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('user_id', clientData.user_id)
        .order('created_at', { ascending: false });

      if (accountError) {
        console.error("Error fetching account:", accountError);
        return new Response(
          JSON.stringify({ error: "Error fetching account", success: false }),
          { headers: corsHeaders, status: 500 }
        );
      }

      if (!accounts || accounts.length === 0) {
        // Try to create a new account
        try {
          const { data: newAccount, error: createError } = await supabaseAdmin
            .from('accounts')
            .insert({
              user_id: clientData.user_id,
              sfd_id: sfdId,
              balance: 0,
              currency: 'FCFA'
            })
            .select()
            .single();

          if (createError) throw createError;
          account = newAccount;
          
          console.log("Created new account for client:", account);
        } catch (error) {
          console.error("Failed to create account:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create account for client", success: false }),
            { headers: corsHeaders, status: 500 }
          );
        }
      } else {
        // Use the first account
        account = accounts[0];
        console.log("Using existing account:", account);
      }
    } 
    // If userId is provided (mobile app flow)
    else if (userId) {
      let query = supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
        
      // Filter by SFD if specified
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }
      
      const { data: accounts, error: accountError } = await query;
      
      if (accountError) {
        console.error("Error fetching account:", accountError);
        return new Response(
          JSON.stringify({ error: "Error fetching account", success: false }),
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
      
      account = accounts[0];
      console.log("Using account:", account);
    } else {
      console.error("Either userId or clientId is required");
      return new Response(
        JSON.stringify({ error: "Either userId or clientId is required", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // At this point, we should have a valid account
    if (!account) {
      console.error("Failed to find or create an account");
      return new Response(
        JSON.stringify({ error: "Failed to find or create an account", success: false }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Check if sufficient balance for withdrawal
    if (transactionType === 'withdrawal' && account.balance < amount) {
      console.error("Insufficient balance for withdrawal");
      return new Response(
        JSON.stringify({ error: "Insufficient balance for withdrawal", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Calculate new balance
    const newBalance = transactionType === 'deposit' 
      ? account.balance + amount 
      : account.balance - amount;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: account.user_id, // Use account's user_id
        sfd_id: account.sfd_id || sfdId, // Use account's SFD ID or provided one
        amount: transactionType === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount),
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
    console.log("Updating account balance from", account.balance, "to", newBalance);
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
        recipient_id: account.user_id,
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
          userId: account.user_id,
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
