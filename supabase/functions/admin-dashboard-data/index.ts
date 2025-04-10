
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the request body params
    const { timeframe } = await req.json()
    const period = timeframe || 'month'

    const now = new Date()
    let startDate: Date

    // Calculate start date based on period
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    const startDateStr = startDate.toISOString()

    // Get active SFDs count
    const { count: activeSfdsCount, error: sfdsError } = await supabase
      .from('sfds')
      .select('id', { count: 'exact' })
      .eq('status', 'active')

    if (sfdsError) throw sfdsError

    // Get new SFDs this period
    const { count: newSfdsCount, error: newSfdsError } = await supabase
      .from('sfds')
      .select('id', { count: 'exact' })
      .eq('status', 'active')
      .gte('created_at', startDateStr)

    if (newSfdsError) throw newSfdsError

    // Get admin users count
    const { count: adminsCount, error: adminsError } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin')

    if (adminsError) throw adminsError

    // Get new admin users this period
    const { count: newAdminsCount, error: newAdminsError } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin')
      .gte('created_at', startDateStr)

    if (newAdminsError) throw newAdminsError

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })

    if (usersError) throw usersError

    // Get new users this period
    const { count: newUsersCount, error: newUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('updated_at', startDateStr)

    if (newUsersError) throw newUsersError

    // Get all active subsidies
    const { data: subsidiesData, error: subsidiesError } = await supabase
      .from('sfd_subsidies')
      .select('*')
      .eq('status', 'active')

    if (subsidiesError) throw subsidiesError

    // Get new subsidies this period
    const { data: newSubsidiesData, error: newSubsidiesError } = await supabase
      .from('sfd_subsidies')
      .select('*')
      .eq('status', 'active')
      .gte('allocated_at', startDateStr)

    if (newSubsidiesError) throw newSubsidiesError

    // Calculate total subsidies amount
    const totalSubsidiesAmount = subsidiesData.reduce((sum, subsidy) => 
      sum + Number(subsidy.amount), 0)
    
    const newSubsidiesAmount = newSubsidiesData.reduce((sum, subsidy) => 
      sum + Number(subsidy.amount), 0)

    // Get used subsidies amount  
    const usedSubsidiesAmount = subsidiesData.reduce((sum, subsidy) => 
      sum + Number(subsidy.used_amount), 0)

    // Calculate available subsidies amount
    const availableSubsidiesAmount = totalSubsidiesAmount - usedSubsidiesAmount

    // Get usage percentage
    const usagePercentage = totalSubsidiesAmount > 0 
      ? Math.round((usedSubsidiesAmount / totalSubsidiesAmount) * 100) 
      : 0

    // Get pending subsidy requests
    const { data: pendingRequests, error: pendingRequestsError } = await supabase
      .from('subsidy_requests')
      .select('*, sfds:sfd_id(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (pendingRequestsError) throw pendingRequestsError

    // Get recent approved loan requests
    const { data: recentApprovals, error: approvalsError } = await supabase
      .from('meref_loan_requests')
      .select('*, sfds:sfd_id(name)')
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(5)

    if (approvalsError) throw approvalsError

    // Format the dashboard data
    const dashboardData = {
      stats: {
        activeSfds: activeSfdsCount,
        newSfdsThisMonth: newSfdsCount,
        admins: adminsCount,
        newAdminsThisMonth: newAdminsCount,
        totalUsers: usersCount || 0,
        newUsersThisMonth: newUsersCount || 0,
      },
      subsidies: {
        totalAmount: totalSubsidiesAmount,
        allocatedAmount: totalSubsidiesAmount,
        usedAmount: usedSubsidiesAmount,
        availableAmount: availableSubsidiesAmount,
        usagePercentage: usagePercentage,
        newThisMonth: formatAmountInMillions(newSubsidiesAmount),
      },
      pendingRequests: pendingRequests.map(req => ({
        id: req.id,
        sfd_name: req.sfds?.name || 'SFD',
        amount: Number(req.amount),
        purpose: req.purpose,
        priority: req.priority,
        created_at: req.created_at,
      })),
      recentApprovals: recentApprovals.map(approval => ({
        id: approval.id,
        sfd_name: approval.sfds?.name || 'SFD',
        amount: Number(approval.amount),
        approved_at: approval.approved_at,
      }))
    }

    return new Response(
      JSON.stringify({ success: true, data: dashboardData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error handling request:', error)
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Helper function to format amount in millions
function formatAmountInMillions(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
}
