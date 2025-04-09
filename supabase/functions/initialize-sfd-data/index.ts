
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the request body
    const { sfdId } = await req.json()
    
    if (!sfdId) {
      return new Response(
        JSON.stringify({ error: 'SFD ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the SFD exists
    const { data: sfdData, error: sfdError } = await supabaseClient
      .from('sfds')
      .select('id')
      .eq('id', sfdId)
      .single()

    if (sfdError) {
      return new Response(
        JSON.stringify({ error: 'SFD not found', details: sfdError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate some test clients
    const clientsToCreate = 15
    const clients = []
    const clientStatuses = ['pending', 'validated', 'rejected']
    const regions = ['Nord', 'Sud', 'Est', 'Ouest', 'Centre']

    for (let i = 0; i < clientsToCreate; i++) {
      const randomStatus = clientStatuses[Math.floor(Math.random() * clientStatuses.length)]
      const randomRegion = regions[Math.floor(Math.random() * regions.length)]
      
      clients.push({
        sfd_id: sfdId,
        full_name: `Client Test ${i + 1}`,
        email: `client${i + 1}@example.com`,
        phone: `+221${Math.floor(Math.random() * 90000000) + 10000000}`,
        address: `Adresse ${i + 1}, ${randomRegion}`,
        status: randomStatus,
        kyc_level: Math.floor(Math.random() * 4),
      })
    }

    // Insert clients
    const { error: clientsError } = await supabaseClient
      .from('sfd_clients')
      .insert(clients)

    if (clientsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create clients', details: clientsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get inserted clients to create loans for them
    const { data: insertedClients, error: fetchClientsError } = await supabaseClient
      .from('sfd_clients')
      .select('id')
      .eq('sfd_id', sfdId)
      .limit(clientsToCreate)

    if (fetchClientsError || !insertedClients) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch created clients', details: fetchClientsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a loan plan for the SFD
    const loanPlan = {
      sfd_id: sfdId,
      name: 'Plan de crédit standard',
      description: 'Plan de crédit pour les clients réguliers',
      min_amount: 50000,
      max_amount: 5000000,
      min_duration: 3,
      max_duration: 36,
      interest_rate: 5.5,
      fees: 1.0,
    }

    const { data: insertedLoanPlan, error: loanPlanError } = await supabaseClient
      .from('sfd_loan_plans')
      .insert(loanPlan)
      .select()
      .single()

    if (loanPlanError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create loan plan', details: loanPlanError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate some loans
    const loans = []
    const loanStatuses = ['pending', 'approved', 'disbursed', 'active', 'completed', 'late']
    const loanPurposes = [
      'Achat équipement agricole',
      'Financement commerce',
      'Extension boutique',
      'Achat stock',
      'Rénovation local'
    ]

    for (let i = 0; i < insertedClients.length; i++) {
      // Not all clients should have loans
      if (Math.random() < 0.7) {
        const randomStatus = loanStatuses[Math.floor(Math.random() * loanStatuses.length)]
        const randomPurpose = loanPurposes[Math.floor(Math.random() * loanPurposes.length)]
        const amount = Math.floor(Math.random() * 4950000) + 50000 // Between 50,000 and 5,000,000
        const durationMonths = Math.floor(Math.random() * 33) + 3 // Between 3 and 36 months
        const interestRate = 5.5
        const monthlyPayment = (amount * (1 + interestRate/100)) / durationMonths
        
        const loan = {
          sfd_id: sfdId,
          client_id: insertedClients[i].id,
          purpose: randomPurpose,
          amount: amount,
          duration_months: durationMonths,
          interest_rate: interestRate,
          monthly_payment: monthlyPayment,
          status: randomStatus,
        }

        loans.push(loan)
      }
    }

    if (loans.length > 0) {
      const { error: loansError } = await supabaseClient
        .from('sfd_loans')
        .insert(loans)

      if (loansError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create loans', details: loansError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create subsidy for the SFD
    const subsidy = {
      sfd_id: sfdId,
      amount: 10000000,
      allocated_by: '00000000-0000-0000-0000-000000000000', // System user
      used_amount: Math.floor(Math.random() * 5000000),
      remaining_amount: 5000000,
      description: 'Subvention initiale',
      status: 'active',
    }

    const { error: subsidyError } = await supabaseClient
      .from('sfd_subsidies')
      .insert(subsidy)

    if (subsidyError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create subsidy', details: subsidyError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create some pending subsidy requests
    const subsidyRequests = [
      {
        sfd_id: sfdId,
        amount: 2500000,
        requested_by: '00000000-0000-0000-0000-000000000000', // System user
        purpose: 'Subvention pour programme agricole',
        justification: 'Pour soutenir les agriculteurs locaux',
        status: 'pending',
        priority: 'high',
      },
      {
        sfd_id: sfdId,
        amount: 1500000,
        requested_by: '00000000-0000-0000-0000-000000000000', // System user
        purpose: 'Subvention pour programme éducatif',
        justification: 'Pour financer des bourses pour étudiants',
        status: 'pending',
        priority: 'normal',
      }
    ]

    const { error: requestsError } = await supabaseClient
      .from('subsidy_requests')
      .insert(subsidyRequests)

    if (requestsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create subsidy requests', details: requestsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update SFD stats
    const stats = {
      sfd_id: sfdId,
      total_clients: clients.length,
      total_loans: loans.length,
      repayment_rate: 85.5, // Random repayment rate
    }

    const { error: statsError } = await supabaseClient
      .from('sfd_stats')
      .upsert(stats, { onConflict: 'sfd_id' })

    if (statsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update SFD stats', details: statsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SFD data initialized successfully',
        data: {
          clients: clients.length,
          loans: loans.length,
          loanPlan: insertedLoanPlan,
          subsidy: subsidy
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
