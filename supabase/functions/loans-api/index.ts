
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface LoanRequest {
  clientId: string;
  sfdId: string;
  amount: number;
  durationMonths: number;
  interestRate: number;
  purpose: string;
  loanPlanId?: string;
  subsidyAmount?: number;
  subsidyRate?: number;
}

interface PaymentRequest {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Initialize the Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);

    // Process the API based on the path and method
    if (path[1] === 'create' && req.method === 'POST') {
      return await handleCreateLoan(req, supabase);
    } 
    else if (path[1] === 'approve' && req.method === 'POST') {
      return await handleApproveLoan(req, supabase);
    } 
    else if (path[1] === 'reject' && req.method === 'POST') {
      return await handleRejectLoan(req, supabase);
    } 
    else if (path[1] === 'disburse' && req.method === 'POST') {
      return await handleDisburseLoan(req, supabase);
    } 
    else if (path[1] === 'payment' && req.method === 'POST') {
      return await handleRecordPayment(req, supabase);
    } 
    else if (path[1] === 'schedule' && req.method === 'GET') {
      const loanId = url.searchParams.get('loanId');
      if (!loanId) {
        return new Response(
          JSON.stringify({ error: 'Loan ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return await handleGetPaymentSchedule(loanId, supabase);
    } 
    else if (path[1] === 'calculate' && req.method === 'POST') {
      return await handleCalculateLoan(req, supabase);
    }
    else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateLoan(req: Request, supabase: any) {
  const loanData: LoanRequest = await req.json();
  
  try {
    // Validate SFD has sufficient funds
    const { data: sfdAccount, error: accountError } = await supabase
      .from('sfd_accounts')
      .select('balance')
      .eq('sfd_id', loanData.sfdId)
      .eq('account_type', 'operation')
      .single();
    
    if (accountError) {
      throw new Error(`Error checking SFD account: ${accountError.message}`);
    }
    
    if (sfdAccount.balance < loanData.amount) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient funds in SFD operation account',
          balance: sfdAccount.balance,
          required: loanData.amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanData.amount, loanData.interestRate, loanData.durationMonths);

    // Insert loan record
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .insert({
        client_id: loanData.clientId,
        sfd_id: loanData.sfdId,
        amount: loanData.amount,
        duration_months: loanData.durationMonths,
        interest_rate: loanData.interestRate,
        monthly_payment: monthlyPayment,
        purpose: loanData.purpose,
        status: 'pending',
        subsidy_amount: loanData.subsidyAmount || 0,
        subsidy_rate: loanData.subsidyRate || 0,
      })
      .select()
      .single();

    if (loanError) {
      throw new Error(`Error creating loan: ${loanError.message}`);
    }
    
    // Create loan activity record
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loan.id,
        activity_type: 'loan_created',
        description: `Loan of ${loanData.amount} FCFA created for client ${loanData.clientId}`,
      });
    
    return new Response(
      JSON.stringify({ success: true, loan }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating loan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleApproveLoan(req: Request, supabase: any) {
  const { loanId, approvedBy } = await req.json();
  
  try {
    // Update loan status
    const { data: loan, error: updateError } = await supabase
      .from('sfd_loans')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error approving loan: ${updateError.message}`);
    }
    
    // Create activity record
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'loan_approved',
        description: `Loan #${loanId} approved by ${approvedBy}`,
        performed_by: approvedBy,
      });
    
    return new Response(
      JSON.stringify({ success: true, loan }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error approving loan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRejectLoan(req: Request, supabase: any) {
  const { loanId, rejectedBy, reason } = await req.json();
  
  try {
    // Update loan status
    const { data: loan, error: updateError } = await supabase
      .from('sfd_loans')
      .update({
        status: 'rejected',
      })
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error rejecting loan: ${updateError.message}`);
    }
    
    // Create activity record
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'loan_rejected',
        description: `Loan #${loanId} rejected by ${rejectedBy}. Reason: ${reason || 'Not specified'}`,
        performed_by: rejectedBy,
      });
    
    return new Response(
      JSON.stringify({ success: true, loan }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error rejecting loan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDisburseLoan(req: Request, supabase: any) {
  const { loanId, disbursedBy, method } = await req.json();
  
  try {
    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError) {
      throw new Error(`Error fetching loan: ${loanError.message}`);
    }
    
    if (loan.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Loan must be approved before disbursement' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify SFD has sufficient funds
    const { data: sfdAccount, error: accountError } = await supabase
      .from('sfd_accounts')
      .select('balance')
      .eq('sfd_id', loan.sfd_id)
      .eq('account_type', 'operation')
      .single();
    
    if (accountError) {
      throw new Error(`Error checking SFD account: ${accountError.message}`);
    }
    
    if (sfdAccount.balance < loan.amount) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient funds in SFD operation account for disbursement',
          balance: sfdAccount.balance,
          required: loan.amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate reference number
    const reference = `DISB-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create disbursement record
    const { data: disbursement, error: disbursementError } = await supabase
      .from('loan_disbursements')
      .insert({
        loan_id: loanId,
        amount: loan.amount,
        disbursement_method: method || 'bank_transfer',
        status: 'completed',
        reference_number: reference,
        disbursed_by: disbursedBy,
      })
      .select()
      .single();
    
    if (disbursementError) {
      throw new Error(`Error creating disbursement: ${disbursementError.message}`);
    }
    
    // Update loan status and disbursement info
    const { data: updatedLoan, error: updateError } = await supabase
      .from('sfd_loans')
      .update({
        status: 'active',
        disbursed_at: new Date().toISOString(),
        disbursement_status: 'completed',
        disbursement_reference: reference,
        next_payment_date: calculateNextPaymentDate(new Date()),
      })
      .eq('id', loanId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Error updating loan: ${updateError.message}`);
    }
    
    // Create transaction to move funds from SFD to client account
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('user_id')
      .eq('id', loan.client_id)
      .single();
    
    if (clientError || !clientData.user_id) {
      throw new Error(`Error fetching client data: ${clientError?.message || 'No user_id found'}`);
    }
    
    // Create transaction for disbursement
    await supabase
      .from('transactions')
      .insert({
        user_id: clientData.user_id,
        sfd_id: loan.sfd_id,
        amount: loan.amount,
        type: 'loan_disbursement',
        name: 'Loan Disbursement',
        description: `Disbursement for loan #${loanId}`,
        reference_id: reference,
        status: 'success',
      });
    
    // Deduct the amount from SFD operation account
    await supabase
      .rpc('update_sfd_account_balance', {
        p_sfd_id: loan.sfd_id, 
        p_account_type: 'operation',
        p_amount: -loan.amount
      });
    
    // Add record to loan activities
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'loan_disbursed',
        description: `Loan #${loanId} disbursed. Amount: ${loan.amount} FCFA. Method: ${method || 'bank_transfer'}. Reference: ${reference}`,
        performed_by: disbursedBy,
      });
    
    // Schedule payment reminders
    await schedulePaymentReminders(loanId, updatedLoan, supabase);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        loan: updatedLoan,
        disbursement,
        reference
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error disbursing loan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRecordPayment(req: Request, supabase: any) {
  const paymentData: PaymentRequest = await req.json();
  
  try {
    // Verify the loan exists and is active
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', paymentData.loanId)
      .single();
    
    if (loanError) {
      throw new Error(`Error fetching loan: ${loanError.message}`);
    }
    
    if (loan.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Payments can only be made for active loans' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: paymentData.loanId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        transaction_id: paymentData.reference || `PAY-${Date.now()}`,
        status: 'completed',
      })
      .select()
      .single();
    
    if (paymentError) {
      throw new Error(`Error recording payment: ${paymentError.message}`);
    }
    
    // Get the client's user_id for creating the transaction
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('user_id')
      .eq('id', loan.client_id)
      .single();
    
    if (clientError || !clientData.user_id) {
      throw new Error(`Error fetching client data: ${clientError?.message || 'No user_id found'}`);
    }
    
    // Create transaction for the payment
    await supabase
      .from('transactions')
      .insert({
        user_id: clientData.user_id,
        sfd_id: loan.sfd_id,
        amount: -paymentData.amount, // Negative amount since it's money leaving the client
        type: 'loan_repayment',
        name: 'Loan Repayment',
        description: `Payment for loan #${paymentData.loanId}`,
        reference_id: payment.id,
        status: 'success',
      });
    
    // Add to SFD repayment account
    await supabase
      .rpc('update_sfd_account_balance', {
        p_sfd_id: loan.sfd_id, 
        p_account_type: 'remboursement',
        p_amount: paymentData.amount
      });
    
    // Calculate next payment date
    const nextPaymentDate = calculateNextPaymentDate(new Date(loan.next_payment_date || new Date()));
    
    // Update loan with last payment date and next payment date
    const { data: updatedLoan, error: updateError } = await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: new Date().toISOString(),
        next_payment_date: nextPaymentDate.toISOString(),
      })
      .eq('id', paymentData.loanId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Error updating loan: ${updateError.message}`);
    }
    
    // Record loan activity
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: paymentData.loanId,
        activity_type: 'payment_received',
        description: `Payment of ${paymentData.amount} FCFA received via ${paymentData.paymentMethod}`,
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        payment,
        nextPaymentDate
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error recording payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetPaymentSchedule(loanId: string, supabase: any) {
  try {
    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('id', loanId)
      .single();
    
    if (loanError) {
      throw new Error(`Error fetching loan: ${loanError.message}`);
    }
    
    // Get already made payments
    const { data: payments, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: true });
    
    if (paymentsError) {
      throw new Error(`Error fetching payments: ${paymentsError.message}`);
    }
    
    // Generate payment schedule
    const schedule = generateAmortizationSchedule(
      loan.amount,
      loan.interest_rate,
      loan.duration_months,
      new Date(loan.disbursed_at || new Date()),
      payments
    );
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        loan,
        payments,
        schedule
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting payment schedule:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCalculateLoan(req: Request, supabase: any) {
  const { amount, interestRate, durationMonths, loanPlanId } = await req.json();
  
  try {
    let effectiveInterestRate = interestRate;
    let effectiveAmount = amount;
    let effectiveDuration = durationMonths;
    
    // If loan plan is provided, get details from the plan
    if (loanPlanId) {
      const { data: loanPlan, error: planError } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('id', loanPlanId)
        .single();
      
      if (planError) {
        throw new Error(`Error fetching loan plan: ${planError.message}`);
      }
      
      effectiveInterestRate = loanPlan.interest_rate;
      effectiveDuration = durationMonths || loanPlan.min_duration;
      
      // Validate amount against plan limits
      if (amount < loanPlan.min_amount || amount > loanPlan.max_amount) {
        return new Response(
          JSON.stringify({ 
            error: `Amount must be between ${loanPlan.min_amount} and ${loanPlan.max_amount} FCFA for this loan plan` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Validate duration against plan limits
      if (effectiveDuration < loanPlan.min_duration || effectiveDuration > loanPlan.max_duration) {
        return new Response(
          JSON.stringify({ 
            error: `Duration must be between ${loanPlan.min_duration} and ${loanPlan.max_duration} months for this loan plan` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(effectiveAmount, effectiveInterestRate, effectiveDuration);
    
    // Generate sample amortization schedule
    const schedule = generateAmortizationSchedule(
      effectiveAmount,
      effectiveInterestRate,
      effectiveDuration,
      new Date()
    );
    
    // Calculate total amount to be repaid
    const totalRepayment = monthlyPayment * effectiveDuration;
    const totalInterest = totalRepayment - effectiveAmount;
    
    return new Response(
      JSON.stringify({
        success: true,
        calculation: {
          principal: effectiveAmount,
          interestRate: effectiveInterestRate,
          durationMonths: effectiveDuration,
          monthlyPayment,
          totalRepayment,
          totalInterest,
        },
        schedule
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating loan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper functions
function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  // Convert annual rate to monthly rate (and from percentage to decimal)
  const monthlyRate = (annualRate / 100) / 12;
  
  // Calculate monthly payment using the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  if (monthlyRate === 0) {
    return principal / months;
  }
  
  const x = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = (principal * monthlyRate * x) / (x - 1);
  
  return Math.round(monthlyPayment);
}

function calculateNextPaymentDate(currentDate: Date): Date {
  const nextDate = new Date(currentDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

function generateAmortizationSchedule(
  principal: number, 
  annualRate: number, 
  months: number, 
  startDate: Date,
  existingPayments: any[] = []
): any[] {
  const monthlyRate = (annualRate / 100) / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  
  let remainingPrincipal = principal;
  const schedule = [];
  
  // Create a map of existing payments by payment date (formatted as YYYY-MM-DD)
  const paymentsByDate = {};
  existingPayments.forEach(payment => {
    const date = new Date(payment.payment_date).toISOString().split('T')[0];
    if (!paymentsByDate[date]) {
      paymentsByDate[date] = 0;
    }
    paymentsByDate[date] += payment.amount;
  });
  
  for (let i = 1; i <= months; i++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    // Calculate the date for this payment
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    const paymentDateStr = paymentDate.toISOString().split('T')[0];
    
    // Check if there's an existing payment for this date
    const actualPayment = paymentsByDate[paymentDateStr] || 0;
    const status = actualPayment >= monthlyPayment ? 'paid' : 
                  actualPayment > 0 ? 'partial' : 
                  new Date() > paymentDate ? 'late' : 'pending';
    
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);
    
    schedule.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString(),
      monthlyPayment,
      principalPayment,
      interestPayment,
      remainingPrincipal,
      actualPayment,
      status
    });
    
    if (remainingPrincipal <= 0) {
      break;
    }
  }
  
  return schedule;
}

async function schedulePaymentReminders(loanId: string, loan: any, supabase: any) {
  try {
    // Get client details to send notifications
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('id, user_id, full_name, email, phone')
      .eq('id', loan.client_id)
      .single();
    
    if (clientError) {
      console.error('Error fetching client data for reminders:', clientError);
      return;
    }
    
    // Calculate payment dates for reminders
    const paymentDates = [];
    let currentDate = new Date(loan.disbursed_at || new Date());
    
    for (let i = 1; i <= loan.duration_months; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      paymentDates.push(new Date(currentDate));
    }
    
    // Store reminder information in the database
    for (let i = 0; i < paymentDates.length; i++) {
      const reminderDate = new Date(paymentDates[i]);
      
      // Set reminder 5 days before payment is due
      reminderDate.setDate(reminderDate.getDate() - 5);
      
      await supabase
        .from('loan_payment_reminders')
        .insert({
          loan_id: loanId,
          client_id: client.id,
          payment_number: i + 1,
          payment_date: paymentDates[i].toISOString(),
          reminder_date: reminderDate.toISOString(),
          amount: loan.monthly_payment,
          is_sent: false,
        });
    }
    
    console.log(`Scheduled ${paymentDates.length} payment reminders for loan #${loanId}`);
  } catch (error) {
    console.error('Error scheduling payment reminders:', error);
  }
}
