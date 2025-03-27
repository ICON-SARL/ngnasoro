
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Initialize the Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Extract the JWT token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get the current user from the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get request body
    const { sfdId, loanId, action, amount } = await req.json();
    
    if (!sfdId || !loanId || !action) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Verify user has access to the loan
    const { data: loanData, error: loanError } = await supabase
      .from('sfd_loans')
      .select('client_id, sfd_id')
      .eq('id', loanId)
      .single();
    
    if (loanError || !loanData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Loan not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Verify user is associated with the loan's client_id
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('user_id')
      .eq('id', loanData.client_id)
      .single();
    
    if (clientError || !clientData || clientData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not authorized for this loan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Check SFD authorization (simulated here - in a real system, this would involve SFD admin approval)
    if (action === 'payment') {
      // Simulate SFD approval for payments
      const isAuthorized = true;
      
      // Log the transaction request
      await supabase.from('audit_logs').insert({
        action: 'mobile_money_payment_request',
        user_id: user.id,
        category: 'payment',
        details: {
          sfd_id: sfdId,
          loan_id: loanId,
          amount,
          action
        },
        status: isAuthorized ? 'approved' : 'rejected',
        target_resource: `loan:${loanId}`
      });
      
      // If authorized, record the payment
      if (isAuthorized && amount > 0) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('loan_payments')
          .insert({
            loan_id: loanId,
            amount,
            payment_method: 'mobile_money',
            status: 'completed',
            transaction_id: `MM-${Date.now()}`
          })
          .select()
          .single();
        
        if (paymentError) {
          console.error('Error recording payment:', paymentError);
        } else {
          // Update loan status
          await supabase
            .from('sfd_loans')
            .update({
              last_payment_date: new Date().toISOString(),
              next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Add 30 days
            })
            .eq('id', loanId);
          
          // Log loan activity
          await supabase.from('loan_activities').insert({
            loan_id: loanId,
            activity_type: 'payment',
            description: `Payment of ${amount} FCFA via Mobile Money`,
            performed_by: user.id
          });
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          authorized: isAuthorized,
          message: isAuthorized ? 'Payment authorized' : 'Payment not authorized by SFD' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'withdrawal') {
      // Simulate SFD admin approval for withdrawals
      const isAuthorized = true;
      
      // Log the withdrawal request
      await supabase.from('audit_logs').insert({
        action: 'mobile_money_withdrawal_request',
        user_id: user.id,
        category: 'withdrawal',
        details: {
          sfd_id: sfdId,
          loan_id: loanId,
          amount,
          action
        },
        status: isAuthorized ? 'approved' : 'rejected',
        target_resource: `loan:${loanId}`
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          authorized: isAuthorized,
          message: isAuthorized ? 'Withdrawal authorized' : 'Withdrawal not authorized by SFD admin' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
