
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface TransactionRequest {
  userId: string;
  sfdId: string;
  type: string;
  amount: number;
  description?: string;
  referenceId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  metaData?: Record<string, any>;
}

interface TransactionResult {
  success: boolean;
  transactionId?: string;
  receiptUrl?: string;
  errorMessage?: string;
  details?: any;
}

// Main handler function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const transactionRequest: TransactionRequest = await req.json();
    console.log('Transaction request received:', transactionRequest);

    // Validate the request
    if (!transactionRequest.userId || !transactionRequest.sfdId || 
        !transactionRequest.type || transactionRequest.amount === undefined) {
      throw new Error('Missing required transaction parameters');
    }

    // For debit transactions, verify sufficient balance
    if (['withdrawal', 'transfer', 'payment', 'loan_repayment'].includes(transactionRequest.type)) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', transactionRequest.userId)
        .single();

      if (accountError) throw new Error(`Account verification failed: ${accountError.message}`);
      
      if (!account || account.balance < Math.abs(transactionRequest.amount)) {
        throw new Error('Insufficient funds for this transaction');
      }
      
      console.log('Balance verification passed');
    }

    // Start transaction (we'll do this manually since Supabase Edge Functions don't support native DB transactions)
    let transactionId: string | undefined;
    let originalBalance: number | undefined;
    
    // 1. Store original balance for potential rollback
    const { data: accountBefore } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', transactionRequest.userId)
      .single();
    
    originalBalance = accountBefore?.balance;

    // 2. Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: transactionRequest.userId,
        sfd_id: transactionRequest.sfdId,
        type: transactionRequest.type,
        amount: transactionRequest.type === 'withdrawal' || 
                transactionRequest.type === 'loan_repayment' ? 
                -Math.abs(transactionRequest.amount) : transactionRequest.amount,
        name: transactionRequest.type.charAt(0).toUpperCase() + transactionRequest.type.slice(1),
        description: transactionRequest.description || `${transactionRequest.type} transaction`,
        reference_id: transactionRequest.referenceId || `tx-${Date.now()}`,
        status: 'processing'
      })
      .select()
      .single();

    if (transactionError) throw new Error(`Transaction creation failed: ${transactionError.message}`);
    transactionId = transaction.id;
    console.log('Transaction record created with ID:', transactionId);

    // 3. Update account balance
    const newBalance = accountBefore.balance + 
      (transactionRequest.type === 'withdrawal' || 
       transactionRequest.type === 'loan_repayment' ? 
       -Math.abs(transactionRequest.amount) : transactionRequest.amount);
    
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance, last_updated: new Date().toISOString() })
      .eq('user_id', transactionRequest.userId);

    if (updateError) {
      // Rollback transaction record by marking as failed
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          description: `${transaction.description} [FAILED: ${updateError.message}]`
        })
        .eq('id', transactionId);
      
      throw new Error(`Account update failed: ${updateError.message}`);
    }
    console.log('Account balance updated');

    // 4. Create secure audit log
    const encryptedDetails = btoa(JSON.stringify({
      transaction_id: transactionId,
      user_id: transactionRequest.userId,
      sfd_id: transactionRequest.sfdId,
      amount: transactionRequest.amount,
      type: transactionRequest.type,
      timestamp: new Date().toISOString(),
      metadata: transactionRequest.metaData || {}
    }));

    await supabase
      .from('audit_logs')
      .insert({
        user_id: transactionRequest.userId,
        action: `transaction_${transactionRequest.type}`,
        category: 'FINANCIAL',
        severity: 'info',
        status: 'success',
        target_resource: 'transactions',
        details: {
          transaction_id: transactionId,
          amount: transactionRequest.amount,
          encrypted_log: encryptedDetails
        }
      });
    console.log('Audit log created');

    // 5. Mark transaction as successful
    await supabase
      .from('transactions')
      .update({ status: 'success' })
      .eq('id', transactionId);
    console.log('Transaction marked as successful');

    // 6. Generate transaction receipt ID for PDF generation
    const receiptId = `receipt-${transactionId}`;
    
    // Return successful response
    const result: TransactionResult = {
      success: true,
      transactionId,
      receiptUrl: `/api/generate-receipt?id=${transactionId}`,
      details: {
        newBalance,
        transactionDate: new Date().toISOString(),
        receiptId
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Transaction processing error:', error.message);
    
    const result: TransactionResult = {
      success: false,
      errorMessage: error.message,
    };

    return new Response(JSON.stringify(result), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
