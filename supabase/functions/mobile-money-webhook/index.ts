
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MobileMoneyCallback {
  provider: string;
  transactionId: string;
  phoneNumber: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  reference?: string;
  loanId?: string;
  isRepayment?: boolean;
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    const callback: MobileMoneyCallback = await req.json();
    console.log('Received Mobile Money callback:', callback);
    
    if (callback.status !== 'success') {
      console.log('Transaction not successful, status:', callback.status);
      return new Response(
        JSON.stringify({ success: false, message: 'Transaction not successful' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Handle loan repayment if applicable
    if (callback.isRepayment && callback.loanId) {
      // Record the loan payment
      const { data: payment, error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: callback.loanId,
          amount: callback.amount,
          payment_method: callback.provider + '_mobile_money',
          transaction_id: callback.transactionId,
          status: 'completed'
        })
        .select()
        .single();
        
      if (paymentError) {
        throw new Error(`Error recording loan payment: ${paymentError.message}`);
      }
      
      // Add loan payment activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: callback.loanId,
          activity_type: 'payment_recorded',
          description: `Paiement de ${callback.amount} FCFA effectué via ${callback.provider}`
        });
        
      // Update loan information
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', callback.loanId)
        .single();
        
      if (loanError) {
        throw new Error(`Error fetching loan details: ${loanError.message}`);
      }
      
      const today = new Date();
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(today.getDate() + 30); // Set next payment 30 days from now
      
      await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: today.toISOString(),
          next_payment_date: nextPaymentDate.toISOString()
        })
        .eq('id', callback.loanId);
    }
    
    // Log the successful transaction to audit logs
    await supabase
      .from('audit_logs')
      .insert({
        category: 'financial',
        action: callback.isRepayment ? 'loan_repayment' : 'mobile_money_transaction',
        status: 'success',
        severity: 'info',
        details: callback
      });
      
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Error processing mobile money webhook:', error);
    
    // Log the error
    await supabase
      .from('audit_logs')
      .insert({
        category: 'financial',
        action: 'mobile_money_webhook_error',
        status: 'failure',
        severity: 'error',
        error_message: error.message,
        details: { error: error.message }
      });
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
})
