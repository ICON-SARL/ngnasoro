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
    
    // Validate required fields
    if (!loanData.sfd_id || !loanData.amount || !loanData.duration_months) {
      throw new Error("Missing required loan data");
    }
    
    // Get client_id either from request or look it up using the user's ID
    let clientId = loanData.client_id;
      
      // If no client_id provided but we have a user, find their client record for this SFD
      if (!clientId && user) {
        console.log(`No client_id provided, looking up client record for user ${user.id} in SFD ${loanData.sfd_id}`);
        
        const { data: clientData, error: clientLookupError } = await supabase
          .from("sfd_clients")
          .select("id")
          .eq("user_id", user.id)
          .eq("sfd_id", loanData.sfd_id)
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
      
      // Create loan record using service role to bypass RLS
      const { data: loan, error: loanError } = await supabase
        .from("sfd_loans")
        .insert({
          client_id: clientId,
          sfd_id: loanData.sfd_id,
          amount: loanData.amount,
          duration_months: loanData.duration_months,
          interest_rate: loanData.interest_rate || 0,
          purpose: loanData.purpose || "Non spécifié",
          loan_plan_id: loanData.loan_plan_id || null,
          monthly_payment: loanData.monthly_payment || 0,
          total_amount: loanData.total_amount || loanData.amount,
          remaining_amount: loanData.remaining_amount || loanData.total_amount || loanData.amount,
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
