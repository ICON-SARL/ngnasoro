
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
    const { adhesionId, notes, adminId } = await req.json()

    if (!adhesionId || !adminId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Créer un client Supabase avec la clé d'API
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Récupérer les détails de la demande d'adhésion
    const { data: adhesion, error: adhesionError } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('id', adhesionId)
      .single()

    if (adhesionError || !adhesion) {
      console.error('Erreur lors de la récupération de la demande d\'adhésion:', adhesionError)
      return new Response(
        JSON.stringify({ error: 'Demande d\'adhésion non trouvée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 2. Mettre à jour le statut de la demande d'adhésion
    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({
        status: 'approved',
        processed_by: adminId,
        processed_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', adhesionId)

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la demande d\'adhésion:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la mise à jour de la demande d\'adhésion' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 3. Créer un client SFD
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .insert({
        sfd_id: adhesion.sfd_id,
        full_name: adhesion.full_name,
        email: adhesion.email,
        phone: adhesion.phone,
        address: adhesion.address,
        id_type: adhesion.id_type,
        id_number: adhesion.id_number,
        user_id: adhesion.user_id,
        status: 'validated',
        validated_by: adminId,
        validated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (clientError) {
      console.error('Erreur lors de la création du client SFD:', clientError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du client SFD' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 4. Créer un compte pour le client
    const { error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: adhesion.user_id,
        sfd_id: adhesion.sfd_id,
        balance: 0,
        currency: 'FCFA'
      })

    if (accountError) {
      console.error('Erreur lors de la création du compte:', accountError)
      // On continue même si la création du compte échoue
    }

    // 5. Association user-sfd
    const { error: userSfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: adhesion.user_id,
        sfd_id: adhesion.sfd_id,
        is_default: false
      })

    if (userSfdError) {
      console.error('Erreur lors de l\'association user-sfd:', userSfdError)
      // On continue même si l'association échoue
    }

    // 6. Attribuer le rôle CLIENT à l'utilisateur
    const { error: roleError } = await supabase
      .rpc('assign_role', { user_id: adhesion.user_id, role: 'client' })

    if (roleError) {
      console.error('Erreur lors de l\'attribution du rôle:', roleError)
      // On continue même si l'attribution du rôle échoue
    }

    // 7. Notifier le client
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Demande d\'adhésion approuvée',
        message: `Votre demande d'adhésion a été approuvée. Bienvenue!`,
        type: 'client_adhesion_approved',
        recipient_id: adhesion.user_id,
        sender_id: adminId
      })

    if (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError)
      // On continue même si l'envoi de la notification échoue
    }

    // 8. Log de l'événement
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        action: 'client_adhesion_approved',
        category: 'USER_MANAGEMENT',
        severity: 'info',
        status: 'success',
        user_id: adminId,
        target_resource: `client_adhesion_requests/${adhesionId}`,
        details: {
          client_id: client.id,
          client_name: adhesion.full_name,
          sfd_id: adhesion.sfd_id
        }
      })

    if (auditError) {
      console.error('Erreur lors du log d\'audit:', auditError)
      // On continue même si le log d'audit échoue
    }

    return new Response(
      JSON.stringify({ success: true, data: client }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Erreur serveur:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
