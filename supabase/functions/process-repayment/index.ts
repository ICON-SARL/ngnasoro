
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RepaymentRequest {
  loan_id: string;
  amount: number;
  method: 'mobile_money' | 'agency_qr';
}

// Validation functions
const validateRepayment = (data: RepaymentRequest) => {
  const { loan_id, amount, method } = data;
  
  if (!loan_id) {
    throw new Error("ID du prêt requis");
  }
  
  if (!amount || amount <= 0) {
    throw new Error("Montant invalide");
  }
  
  if (!method || !['mobile_money', 'agency_qr'].includes(method)) {
    throw new Error("Méthode de paiement invalide");
  }
  
  return true;
};

// Mobile money payment processing
const processMobileMoneyPayment = async (phoneNumber: string, amount: number) => {
  console.log(`Processing mobile money payment for ${phoneNumber} of amount ${amount}`);
  
  // Simulating mobile money API call
  if (Math.random() > 0.9) {
    throw new Error("Échec du traitement Mobile Money. Veuillez réessayer.");
  }
  
  // Simulate SMS confirmation
  console.log(`SMS confirmation sent to ${phoneNumber}`);
  
  return { 
    transaction_id: `MM-${Date.now()}`,
    status: "completed"
  };
};

// Process agency QR code payment
const processAgencyQRPayment = async (loanId: string, amount: number) => {
  console.log(`Generating QR code for loan ${loanId}`);
  
  // In a real implementation, we'd generate a secure QR code with encrypted data
  const qrData = {
    loan_id: loanId,
    amount: amount,
    nonce: crypto.randomUUID(),
    expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };
  
  return {
    qr_data: qrData,
    status: "pending",
    expiry: qrData.expiry
  };
};

// Update loan balance
const updateLoanBalance = async (supabase: any, loanId: string, amount: number) => {
  console.log(`Updating loan balance for loan ${loanId} with amount ${amount}`);
  
  // In a real implementation, we'd update the loan balance in the database
  // For now, just log the operation
  return {
    previous_balance: 28900,
    new_balance: 28900 - amount,
    payment_recorded: true
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { loan_id, amount, method } = await req.json() as RepaymentRequest;
    
    // Validate repayment data
    validateRepayment({ loan_id, amount, method });
    
    let paymentResult;
    
    // Process payment based on method
    if (method === 'mobile_money') {
      // In a real implementation, we'd get the phone number from authenticated user
      const phoneNumber = "+2237XXXXXXXX";
      paymentResult = await processMobileMoneyPayment(phoneNumber, amount);
      
      // Update loan balance after successful mobile money payment
      await updateLoanBalance(supabase, loan_id, amount);
    } else {
      // Agency QR code payment
      paymentResult = await processAgencyQRPayment(loan_id, amount);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Paiement ${method === 'mobile_money' ? 'traité' : 'initié'} avec succès`,
        data: paymentResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing repayment:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Une erreur est survenue lors du traitement",
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})
