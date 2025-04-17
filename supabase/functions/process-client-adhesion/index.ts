
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
    const { userId, sfdId, adhesionData } = await req.json()

    if (!userId || !sfdId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User ID and SFD ID are required' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Vérifier si une demande existe déjà pour cet utilisateur et cette SFD
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: existingRequest, error: checkError } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .eq('status', 'pending')
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing request:', checkError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error checking existing request' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Une demande d\'adhésion est déjà en cours pour cette SFD' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get user details if we need additional info
    const { data: userData, error: userError } = await supabase
      .auth.admin.getUserById(userId)

    if (userError) {
      console.error('Error fetching user data:', userError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Could not fetch user data' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Récupérer les infos de la SFD
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('name')
      .eq('id', sfdId)
      .single()

    if (sfdError) {
      console.error('Error fetching SFD data:', sfdError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Could not fetch SFD data' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Generate a reference number
    const referenceNumber = `ADH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Créer la demande d'adhésion
    const requestData = {
      user_id: userId,
      sfd_id: sfdId,
      status: 'pending',
      reference_number: referenceNumber,
      kyc_status: 'pending',
      full_name: adhesionData?.full_name || userData.user?.user_metadata?.full_name || '',
      email: adhesionData?.email || userData.user?.email || '',
      phone: adhesionData?.phone || userData.user?.phone || '',
      address: adhesionData?.address || '',
      profession: adhesionData?.profession || '',
      monthly_income: adhesionData?.monthly_income ? parseFloat(adhesionData.monthly_income) : null,
      source_of_income: adhesionData?.source_of_income || '',
      created_at: new Date().toISOString(),
    }

    // Insérer la demande dans la base de données
    const { data: request, error: insertError } = await supabase
      .from('client_adhesion_requests')
      .insert([requestData])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating adhesion request:', insertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error creating adhesion request' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Trouver les administrateurs SFD qui doivent recevoir la notification
    const { data: sfdAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'sfd_admin')

    if (adminsError) {
      console.error('Error fetching SFD admins:', adminsError)
      // Continuer même si nous ne pouvons pas récupérer les administrateurs
    }

    // Récupérer les administrateurs spécifiquement associés à cette SFD
    const { data: sfdSpecificAdmins, error: specificAdminsError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId)
      .filter('user_id', 'in', `(${sfdAdmins?.map(admin => admin.user_id).join(',')})`)

    if (specificAdminsError) {
      console.error('Error fetching SFD-specific admins:', specificAdminsError)
      // Continuer même si nous ne pouvons pas récupérer les administrateurs spécifiques
    }

    // Créer des notifications pour les administrateurs SFD
    if (sfdSpecificAdmins && sfdSpecificAdmins.length > 0) {
      const notificationData = sfdSpecificAdmins.map(admin => ({
        title: 'Nouvelle demande d\'adhésion',
        message: `Nouvelle demande d'adhésion de ${requestData.full_name} pour ${sfdData.name}`,
        type: 'adhesion_request',
        recipient_id: admin.user_id,
        action_link: '/sfd-adhesion-requests',
        created_at: new Date().toISOString()
      }))

      // Insérer les notifications pour les administrateurs spécifiques à la SFD
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert(notificationData)

      if (notificationError) {
        console.error('Error creating admin notifications:', notificationError)
        // Continuer même si les notifications échouent
      }
    } else {
      // Fallback: notifier tous les admins SFD si aucun admin spécifique n'est trouvé
      await supabase
        .from('admin_notifications')
        .insert([{
          title: 'Nouvelle demande d\'adhésion',
          message: `Nouvelle demande d'adhésion de ${requestData.full_name} pour ${sfdData.name}`,
          type: 'adhesion_request',
          recipient_role: 'sfd_admin',
          action_link: '/sfd-adhesion-requests',
          created_at: new Date().toISOString()
        }])
    }

    // Créer une entrée d'audit
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: userId,
        action: 'client_adhesion_requested',
        category: 'USER_MANAGEMENT',
        status: 'success',
        target_resource: `client_adhesion_requests/${request.id}`,
        details: {
          sfd_id: sfdId,
          sfd_name: sfdData.name,
          reference_number: referenceNumber
        }
      }])

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demande d\'adhésion créée avec succès', 
        requestId: request.id,
        reference: referenceNumber
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
