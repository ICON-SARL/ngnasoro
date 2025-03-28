
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Client with anonymous role (limited permissions)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client with service role (elevated permissions)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface WebhookHandler {
  loanId: string;
  status: string;
  event?: string;
}

const processLoanStatusChange = async (req: Request) => {
  try {
    const { loanId, status, event } = await req.json() as WebhookHandler;
    
    if (!loanId || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Get the loan details
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('sfd_loans')
      .select(`
        id, 
        amount, 
        client_id, 
        sfd_id,
        monthly_payment,
        next_payment_date
      `)
      .eq('id', loanId)
      .single();
      
    if (loanError || !loan) {
      console.error('Error fetching loan:', loanError);
      throw new Error('Loan not found');
    }
    
    // Get the client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('user_id, full_name, phone')
      .eq('id', loan.client_id)
      .single();
      
    if (clientError || !client) {
      console.error('Error fetching client:', clientError);
      throw new Error('Client not found');
    }
    
    let notificationMessage = '';
    let notificationType = '';
    
    // Prepare notification based on status change
    if (status === 'approved') {
      notificationType = 'loan_approved';
      notificationMessage = `Votre demande de prêt de ${loan.amount.toLocaleString('fr-FR')} FCFA a été approuvée.`;
    } else if (status === 'rejected') {
      notificationType = 'loan_rejected';
      notificationMessage = `Votre demande de prêt de ${loan.amount.toLocaleString('fr-FR')} FCFA a été rejetée.`;
    } else if (status === 'active' && event === 'disbursed') {
      notificationType = 'loan_disbursed';
      notificationMessage = `Votre prêt de ${loan.amount.toLocaleString('fr-FR')} FCFA a été décaissé et transféré sur votre compte.`;
    } else if (event === 'payment_reminder') {
      notificationType = 'payment_reminder';
      const paymentDate = loan.next_payment_date ? new Date(loan.next_payment_date).toLocaleDateString('fr-FR') : 'prochainement';
      notificationMessage = `Rappel: Votre paiement de ${loan.monthly_payment.toLocaleString('fr-FR')} FCFA est dû pour le ${paymentDate}.`;
    } else if (event === 'payment_received') {
      notificationType = 'payment_received';
      notificationMessage = `Votre paiement de ${loan.monthly_payment.toLocaleString('fr-FR')} FCFA a été reçu. Merci!`;
    }
    
    if (!notificationMessage || !notificationType) {
      return new Response(
        JSON.stringify({ error: 'Invalid status or event' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Create notification in database
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('admin_notifications')
      .insert({
        type: notificationType,
        recipient_id: client.user_id,
        recipient_role: 'client',
        title: notificationType.includes('payment') ? 'Paiement' : 'Statut du prêt',
        message: notificationMessage,
        read: false,
        action_link: `/loans/${loanId}`,
        sender_id: loan.sfd_id
      })
      .select()
      .single();
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }
    
    // Send SMS if phone number is available
    let smsResult = null;
    if (client.phone) {
      // Call the client-notifications function to send SMS
      const notificationResponse = await fetch(
        `${supabaseUrl}/functions/v1/client-notifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            type: notificationType,
            recipient_id: client.user_id,
            loan_id: loanId,
            amount: notificationType.includes('payment') ? loan.monthly_payment : loan.amount,
            payment_date: loan.next_payment_date,
            message: notificationMessage,
            phone_number: client.phone
          })
        }
      );
      
      smsResult = await notificationResponse.json();
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        notification,
        sms: smsResult
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in loan-status-webhooks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Route the request based on method
  if (req.method === 'POST') {
    return processLoanStatusChange(req);
  }
  
  // Default response for unsupported methods
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
});
