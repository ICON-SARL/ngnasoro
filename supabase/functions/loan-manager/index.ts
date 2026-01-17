import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with service key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Extract auth token from header (if available)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const authToken = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
      
      if (userError) {
        console.error("Auth error:", userError.message);
      } else {
        user = userData.user;
        console.log("Authenticated user:", user.id);
      }
    } else {
      console.log("No auth header provided, proceeding with anonymous request");
    }
    
    // Parse the request body - expecting direct loan data
    let loanData;
    try {
      loanData = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }
    
    console.log('Received loan data:', JSON.stringify(loanData, null, 2));
    
    // Extract data from nested structure if present
    const data = loanData.data || loanData;
    
    // Validate required fields
    if (!data.sfd_id || !data.amount || !data.duration_months) {
      throw new Error("Missing required loan data");
    }
    
    // Get client_id either from request or look it up using the user's ID
    let clientId = data.client_id;
      
      // If no client_id provided but we have a user, find their client record for this SFD
      if (!clientId && user) {
        console.log(`No client_id provided, looking up client record for user ${user.id} in SFD ${data.sfd_id}`);
        
        const { data: clientData, error: clientLookupError } = await supabase
          .from("sfd_clients")
          .select("id")
          .eq("user_id", user.id)
          .eq("sfd_id", data.sfd_id)
          .maybeSingle();
          
        if (clientLookupError) {
          console.error("Error looking up client:", clientLookupError);
        } else if (clientData) {
          clientId = clientData.id;
          console.log(`Found client ID ${clientId} for user ${user.id}`);
        } else {
          console.error(`No client record found for user ${user.id} in SFD ${data.sfd_id}`);
          return new Response(
            JSON.stringify({ 
              error: "Vous n'êtes pas client de cette SFD. Veuillez d'abord créer un compte client.", 
              code: "NO_CLIENT_RECORD" 
            }),
            { 
              status: 400, 
              headers: { 
                ...corsHeaders,
                "Content-Type": "application/json" 
              }
            }
          );
        }
      }
      
      if (!clientId) {
        throw new Error("Missing client_id and couldn't determine it from user session");
      }
      
      console.log(`Creating loan for client ${clientId}`);
      
      // Calculate next payment date (30 days from now)
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
      
      // Calculate monthly payment if not provided
      const interestRate = data.interest_rate || 0;
      const durationMonths = data.duration_months;
      const amount = data.amount;
      
      let monthlyPayment = data.monthly_payment;
      if (!monthlyPayment || monthlyPayment <= 0) {
        if (interestRate > 0) {
          // Amortized loan calculation
          const monthlyInterestRate = interestRate / 100 / 12;
          monthlyPayment = (amount * monthlyInterestRate * 
            Math.pow(1 + monthlyInterestRate, durationMonths)) / 
            (Math.pow(1 + monthlyInterestRate, durationMonths) - 1);
        } else {
          // Simple division for zero interest
          monthlyPayment = amount / durationMonths;
        }
      }
      
      // Calculate total amount with interest
      const totalAmount = data.total_amount || (amount * (1 + interestRate / 100));
      
      console.log(`Calculated: monthlyPayment=${monthlyPayment}, totalAmount=${totalAmount}`);
      
      // Create loan record using service role to bypass RLS
      const { data: loan, error: loanError } = await supabase
        .from("sfd_loans")
        .insert({
          client_id: clientId,
          sfd_id: data.sfd_id,
          amount: amount,
          duration_months: durationMonths,
          interest_rate: interestRate,
          purpose: data.purpose || "Non spécifié",
          loan_plan_id: data.loan_plan_id || null,
          monthly_payment: Math.round(monthlyPayment * 100) / 100,
          total_amount: Math.round(totalAmount * 100) / 100,
          remaining_amount: Math.round(totalAmount * 100) / 100,
          next_payment_date: nextPaymentDate.toISOString(),
          status: "pending",
        })
        .select()
        .single();
      
      if (loanError) {
        console.error("Error creating loan:", loanError);
        throw new Error(`Error creating loan: ${loanError.message}`);
      }
      
      console.log("Loan created successfully:", loan);
      
      // Create loan activity for audit trail
      const performerId = user?.id || "system";
      await supabase.from("loan_activities").insert({
        loan_id: loan.id,
        activity_type: "application_submitted",
        description: "Demande de prêt soumise",
        performed_by: performerId
      });
      
      return new Response(
        JSON.stringify({ success: true, loan }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    
  } catch (error: any) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
