
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Use service role key for privileged access to user's account data
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the request body
    const { userId, period, sfdId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log(`Fetching dashboard data for user ${userId}, period: ${period || 'month'}, sfdId: ${sfdId || 'all'}`)

    // Get the user's information
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    // Get user's account information (with proper balance)
    let accountQuery = supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)

    // If sfdId is provided, filter by it
    if (sfdId) {
      accountQuery = accountQuery.eq('sfd_id', sfdId)
    }
    
    const { data: account, error: accountError } = await accountQuery.single()

    if (accountError) {
      console.error('Error fetching account data:', accountError)
      throw new Error(`Failed to fetch account data: ${accountError.message}`)
    }

    if (!account) {
      console.warn(`No account found for user ${userId}`)
    }

    // Get user's SFD accounts with detailed information
    const { data: userSfds, error: sfdsError } = await supabase
      .from('user_sfds')
      .select(`
        id,
        is_default,
        sfds:sfd_id(id, name, code, region, logo_url)
      `)
      .eq('user_id', userId)

    if (sfdsError) {
      console.error('Error fetching user SFDs:', sfdsError)
    }

    // Get actual SFD account balances for accurate display
    const { data: sfdAccounts, error: sfdAccountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)

    if (sfdAccountsError) {
      console.error('Error fetching SFD account balances:', sfdAccountsError)
    }

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    // Calculate financial summary data
    let financialSummary = {
      income: 0,
      expenses: 0,
      savings: 0,
      sfdCount: userSfds?.length || 0,
    }

    // Process transactions to calculate income and expenses
    if (transactions && transactions.length > 0) {
      transactions.forEach(tx => {
        if (tx.amount > 0 || tx.type === 'deposit' || tx.type === 'loan_disbursement') {
          financialSummary.income += Number(Math.abs(tx.amount))
        } else {
          financialSummary.expenses += Math.abs(Number(tx.amount))
        }
      })
      
      // Calculate savings
      financialSummary.savings = financialSummary.income - financialSummary.expenses
    }

    // Get the loan information if available
    const { data: loans, error: loansError } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('client_id', userId)
      .order('next_payment_date', { ascending: true })
      .limit(1)

    if (loansError) {
      console.error('Error fetching loans:', loansError)
    }

    // Enhance SFD accounts with proper names from userSfds
    const enhancedSfdAccounts = sfdAccounts?.map(account => {
      const userSfd = userSfds?.find(us => us.sfds?.id === account.sfd_id);
      return {
        ...account,
        name: userSfd?.sfds?.name || 'SFD',
        logo_url: userSfd?.sfds?.logo_url,
      };
    }) || [];

    // Prepare the dashboard data with accurate balances
    const dashboardData = {
      profile: userProfile || {},
      account: account || { balance: 0, currency: 'FCFA' },
      sfdAccounts: enhancedSfdAccounts,
      transactions: transactions || [],
      financialSummary,
      nearestLoan: loans && loans.length > 0 ? loans[0] : null,
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: dashboardData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
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
