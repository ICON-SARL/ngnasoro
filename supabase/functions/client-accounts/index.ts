
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
    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      throw new Error("Unauthorized: Auth header missing");
    }

    // Create Supabase client with auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Verify the token to get the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error("Unauthorized: Auth session missing");
    }

    // Parse the request body
    const { 
      action, 
      clientId, 
      amount, 
      description, 
      performedBy,
      limit = 10
    } = await req.json();

    if (!action) {
      throw new Error("Missing required 'action' parameter");
    }

    let data = null;
    let error = null;

    // Handle different actions
    switch (action) {
      case 'getBalance':
        // First try to get balance from accounts table
        let { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('balance, currency')
          .eq('user_id', clientId)
          .single();
          
        if (accountError && accountError.code === 'PGRST116') { // No rows found
          // Try to get client to check if it exists
          const { data: clientData, error: clientError } = await supabase
            .from('sfd_clients')
            .select('id, user_id')
            .eq('id', clientId)
            .single();
            
          if (clientError) {
            throw new Error("Client not found");
          }
          
          // Client exists, but no account found, return zero balance
          data = { balance: 0, currency: 'FCFA' };
        } else if (accountError) {
          throw accountError;
        } else {
          data = accountData;
        }
        break;
        
      case 'updateBalance':
        if (!clientId || amount === undefined) {
          throw new Error("Missing required parameters");
        }
        
        // Get client user_id from sfd_clients
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('user_id, sfd_id')
          .eq('id', clientId)
          .single();
          
        if (clientError || !clientData.user_id) {
          throw new Error("Client not found or has no user account");
        }
        
        // Check if account exists, if not create it
        const { data: accountExistsData, error: accountExistsError } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', clientData.user_id)
          .single();
          
        if (accountExistsError && accountExistsError.code === 'PGRST116') {
          // Create account with initial balance from amount
          const { data: newAccount, error: createError } = await supabase
            .from('accounts')
            .insert({
              user_id: clientData.user_id,
              balance: Math.max(0, amount), // Don't allow negative balance on new account
              currency: 'FCFA',
              sfd_id: clientData.sfd_id
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          // Create transaction record
          await supabase.from('transactions').insert({
            user_id: clientData.user_id,
            amount: amount,
            type: amount > 0 ? 'deposit' : 'withdrawal',
            name: amount > 0 ? 'Dépôt initial' : 'Retrait initial',
            description: description || (amount > 0 ? 'Création de compte' : 'Débit initial'),
            sfd_id: clientData.sfd_id,
            status: 'success'
          });
          
          data = newAccount;
        } else {
          // Account exists, update balance
          if (amount < 0) {
            // Check if withdrawal is possible
            const { data: balanceCheck } = await supabase
              .from('accounts')
              .select('balance')
              .eq('user_id', clientData.user_id)
              .single();
              
            if (balanceCheck && (balanceCheck.balance + amount) < 0) {
              throw new Error("Solde insuffisant pour cette opération");
            }
          }
          
          // Update account balance
          const { data: updatedAccount, error: updateError } = await supabase
            .rpc('update_account_balance', {
              p_user_id: clientData.user_id,
              p_amount: amount
            });
            
          if (updateError) throw updateError;
          
          // Create transaction record
          await supabase.from('transactions').insert({
            user_id: clientData.user_id,
            amount: Math.abs(amount), // Store absolute amount
            type: amount > 0 ? 'deposit' : 'withdrawal',
            name: amount > 0 ? 'Crédit' : 'Débit',
            description: description || (amount > 0 ? 'Crédit manuel' : 'Débit manuel'),
            sfd_id: clientData.sfd_id,
            status: 'success'
          });
          
          // Get updated account data
          const { data: refreshedAccount } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', clientData.user_id)
            .single();
            
          data = refreshedAccount;
        }
        
        // Create activity log
        await supabase.from('client_activities').insert({
          client_id: clientId,
          activity_type: amount > 0 ? 'account_credit' : 'account_debit',
          description: `${amount > 0 ? 'Crédit' : 'Débit'} de ${Math.abs(amount)} FCFA - ${description || ''}`,
          performed_by: performedBy
        });
        
        break;
        
      case 'getTransactions':
        // Get client user_id from sfd_clients
        const { data: clientUserData, error: userError } = await supabase
          .from('sfd_clients')
          .select('user_id')
          .eq('id', clientId)
          .single();
          
        if (userError || !clientUserData.user_id) {
          throw new Error("Client not found or has no user account");
        }
        
        // Get transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', clientUserData.user_id)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (transactionsError) throw transactionsError;
        
        data = transactionsData;
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error('Error in client-accounts function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders },
        status: error.message.includes('Unauthorized') ? 401 : 400
      }
    );
  }
});
