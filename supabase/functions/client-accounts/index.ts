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
    const { action, userId, amount, description, clientId, sfdId, performedBy } = await req.json();
    
    console.log(`Processing ${action} request for user ID: ${userId || clientId}, amount: ${amount}`);
    
    // Handle different actions
    switch (action) {
      case "getBalance":
        return await getBalance(supabaseAdmin, clientId);
      
      case "updateBalance":
        return await updateBalance(supabaseAdmin, clientId, amount, description, performedBy);
      
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

async function updateBalance(supabase, clientId, amount, description, performedBy) {
  try {
    if (!clientId || !amount) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Processing balance update: ${amount} for client ${clientId}`);
    
    // First get the user_id from the client record
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('user_id, sfd_id, full_name')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw new Error('Client not found');
    
    // Get the current account details
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', client.user_id)
      .maybeSingle();
      
    if (accountError) throw new Error('Error fetching account');
    
    // Calculate the new balance
    const currentBalance = account ? account.balance : 0;
    const newBalance = currentBalance + amount;
    
    console.log(`Updating balance: ${currentBalance} -> ${newBalance}`);
    
    if (!account) {
      // Create account if it doesn't exist
      const { data: newAccount, error: createError } = await supabase
        .from('accounts')
        .insert({
          user_id: client.user_id,
          balance: amount,
          currency: 'FCFA',
          sfd_id: client.sfd_id,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) throw new Error('Error creating account');
    } else {
      // Update existing account balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: newBalance,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', client.user_id);
        
      if (updateError) throw new Error('Error updating account balance');
    }
    
    // Determine transaction type
    const transactionType = amount >= 0 ? 'deposit' : 'withdrawal';
    const absAmount = Math.abs(amount);
    
    // Format the description
    const transactionDescription = description || 
      (amount >= 0 ? `Crédit de ${absAmount} FCFA` : `Débit de ${absAmount} FCFA`);
    
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: client.user_id,
        amount: amount,
        type: transactionType,
        name: amount >= 0 ? 'Crédit' : 'Débit',
        description: transactionDescription,
        status: 'success',
        sfd_id: client.sfd_id,
        performed_by: performedBy
      })
      .select()
      .single();
      
    if (transactionError) throw new Error('Error creating transaction record');
    
    // Create notification for the user
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        title: amount >= 0 ? 'Crédit effectué' : 'Débit effectué',
        message: `${amount >= 0 ? 'Un crédit' : 'Un débit'} de ${absAmount.toLocaleString('fr-FR')} FCFA a été effectué sur votre compte par un administrateur SFD.`,
        type: 'transaction',
        recipient_id: client.user_id,
        sender_id: performedBy || client.user_id,
        metadata: {
          amount: amount,
          transaction_id: transaction.id,
          client_name: client.full_name
        }
      });
    
    if (notificationError) console.error('Error creating notification:', notificationError);
    
    // Create an audit log entry
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: performedBy,
        action: amount >= 0 ? 'credit_client_account' : 'debit_client_account',
        category: 'SFD_OPERATIONS',
        status: 'success',
        severity: 'info',
        target_resource: 'client_account/' + client.user_id,
        details: {
          client_id: clientId,
          user_id: client.user_id,
          amount: amount,
          previous_balance: currentBalance,
          new_balance: newBalance,
          description: transactionDescription
        }
      });
    
    if (auditError) console.error('Error creating audit log:', auditError);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Account ${amount >= 0 ? 'credited' : 'debited'} successfully`,
        balance: newBalance,
        transaction_id: transaction.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error updating balance:', error);
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
    
    // Calculate the new balance
    const currentBalance = account ? account.balance : 0;
    const newBalance = currentBalance + amount;
    
    if (!account) {
      // Create account if it doesn't exist
      const { data: newAccount, error: createError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          balance: amount,
          currency: 'FCFA',
          sfd_id: sfdId,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) throw new Error('Error creating account');
    } else {
      // Update existing account balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: newBalance,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) throw new Error('Error updating account balance');
    }
    
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'deposit',
        name: 'Dépôt',
        description: description || 'Dépôt sur compte client',
        status: 'success',
        sfd_id: sfdId
      })
      .select()
      .single();
      
    if (transactionError) throw new Error('Error creating transaction record');
    
    // Create notification for the user
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Dépôt effectué',
        message: `Un dépôt de ${amount.toLocaleString('fr-FR')} FCFA a été effectué sur votre compte`,
        type: 'transaction',
        recipient_id: userId,
        sender_id: userId,
        metadata: {
          amount: amount,
          transaction_id: transaction.id
        }
      });
    
    if (notificationError) console.error('Error creating notification:', notificationError);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deposit processed successfully',
        balance: newBalance,
        transaction_id: transaction.id
      }),
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
    const newBalance = account.balance - amount;
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        balance: newBalance,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) throw new Error('Error updating account balance');
    
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -amount,  // Negative amount for withdrawal
        type: 'withdrawal',
        name: 'Retrait',
        description: description || 'Retrait du compte client',
        status: 'success',
        sfd_id: sfdId
      })
      .select()
      .single();
      
    if (transactionError) throw new Error('Error creating transaction record');
    
    // Create notification for the user
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Retrait effectué',
        message: `Un retrait de ${amount.toLocaleString('fr-FR')} FCFA a été effectué sur votre compte`,
        type: 'transaction',
        recipient_id: userId,
        sender_id: userId,
        metadata: {
          amount: -amount,
          transaction_id: transaction.id
        }
      });
    
    if (notificationError) console.error('Error creating notification:', notificationError);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Withdrawal processed successfully',
        balance: newBalance,
        transaction_id: transaction.id
      }),
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
