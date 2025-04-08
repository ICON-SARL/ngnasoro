
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the request body
    const { sfdId } = await req.json();

    if (!sfdId) {
      throw new Error('SFD ID is required');
    }

    console.log(`Fetching dashboard data for SFD ${sfdId}`);

    // Get the first day of the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Run queries in parallel
    const [
      clientsResult,
      newClientsResult,
      activeLoansResult,
      pendingLoansResult,
      subsidyRequestsResult,
      pendingSubsidyRequestsResult,
      sfdInfoResult
    ] = await Promise.all([
      // Total clients count
      supabase.from('sfd_clients')
        .select('id', { count: 'exact' })
        .eq('sfd_id', sfdId),
      
      // New clients this month count
      supabase.from('sfd_clients')
        .select('id', { count: 'exact' })
        .eq('sfd_id', sfdId)
        .gte('created_at', firstDayOfMonth.toISOString()),
      
      // Active loans count
      supabase.from('sfd_loans')
        .select('id', { count: 'exact' })
        .eq('sfd_id', sfdId)
        .in('status', ['active', 'approved']),
      
      // Pending loans count
      supabase.from('sfd_loans')
        .select('id', { count: 'exact' })
        .eq('sfd_id', sfdId)
        .eq('status', 'pending'),
      
      // Total subsidy requests count
      supabase.from('subsidy_requests')
        .select('id', { count: 'exact' })
        .eq('sfd_id', sfdId),
      
      // Pending subsidy requests count
      supabase.from('subsidy_requests')
        .select('id', { count: 'exact' })
        .eq('sfd_id', sfdId)
        .eq('status', 'pending'),
        
      // Get SFD info
      supabase.from('sfds')
        .select('name, region, logo_url, code')
        .eq('id', sfdId)
        .single()
    ]);

    // Handle any errors
    if (clientsResult.error) throw clientsResult.error;
    if (newClientsResult.error) throw newClientsResult.error;
    if (activeLoansResult.error) throw activeLoansResult.error;
    if (pendingLoansResult.error) throw pendingLoansResult.error;
    if (subsidyRequestsResult.error) throw subsidyRequestsResult.error;
    if (pendingSubsidyRequestsResult.error) throw pendingSubsidyRequestsResult.error;
    if (sfdInfoResult.error) throw sfdInfoResult.error;

    // Return the data
    const dashboardData = {
      clients: {
        total: clientsResult.count || 0,
        newThisMonth: newClientsResult.count || 0
      },
      loans: {
        active: activeLoansResult.count || 0,
        pending: pendingLoansResult.count || 0
      },
      subsidyRequests: {
        total: subsidyRequestsResult.count || 0,
        pending: pendingSubsidyRequestsResult.count || 0
      },
      sfdInfo: sfdInfoResult.data
    };

    return new Response(
      JSON.stringify({ success: true, data: dashboardData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get_sfd_dashboard_data:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
