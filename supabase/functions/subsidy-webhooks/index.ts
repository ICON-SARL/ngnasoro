
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

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

interface SubsidyApprovalWebhook {
  requestId: string;
  status: 'approved' | 'rejected';
  reviewedBy: string;
  comments?: string;
}

const handleSubsidyApproval = async (req: Request) => {
  try {
    console.log('Processing subsidy approval webhook');
    const webhook = await req.json() as SubsidyApprovalWebhook;
    
    if (!webhook.requestId || !webhook.status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Get the subsidy request details
    const { data: subsidyRequest, error: subsidyError } = await supabaseAdmin
      .from('subsidy_requests')
      .select(`
        id, 
        amount, 
        sfd_id,
        status
      `)
      .eq('id', webhook.requestId)
      .single();
      
    if (subsidyError || !subsidyRequest) {
      console.error('Error fetching subsidy request:', subsidyError);
      return new Response(
        JSON.stringify({ error: 'Subsidy request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // If already processed, avoid duplicate processing
    if (subsidyRequest.status === webhook.status) {
      return new Response(
        JSON.stringify({ message: 'Subsidy request already processed', status: webhook.status }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Start a transaction to ensure atomicity
    if (webhook.status === 'approved') {
      // 1. Update subsidy request status
      const { error: updateError } = await supabaseAdmin
        .from('subsidy_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: webhook.reviewedBy,
          decision_comments: webhook.comments
        })
        .eq('id', webhook.requestId);
        
      if (updateError) {
        console.error('Error updating subsidy request:', updateError);
        throw updateError;
      }
      
      // 2. Create a new subsidy allocation in sfd_subsidies
      const { data: newSubsidy, error: subsidyCreateError } = await supabaseAdmin
        .from('sfd_subsidies')
        .insert({
          sfd_id: subsidyRequest.sfd_id,
          amount: subsidyRequest.amount,
          remaining_amount: subsidyRequest.amount,
          allocated_by: webhook.reviewedBy,
          description: `Subsidy allocated from request ${webhook.requestId}`,
          status: 'active'
        })
        .select()
        .single();
        
      if (subsidyCreateError) {
        console.error('Error creating subsidy allocation:', subsidyCreateError);
        throw subsidyCreateError;
      }
      
      // 3. Log activity in subsidy_request_activities
      await supabaseAdmin
        .from('subsidy_request_activities')
        .insert({
          request_id: webhook.requestId,
          activity_type: 'request_approved',
          performed_by: webhook.reviewedBy,
          description: 'Subsidy request approved',
          details: {
            status: 'approved',
            subsidy_id: newSubsidy.id,
            amount: subsidyRequest.amount,
            comments: webhook.comments
          }
        });
      
      // 4. Also create activity in subsidy_activities for the new subsidy
      await supabaseAdmin
        .from('subsidy_activities')
        .insert({
          subsidy_id: newSubsidy.id,
          activity_type: 'subsidy_created',
          performed_by: webhook.reviewedBy,
          description: `Subsidy of ${subsidyRequest.amount} FCFA created from request ${webhook.requestId}`
        });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subsidy approved and allocated successfully',
          subsidy: newSubsidy
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } else if (webhook.status === 'rejected') {
      // Handle rejection - just update status
      const { error: updateError } = await supabaseAdmin
        .from('subsidy_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: webhook.reviewedBy,
          decision_comments: webhook.comments
        })
        .eq('id', webhook.requestId);
        
      if (updateError) {
        console.error('Error updating subsidy request:', updateError);
        throw updateError;
      }
      
      // Log activity
      await supabaseAdmin
        .from('subsidy_request_activities')
        .insert({
          request_id: webhook.requestId,
          activity_type: 'request_rejected',
          performed_by: webhook.reviewedBy,
          description: 'Subsidy request rejected',
          details: {
            status: 'rejected',
            comments: webhook.comments
          }
        });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subsidy request rejected successfully'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid status' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error processing subsidy webhook:', error);
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
    return handleSubsidyApproval(req);
  }
  
  // Default response for unsupported methods
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
});
