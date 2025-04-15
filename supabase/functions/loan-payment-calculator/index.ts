
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, interestRate, durationMonths, startDate } = await req.json();
    
    if (!amount || !interestRate || !durationMonths) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: amount, interestRate, durationMonths' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths);
    
    // Generate amortization schedule
    const schedule = generateAmortizationSchedule(
      amount,
      interestRate,
      durationMonths,
      startDate ? new Date(startDate) : new Date()
    );
    
    // Calculate total amount to be repaid
    const totalRepayment = monthlyPayment * durationMonths;
    const totalInterest = totalRepayment - amount;
    
    return new Response(
      JSON.stringify({
        success: true,
        calculation: {
          principal: amount,
          interestRate,
          durationMonths,
          monthlyPayment,
          totalRepayment,
          totalInterest,
        },
        schedule
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in loan calculator:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error calculating loan' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

function generateAmortizationSchedule(
  principal: number, 
  annualRate: number, 
  months: number, 
  startDate: Date
): any[] {
  const monthlyRate = (annualRate / 100) / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  
  let remainingPrincipal = principal;
  const schedule = [];
  
  for (let i = 1; i <= months; i++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    // Calculate the date for this payment
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);
    
    schedule.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString(),
      monthlyPayment,
      principalPayment: Math.round(principalPayment),
      interestPayment: Math.round(interestPayment),
      remainingPrincipal: Math.round(remainingPrincipal),
      status: 'pending'
    });
    
    if (remainingPrincipal <= 0) {
      break;
    }
  }
  
  return schedule;
}
