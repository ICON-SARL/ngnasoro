
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import * as jose from "https://esm.sh/jose@4.14.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-default-jwt-secret-for-development';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    // Extract user_id from token
    const userId = payload.sub;
    if (!userId) {
      throw new Error('Token does not contain a valid user ID');
    }

    // Parse request body
    const body = await req.json();
    console.log("Received loan application:", body);

    // Validate required fields
    const requiredFields = ['amount', 'duration_months', 'purpose', 'sfd_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate attachment URLs if present
    if (body.attachments && !Array.isArray(body.attachments)) {
      throw new Error('Attachments must be an array');
    }

    // Calculate interest rate and monthly payment (simplified example)
    const interestRate = 0.05; // 5% (this would typically come from a configuration)
    const amount = parseFloat(body.amount);
    const durationMonths = parseInt(body.duration_months);
    
    // Simple monthly payment calculation
    const monthlyInterestRate = interestRate / 12;
    const monthlyPayment = (amount * monthlyInterestRate) / 
      (1 - Math.pow(1 + monthlyInterestRate, -durationMonths));

    // First, get the client ID associated with this user for the specified SFD
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('id')
      .eq('user_id', userId)
      .eq('sfd_id', body.sfd_id)
      .single();

    if (clientError) {
      // If no client record exists, create one
      const { data: newClient, error: newClientError } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: userId,
          sfd_id: body.sfd_id,
          full_name: body.full_name || 'Client',
          status: 'pending'
        })
        .select('id')
        .single();

      if (newClientError) {
        throw new Error(`Failed to create client record: ${newClientError.message}`);
      }
      
      var clientId = newClient.id;
    } else {
      var clientId = client.id;
    }

    // Create the loan record
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .insert({
        client_id: clientId,
        sfd_id: body.sfd_id,
        amount: amount,
        duration_months: durationMonths,
        interest_rate: interestRate,
        purpose: body.purpose,
        monthly_payment: monthlyPayment,
        status: 'pending'
      })
      .select()
      .single();

    if (loanError) {
      throw new Error(`Failed to create loan: ${loanError.message}`);
    }

    // Store attachments if provided
    if (body.attachments && body.attachments.length > 0) {
      const attachments = body.attachments.map((url: string) => ({
        loan_id: loan.id,
        document_url: url,
        document_type: 'loan_application',
        uploaded_at: new Date().toISOString()
      }));

      const { error: attachmentError } = await supabase
        .from('client_documents')
        .insert(attachments);

      if (attachmentError) {
        console.error('Error storing attachments:', attachmentError);
        // Continue execution, don't fail the whole request for attachment errors
      }
    }

    // Add loan creation activity
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loan.id,
        activity_type: 'loan_created',
        description: `Demande de prêt créée pour un montant de ${amount} FCFA`,
        performed_by: userId
      });

    // Log successful request
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'create_loan_application',
      category: 'data_modification',
      severity: 'info',
      status: 'success',
      details: { 
        endpoint: '/api/apply-loan',
        loan_id: loan.id,
        amount: amount
      },
      target_resource: `loan:${loan.id}`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: loan,
        message: 'Loan application submitted successfully' 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in apply-loan function:', error);

    // Determine appropriate error status
    let status = 500;
    if (error.message.includes('Authorization') || error.message.includes('Token')) {
      status = 401;
    } else if (error.message.includes('Missing required field')) {
      status = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
