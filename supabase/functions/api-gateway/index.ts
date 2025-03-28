
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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sfd-id, x-sfd-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Verify the JWT token and extract user information
const verifyToken = async (token: string) => {
  if (!token) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

// Check if user has access to SFD
const hasAccessToSfd = async (userId: string, sfdId: string) => {
  try {
    // Check if user has explicit access to this SFD
    const { data, error } = await supabase
      .from('user_sfds')
      .select('id')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();
      
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking SFD access:', error);
    return false;
  }
};

// Get SFD summary statistics
const getSfdSummary = async (sfdId: string) => {
  try {
    // Get SFD basic info
    const { data: sfd, error: sfdError } = await supabaseAdmin
      .from('sfds')
      .select('id, name, code, region, status')
      .eq('id', sfdId)
      .single();
      
    if (sfdError) throw sfdError;
    
    // Get count of clients
    const { count: clientCount, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('id', { count: 'exact', head: true })
      .eq('sfd_id', sfdId);
      
    if (clientError) throw clientError;
    
    // Get count and sum of active loans
    const { data: loanStats, error: loanError } = await supabaseAdmin
      .rpc('get_sfd_loan_stats', { p_sfd_id: sfdId });
      
    if (loanError) {
      // Fallback if RPC not available
      const { data: loans, error: fallbackError } = await supabaseAdmin
        .from('sfd_loans')
        .select('id, amount, status')
        .eq('sfd_id', sfdId);
        
      if (fallbackError) throw fallbackError;
      
      const activeLoans = loans.filter(loan => loan.status === 'active');
      const totalActiveAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
      
      return {
        ...sfd,
        client_count: clientCount || 0,
        active_loans_count: activeLoans.length,
        total_active_loan_amount: totalActiveAmount,
        pending_loans_count: loans.filter(loan => loan.status === 'pending').length
      };
    }
    
    // Get subsidy information
    const { data: subsidies, error: subsidyError } = await supabaseAdmin
      .from('sfd_subsidies')
      .select('id, amount, used_amount, remaining_amount')
      .eq('sfd_id', sfdId)
      .eq('status', 'active');
      
    if (subsidyError) throw subsidyError;
    
    const totalSubsidies = subsidies.reduce((sum, subsidy) => sum + subsidy.amount, 0);
    const remainingSubsidies = subsidies.reduce((sum, subsidy) => sum + subsidy.remaining_amount, 0);
    
    return {
      ...sfd,
      client_count: clientCount || 0,
      ...(loanStats ? loanStats : {}),
      total_subsidies: totalSubsidies,
      remaining_subsidies: remainingSubsidies,
      active_subsidies_count: subsidies.length
    };
  } catch (error) {
    console.error('Error getting SFD summary:', error);
    throw error;
  }
};

// SUBSIDY WEBHOOK HANDLER
// Handle subsidy approval webhook
const handleSubsidyApproval = async (req: Request) => {
  try {
    console.log('Processing subsidy approval webhook');
    
    const webhook = await req.json();
    
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

// Handler for GET /api/sfds/:id/summary
const handleSfdSummary = async (req: Request, sfdId: string, userId: string) => {
  try {
    // Verify user has access to this SFD
    const hasAccess = await hasAccessToSfd(userId, sfdId);
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this SFD' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    const summary = await getSfdSummary(sfdId);
    
    return new Response(
      JSON.stringify({ data: summary }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error handling SFD summary request:', error);
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
  
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Handle subsidy webhook - consolidated from subsidy-webhooks function
  if (req.method === 'POST' && pathParts[0] === 'subsidy-webhooks') {
    return handleSubsidyApproval(req);
  }
  
  // For other endpoints, extract token and verify user
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || '';
  const user = await verifyToken(token);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  // Route the request based on path
  if (pathParts[0] === 'api' && pathParts[1] === 'sfds' && pathParts[3] === 'summary') {
    const sfdId = pathParts[2];
    return handleSfdSummary(req, sfdId, user.id);
  }
  
  // Default response for unsupported paths
  return new Response(
    JSON.stringify({ error: 'Endpoint not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
});
