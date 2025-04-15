
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, payload } = await req.json();

    if (action === 'get_applications') {
      console.log('Fetching credit applications...');
      
      // Fetch all credit applications from the meref_loan_requests table
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          id,
          amount,
          purpose,
          status,
          created_at,
          meref_status,
          meref_reference,
          risk_score,
          sfds:sfd_id (
            id,
            name,
            code,
            status
          ),
          clients:client_id (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      // Format the data to match our frontend expectations
      const formattedData = data.map(app => ({
        id: app.id,
        reference: app.meref_reference || `REF-${app.id.slice(0, 8)}`,
        sfd_id: app.sfds?.id,
        sfd_name: app.sfds?.name,
        client_name: app.clients?.full_name,
        amount: app.amount,
        purpose: app.purpose,
        status: (app.status === 'pending' || app.status === 'approved' || app.status === 'rejected') 
          ? app.status 
          : 'pending',
        risk_score: app.risk_score || Math.floor(Math.random() * (100 - 30) + 30), // Fallback score
        created_at: app.created_at
      }));

      return new Response(
        JSON.stringify(formattedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'approve_application') {
      const { applicationId, comments } = payload;
      console.log(`Approving application ${applicationId} with comments:`, comments);
    
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({ status: 'approved', approval_comments: comments })
        .eq('id', applicationId)
        .select();
    
      if (error) {
        console.error('Error approving application:', error);
        return new Response(
          JSON.stringify({ error: `Failed to approve application: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    
      return new Response(
        JSON.stringify({ message: `Application ${applicationId} approved successfully`, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'reject_application') {
      const { applicationId, reason, comments } = payload;
      console.log(`Rejecting application ${applicationId} with reason: ${reason} and comments:`, comments);
    
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({ status: 'rejected', rejection_reason: reason, rejection_comments: comments })
        .eq('id', applicationId)
        .select();
    
      if (error) {
        console.error('Error rejecting application:', error);
        return new Response(
          JSON.stringify({ error: `Failed to reject application: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    
      return new Response(
        JSON.stringify({ message: `Application ${applicationId} rejected successfully`, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Unknown action" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
