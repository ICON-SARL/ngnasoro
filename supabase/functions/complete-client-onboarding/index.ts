import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingRequest {
  adhesionRequestId: string
  approvedBy: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { adhesionRequestId, approvedBy }: OnboardingRequest = await req.json()

    console.log('Starting client onboarding for request:', adhesionRequestId)

    // 1. Récupérer la demande d'adhésion
    const { data: adhesionRequest, error: adhesionError } = await supabase
      .from('client_adhesion_requests')
      .select('*, sfds:sfd_id(code, name)')
      .eq('id', adhesionRequestId)
      .single()

    if (adhesionError || !adhesionRequest) {
      throw new Error(`Adhesion request not found: ${adhesionError?.message}`)
    }

    const { user_id, sfd_id, full_name, email, phone, address, sfds } = adhesionRequest
    const sfdCode = sfds?.code

    // 2. Générer le code client unique
    const { data: clientCode, error: codeError } = await supabase
      .rpc('generate_client_code', { sfd_code: sfdCode })

    if (codeError || !clientCode) {
      throw new Error(`Failed to generate client code: ${codeError?.message}`)
    }

    console.log('Generated client code:', clientCode)

    // 3. Créer l'entrée sfd_clients
    const { data: sfdClient, error: clientError } = await supabase
      .from('sfd_clients')
      .insert({
        sfd_id,
        user_id,
        full_name,
        email,
        phone,
        address,
        client_code: clientCode,
        kyc_level: 1,
        status: 'active'
      })
      .select()
      .single()

    if (clientError) {
      throw new Error(`Failed to create sfd_client: ${clientError.message}`)
    }

    console.log('Created sfd_client:', sfdClient.id)

    // 4. Upgrade le rôle user → client
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id,
        role: 'client'
      }, {
        onConflict: 'user_id,role'
      })

    if (roleError) {
      throw new Error(`Failed to upgrade role: ${roleError.message}`)
    }

    // 5. Mettre à jour le profil avec client_code et KYC level 1
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        client_code: clientCode,
        kyc_level: 1
      })
      .eq('id', user_id)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    // 6. Créer 3 comptes automatiquement (opération, épargne, remboursement)
    const accountsToCreate = [
      {
        user_id,
        sfd_id,
        balance: 0,
        currency: 'FCFA',
        status: 'active'
      }
    ]

    const { error: accountsError } = await supabase
      .from('accounts')
      .insert(accountsToCreate)

    if (accountsError) {
      console.error('Failed to create accounts:', accountsError.message)
      // Non-bloquant, on continue
    }

    // 7. Créer association user_sfds
    const { error: userSfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id,
        sfd_id,
        is_default: true
      })

    if (userSfdError) {
      console.error('Failed to create user_sfd:', userSfdError.message)
      // Non-bloquant
    }

    // 8. Mettre à jour la demande d'adhésion
    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({
        status: 'approved',
        reviewed_by: approvedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', adhesionRequestId)

    if (updateError) {
      console.error('Failed to update adhesion request:', updateError.message)
    }

    // 9. Créer notification pour le client
    const { error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        user_id,
        type: 'adhesion_approved',
        title: 'Adhésion approuvée',
        message: `Félicitations ! Votre adhésion à ${sfds?.name} a été approuvée. Votre code client est ${clientCode}.`,
        is_read: false
      })

    if (notifError) {
      console.error('Failed to create notification:', notifError.message)
    }

    // 10. Logger dans audit_logs
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: approvedBy,
        action: 'approve_client_adhesion',
        category: 'client_onboarding',
        severity: 'info',
        status: 'success',
        target_resource: `client:${sfdClient.id}`,
        details: {
          client_id: sfdClient.id,
          client_code: clientCode,
          sfd_id,
          adhesion_request_id: adhesionRequestId
        }
      })

    if (auditError) {
      console.error('Failed to log audit:', auditError.message)
    }

    console.log('Client onboarding completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client_id: sfdClient.id,
          client_code: clientCode,
          kyc_level: 1
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in complete-client-onboarding:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
