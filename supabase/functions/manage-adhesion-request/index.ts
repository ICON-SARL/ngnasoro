
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

    // Valider l'action
    if (action !== 'approve' && action !== 'reject') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Action must be either "approve" or "reject"' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Créer un client Supabase avec la clé d'API
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier que l'administrateur a les bonnes permissions
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminId)

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to verify admin permissions' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const isAdmin = adminRoles?.some(r => r.role === 'admin')
    const isSfdAdmin = adminRoles?.some(r => r.role === 'sfd_admin')

    if (!isAdmin && !isSfdAdmin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Only admins can manage adhesion requests' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Récupérer la demande d'adhésion
    const { data: request, error: requestError } = await supabase
      .from('client_adhesion_requests')
      .select('*, sfds:sfd_id(name)')
      .eq('id', requestId)
      .single()

    if (requestError) {
      console.error('Error fetching adhesion request:', requestError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to fetch adhesion request' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Vérifier que la demande n'a pas déjà été traitée
    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'This request has already been processed' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Si c'est un admin SFD, vérifier qu'il a accès à cette SFD
    if (isSfdAdmin && !isAdmin) {
      const { data: adminSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', adminId)
        .eq('sfd_id', request.sfd_id)

      if (sfdsError) {
        console.error('Error checking admin SFD access:', sfdsError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Failed to verify SFD access' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      if (!adminSfds || adminSfds.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Unauthorized: You do not have access to this SFD' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    // Mettre à jour le statut de la demande
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      processed_by: adminId,
      processed_at: new Date().toISOString(),
      notes: notes || null,
      rejection_reason: action === 'reject' ? notes : null
    }

    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update(updateData)
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating adhesion request:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to update adhesion request' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    let clientId = null;

    // Si la demande est approuvée, créer un client SFD et un compte
    if (action === 'approve') {
      // Créer un client SFD
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .insert({
          sfd_id: request.sfd_id,
          user_id: request.user_id,
          full_name: request.full_name,
          email: request.email,
          phone: request.phone,
          address: request.address,
          id_type: request.id_type,
          id_number: request.id_number,
          status: 'validated',
          validated_by: adminId,
          validated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating SFD client:', clientError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Failed to create SFD client' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      clientId = client.id;

      // Créer un compte pour le client
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: request.user_id,
          sfd_id: request.sfd_id,
          balance: 0,
          currency: 'FCFA'
        })

      if (accountError) {
        console.error('Error creating client account:', accountError)
        // Continue even if account creation fails
      }

      // Créer une association utilisateur-SFD
      const { error: userSfdError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: request.user_id,
          sfd_id: request.sfd_id,
          is_default: false
        })
        .select()

      if (userSfdError) {
        console.error('Error creating user-SFD association:', userSfdError)
        // Continue even if association creation fails
      }
    }

    // Créer une notification pour l'utilisateur
    const notificationMessage = action === 'approve' 
      ? `Votre demande d'adhésion à ${request.sfds.name} a été approuvée.` 
      : `Votre demande d'adhésion à ${request.sfds.name} a été rejetée.${notes ? ' Raison: ' + notes : ''}`;

    const { error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        title: action === 'approve' ? 'Demande d\'adhésion approuvée' : 'Demande d\'adhésion rejetée',
        message: notificationMessage,
        type: action === 'approve' ? 'adhesion_approved' : 'adhesion_rejected',
        recipient_id: request.user_id,
        sender_id: adminId,
        action_link: action === 'approve' ? '/mobile-flow/main' : '/mobile-flow/account'
      })

    if (notifError) {
      console.error('Error creating user notification:', notifError)
      // Continue even if notification creation fails
    }

    // Créer une entrée d'audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: adminId,
        action: action === 'approve' ? 'client_adhesion_approved' : 'client_adhesion_rejected',
        category: 'USER_MANAGEMENT',
        status: 'success',
        target_resource: `client_adhesion_requests/${requestId}`,
        details: {
          sfd_id: request.sfd_id,
          client_id: request.user_id,
          client_name: request.full_name,
          notes: notes
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === 'approve' 
          ? 'Adhesion request approved successfully' 
          : 'Adhesion request rejected successfully',
        status: action === 'approve' ? 'approved' : 'rejected',
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
