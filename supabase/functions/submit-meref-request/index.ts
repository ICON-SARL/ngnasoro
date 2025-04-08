
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  try {
    // Récupérer les variables d'environnement de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
      throw new Error('Supabase environment variables are not set')
    }

    // Créer un client Supabase avec la clé de rôle de service pour les opérations privilégiées
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Récupérer les données de la requête
    const requestData = await req.json()
    const { requestId } = requestData

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Missing required requestId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Récupérer les détails complets de la demande
    const { data: loanRequest, error: fetchError } = await supabase
      .from('meref_loan_requests')
      .select(`
        *,
        sfd_clients (id, full_name, email, phone, id_number, id_type),
        meref_request_documents (*)
      `)
      .eq('id', requestId)
      .single()

    if (fetchError || !loanRequest) {
      return new Response(JSON.stringify({ error: `Failed to fetch request: ${fetchError?.message}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Récupérer les paramètres de configuration MEREF
    const { data: merefSettings, error: settingsError } = await supabase
      .from('meref_settings')
      .select('*')
      .limit(1)
      .single()

    if (settingsError) {
      console.error('Error fetching MEREF settings:', settingsError)
    }

    const apiEndpoint = merefSettings?.api_endpoint || 'https://api.meref.example.org/v1'
    const apiKey = merefSettings?.api_key || 'default_api_key'

    console.log('Preparing to submit request to MEREF:', { requestId, apiEndpoint })

    // Préparer les données à envoyer au MEREF (dans un format compatible)
    const merefPayload = {
      request_id: loanRequest.id,
      sfd_id: loanRequest.sfd_id,
      client_info: {
        name: loanRequest.sfd_clients?.full_name,
        id_number: loanRequest.sfd_clients?.id_number,
        id_type: loanRequest.sfd_clients?.id_type,
        contact: {
          email: loanRequest.sfd_clients?.email,
          phone: loanRequest.sfd_clients?.phone
        }
      },
      loan_details: {
        amount: loanRequest.amount,
        duration_months: loanRequest.duration_months,
        purpose: loanRequest.purpose,
        guarantees: loanRequest.guarantees,
        monthly_income: loanRequest.monthly_income
      },
      documents: loanRequest.meref_request_documents?.map((doc: any) => ({
        type: doc.document_type,
        url: doc.document_url,
        verified: doc.verified
      })),
      risk_score: loanRequest.risk_score || calcRiskScore(loanRequest)
    }

    // SIMULATION: Dans un environnement réel, nous ferions un appel à l'API MEREF ici
    // Mais pour cette démonstration, nous simulons la réponse
    console.log('Simulating MEREF API call with payload:', JSON.stringify(merefPayload))

    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Générer une référence MEREF simulée
    const merefReference = `MEREF-${Date.now().toString().substring(7)}-${Math.floor(Math.random() * 1000)}`

    // Mettre à jour la demande dans la base de données avec les informations du MEREF
    const { data: updatedRequest, error: updateError } = await supabase
      .from('meref_loan_requests')
      .update({
        status: 'meref_submitted',
        meref_status: 'pending',
        meref_reference: merefReference,
        meref_submitted_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      return new Response(JSON.stringify({ error: `Failed to update request: ${updateError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Enregistrer l'activité de soumission
    await supabase
      .from('meref_request_activities')
      .insert({
        request_id: requestId,
        activity_type: 'submit_to_meref',
        description: 'Demande soumise au MEREF',
        details: { meref_reference: merefReference }
      })

    return new Response(JSON.stringify({
      success: true,
      message: 'Demande soumise avec succès au MEREF',
      data: {
        request_id: requestId,
        meref_reference: merefReference,
        status: 'pending',
        submitted_at: updatedRequest.meref_submitted_at
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (error) {
    console.error('Error processing MEREF submission:', error)

    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})

// Fonction utilitaire pour calculer un score de risque simple
function calcRiskScore(loanRequest: any): number {
  let score = 70 // Score de base

  // Ajuster le score en fonction du montant (plus le montant est élevé, plus le risque est grand)
  if (loanRequest.amount > 5000000) score -= 15
  else if (loanRequest.amount > 1000000) score -= 5
  else score += 5

  // Ajuster le score en fonction de la durée (plus longue = plus risquée)
  if (loanRequest.duration_months > 36) score -= 10
  else if (loanRequest.duration_months > 24) score -= 5
  else if (loanRequest.duration_months <= 6) score += 5

  // Ajuster le score en fonction du revenu
  if (loanRequest.monthly_income) {
    const debtIncomeRatio = loanRequest.amount / (loanRequest.monthly_income * loanRequest.duration_months)
    if (debtIncomeRatio > 0.5) score -= 15
    else if (debtIncomeRatio > 0.3) score -= 5
    else score += 10
  }

  // S'assurer que le score est dans la plage 0-100
  return Math.max(0, Math.min(100, score))
}
