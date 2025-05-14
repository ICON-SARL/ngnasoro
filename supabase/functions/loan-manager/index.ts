
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

interface RequestBody {
  action: string;
  data: any;
}

// Initialize Supabase client with environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function handleCreateLoan(supabase: SupabaseClient, requestData: any) {
  console.log("Creating loan record in database...");
  
  try {
    // Extract data from the request
    const { 
      client_id, 
      sfd_id, 
      amount, 
      duration_months, 
      purpose, 
      loan_plan_id, 
      user_id // This is an additional field to help with client association
    } = requestData;
    
    // If client_id is missing but user_id is provided, try to find or create a client record
    let effectiveClientId = client_id;
    
    if (!effectiveClientId && user_id) {
      console.log("No client_id provided, but user_id is present. Looking up client by user_id...");
      
      // Look up client by user_id
      const { data: clientData, error: clientLookupError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user_id)
        .eq('sfd_id', sfd_id)
        .single();
      
      if (clientLookupError || !clientData) {
        console.log("No existing client found for user_id", user_id, "Creating temporary client record...");
        
        // Get user info
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', user_id)
          .single();
          
        if (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error("Impossible de récupérer les informations utilisateur");
        }
        
        // Create a new client record
        const { data: newClient, error: clientCreateError } = await supabase
          .from('sfd_clients')
          .insert({
            user_id: user_id,
            sfd_id: sfd_id,
            full_name: userData?.full_name || "Client",
            email: userData?.email || "",
            phone: userData?.phone || "",
            status: 'active'
          })
          .select()
          .single();
          
        if (clientCreateError) {
          console.error("Error creating client:", clientCreateError);
          throw new Error("Impossible de créer un enregistrement client");
        }
        
        effectiveClientId = newClient.id;
        console.log("Created new client with ID:", effectiveClientId);
      } else {
        effectiveClientId = clientData.id;
        console.log("Found existing client with ID:", effectiveClientId);
      }
    }
    
    if (!effectiveClientId) {
      throw new Error("Un identifiant client est nécessaire pour créer un prêt");
    }
    
    // Get interest rate from loan plan if provided
    let interestRate = requestData.interest_rate;
    if (loan_plan_id && !interestRate) {
      const { data: planData, error: planError } = await supabase
        .from('sfd_loan_plans')
        .select('interest_rate')
        .eq('id', loan_plan_id)
        .single();
        
      if (!planError && planData) {
        interestRate = planData.interest_rate;
      } else {
        interestRate = 5.0; // Default interest rate
      }
    }
    
    // Calculate monthly payment if needed
    let monthlyPayment = requestData.monthly_payment;
    if (!monthlyPayment && amount && duration_months && interestRate) {
      // Simple monthly payment calculation
      const monthlyInterestRate = interestRate / 100 / 12;
      monthlyPayment = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, duration_months)) / 
                       (Math.pow(1 + monthlyInterestRate, duration_months) - 1);
      monthlyPayment = Math.round(monthlyPayment); // Round to whole number
    }
    
    // Create the loan record
    const { data: loan, error } = await supabase
      .from('sfd_loans')
      .insert({
        client_id: effectiveClientId,
        sfd_id,
        amount,
        duration_months,
        purpose,
        interest_rate: interestRate || 5.0,
        monthly_payment: monthlyPayment || 0,
        status: 'pending',
        loan_plan_id
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating loan:", error);
      throw new Error(`Erreur lors de la création du prêt: ${error.message}`);
    }
    
    console.log("Loan created successfully:", loan);
    
    // Create a notification for the SFD
    try {
      await supabase
        .from('admin_notifications')
        .insert({
          title: "Nouvelle demande de prêt",
          message: `Une nouvelle demande de prêt de ${amount.toLocaleString()} FCFA a été soumise`,
          type: "loan_request",
          recipient_role: "sfd_admin",
          action_link: `/sfd-loans/${loan.id}`,
          sender_id: user_id || effectiveClientId
        });
    } catch (notifError) {
      console.error("Error creating notification (non-critical):", notifError);
    }
    
    return loan;
  } catch (error) {
    console.error("Error in handleCreateLoan:", error);
    throw error;
  }
}

async function handleApproveLoan(supabase: SupabaseClient, loanId: string) {
  try {
    // Get current user ID for auditing
    const authHeader = Deno.env.get('HTTP_AUTHORIZATION') || '';
    let userId = 'system';
    
    if (authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          userId = user.id;
        }
      } catch (e) {
        console.error("Error getting user:", e);
      }
    }
    
    // Update loan status
    const { data: updatedLoan, error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
        processed_by: userId,
        processed_at: new Date().toISOString()
      })
      .eq('id', loanId)
      .select('*, sfd_clients(user_id)')
      .single();
      
    if (error) {
      console.error("Error approving loan:", error);
      throw new Error(`Erreur lors de l'approbation du prêt: ${error.message}`);
    }
    
    // Create a notification for the client
    try {
      if (updatedLoan?.sfd_clients?.user_id) {
        await supabase
          .from('admin_notifications')
          .insert({
            title: "Prêt approuvé",
            message: `Votre demande de prêt de ${updatedLoan.amount.toLocaleString()} FCFA a été approuvée`,
            type: "loan_approved",
            recipient_id: updatedLoan.sfd_clients.user_id,
            action_link: `/mobile-flow/loan-details/${loanId}`,
            sender_id: userId
          });
      }
    } catch (notifError) {
      console.error("Error creating notification (non-critical):", notifError);
    }
    
    return updatedLoan;
  } catch (error) {
    console.error("Error in handleApproveLoan:", error);
    throw error;
  }
}

async function handleRejectLoan(supabase: SupabaseClient, loanId: string, reason?: string) {
  try {
    // Get current user ID for auditing
    const authHeader = Deno.env.get('HTTP_AUTHORIZATION') || '';
    let userId = 'system';
    
    if (authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          userId = user.id;
        }
      } catch (e) {
        console.error("Error getting user:", e);
      }
    }
    
    // Update loan status
    const { data: updatedLoan, error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || 'Demande refusée par la SFD',
        processed_by: userId,
        processed_at: new Date().toISOString()
      })
      .eq('id', loanId)
      .select('*, sfd_clients(user_id)')
      .single();
      
    if (error) {
      console.error("Error rejecting loan:", error);
      throw new Error(`Erreur lors du rejet du prêt: ${error.message}`);
    }
    
    // Create a notification for the client
    try {
      if (updatedLoan?.sfd_clients?.user_id) {
        await supabase
          .from('admin_notifications')
          .insert({
            title: "Prêt refusé",
            message: `Votre demande de prêt a été refusée${reason ? `: ${reason}` : ''}`,
            type: "loan_rejected",
            recipient_id: updatedLoan.sfd_clients.user_id,
            action_link: `/mobile-flow/loan-details/${loanId}`,
            sender_id: userId
          });
      }
    } catch (notifError) {
      console.error("Error creating notification (non-critical):", notifError);
    }
    
    return updatedLoan;
  } catch (error) {
    console.error("Error in handleRejectLoan:", error);
    throw error;
  }
}

async function handleDisburseLoan(supabase: SupabaseClient, loanId: string) {
  try {
    // Get current user ID for auditing
    const authHeader = Deno.env.get('HTTP_AUTHORIZATION') || '';
    let userId = 'system';
    
    if (authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          userId = user.id;
        }
      } catch (e) {
        console.error("Error getting user:", e);
      }
    }
    
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Update loan status
    const { data: updatedLoan, error } = await supabase
      .from('sfd_loans')
      .update({ 
        status: 'active',
        disbursement_status: 'completed',
        disbursed_at: now.toISOString(),
        disbursement_date: now.toISOString(),
        next_payment_date: nextMonth.toISOString(),
        disbursement_reference: `DISB-${Date.now()}`
      })
      .eq('id', loanId)
      .select('*, sfd_clients(user_id)')
      .single();
      
    if (error) {
      console.error("Error disbursing loan:", error);
      throw new Error(`Erreur lors du décaissement du prêt: ${error.message}`);
    }
    
    // Create a notification for the client
    try {
      if (updatedLoan?.sfd_clients?.user_id) {
        await supabase
          .from('admin_notifications')
          .insert({
            title: "Prêt décaissé",
            message: `Votre prêt de ${updatedLoan.amount.toLocaleString()} FCFA a été décaissé`,
            type: "loan_disbursed",
            recipient_id: updatedLoan.sfd_clients.user_id,
            action_link: `/mobile-flow/loan-details/${loanId}`,
            sender_id: userId
          });
      }
    } catch (notifError) {
      console.error("Error creating notification (non-critical):", notifError);
    }
    
    return updatedLoan;
  } catch (error) {
    console.error("Error in handleDisburseLoan:", error);
    throw error;
  }
}

async function handleRecordPayment(supabase: SupabaseClient, loanId: string, amount: number, paymentMethod: string) {
  try {
    // Record the payment
    const { data: payment, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        payment_date: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error recording payment:", error);
      throw new Error(`Erreur lors de l'enregistrement du paiement: ${error.message}`);
    }
    
    // Update the loan with the last payment date and calculate next payment date
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    await supabase
      .from('sfd_loans')
      .update({
        last_payment_date: now.toISOString(),
        next_payment_date: nextMonth.toISOString()
      })
      .eq('id', loanId);
    
    return payment;
  } catch (error) {
    console.error("Error in handleRecordPayment:", error);
    throw error;
  }
}

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authenticated user if available
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          userId = user.id;
          console.log("Authenticated user:", userId);
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
    }
    
    // Parse request body
    const requestJson: RequestBody = await req.json();
    const { action, data } = requestJson;
    
    console.log("Processing", action, "action with data:", data);
    
    let result;
    
    // Process the request based on the action
    switch (action) {
      case 'create_loan':
        result = await handleCreateLoan(supabase, data);
        break;
        
      case 'approve_loan':
        result = await handleApproveLoan(supabase, data);
        break;
        
      case 'reject_loan':
        result = await handleRejectLoan(supabase, data.loanId, data.reason);
        break;
        
      case 'disburse_loan':
        result = await handleDisburseLoan(supabase, data);
        break;
        
      case 'record_payment':
        result = await handleRecordPayment(supabase, data.loanId, data.amount, data.paymentMethod);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
