
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Récupérer les données d'entrée
    const { requestId, action, adminId, notes } = await req.json()

    if (!requestId || !action || !adminId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Request ID, action, and admin ID are required' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Vérifier que l'action est valide
    if (action !== 'approve' && action !== 'reject') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid action. Must be "approve" or "reject"' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer la demande
    const { data: request, error: fetchError } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) {
      console.error('Error fetching request:', fetchError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Request not found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Vérifier que la demande est en attente
    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Request cannot be ${action}d because it is already ${request.status}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Mettre à jour la demande
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { data: updatedRequest, error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({
        status: newStatus,
        processed_by: adminId,
        processed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating request:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error updating request status' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Si la demande est approuvée, créer un client SFD
    let clientId = null
    if (action === 'approve') {
      try {
        const { data: client, error: clientError } = await supabase
          .from('sfd_clients')
          .insert({
            sfd_id: request.sfd_id,
            full_name: request.full_name,
            email: request.email,
            phone: request.phone,
            address: request.address,
            id_number: request.id_number,
            id_type: request.id_type,
            user_id: request.user_id,
            profession: request.profession,
            monthly_income: request.monthly_income,
            status: 'active',
            validated_by: adminId,
            validated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (clientError) {
          console.error('Error creating client:', clientError)
        } else {
          clientId = client.id

          // Créer un compte pour le client
          const { error: accountError } = await supabase
            .from('sfd_accounts')
            .insert({
              sfd_id: request.sfd_id,
              client_id: clientId,
              account_type: 'savings',
              account_number: `SAV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              balance: 0,
              currency: 'FCFA',
              status: 'active'
            })

          if (accountError) {
            console.error('Error creating account:', accountError)
          }

          // Création du compte utilisateur associé
          const { error: userAccountError } = await supabase
            .from('accounts')
            .insert({
              user_id: request.user_id,
              balance: 0,
              currency: 'FCFA',
              sfd_id: request.sfd_id
            })

          if (userAccountError) {
            console.error('Error creating user account:', userAccountError)
          }
        }
      } catch (error) {
        console.error('Error in client creation process:', error)
      }
    }

    // Envoyer une notification à l'utilisateur
    const notificationTitle = action === 'approve' 
      ? 'Demande d\'adhésion approuvée'
      : 'Demande d\'adhésion rejetée'
      
    const notificationMessage = action === 'approve'
      ? 'Votre demande d\'adhésion a été approuvée. Bienvenue!'
      : `Votre demande d'adhésion a été rejetée${notes ? `: ${notes}` : '.'}`

    const { error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        title: notificationTitle,
        message: notificationMessage,
        type: action === 'approve' ? 'adhesion_approved' : 'adhesion_rejected',
        recipient_id: request.user_id,
        sender_id: adminId,
        created_at: new Date().toISOString()
      })

    if (notifError) {
      console.error('Error creating notification:', notifError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Request ${action}d successfully`,
        status: newStatus,
        clientId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
