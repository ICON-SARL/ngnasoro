import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Vérifier l'utilisateur authentifié
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Non authentifié')
    }

    const { password } = await req.json()
    
    if (!password) {
      throw new Error('Mot de passe requis')
    }

    // SÉCURITÉ : Vérifier le mot de passe avant suppression
    const { error: pwdError } = await supabaseClient.auth.signInWithPassword({
      email: user.email!,
      password: password
    })
    
    if (pwdError) {
      throw new Error('Mot de passe incorrect')
    }

    // Client Admin pour suppression en cascade
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🗑️ Début suppression compte utilisateur ${user.id}`)

    // Log audit AVANT suppression
    await supabaseAdmin.from('audit_logs').insert({
      action: 'account_deletion_initiated',
      category: 'account',
      severity: 'high',
      status: 'success',
      user_id: user.id,
      details: { email: user.email, initiated_at: new Date().toISOString() }
    })

    // Supprimer les données en cascade (ordre important pour respecter les FK!)
    const deletionTables = [
      // Transactions et paiements
      { table: 'loan_payments', column: 'loan_id', via: 'sfd_loans' },
      { table: 'transactions', column: 'user_id' },
      { table: 'cash_operations', column: 'client_id', via: 'sfd_clients' },
      
      // Prêts
      { table: 'loan_activities', column: 'loan_id', via: 'sfd_loans' },
      { table: 'sfd_loans', column: 'client_id', via: 'sfd_clients' },
      
      // Comptes
      { table: 'accounts', column: 'user_id' },
      
      // Documents et activités
      { table: 'client_documents', column: 'client_id', via: 'sfd_clients' },
      { table: 'client_activities', column: 'client_id', via: 'sfd_clients' },
      
      // Demandes
      { table: 'client_adhesion_requests', column: 'user_id' },
      
      // Tontines et cagnottes
      { table: 'tontine_contributions', column: 'member_id', via: 'tontine_members' },
      { table: 'tontine_members', column: 'user_id' },
      { table: 'collaborative_vault_transactions', column: 'user_id' },
      { table: 'collaborative_vault_members', column: 'user_id' },
      
      // Clients SFD
      { table: 'sfd_clients', column: 'user_id' },
      
      // Associations et rôles
      { table: 'user_sfds', column: 'user_id' },
      { table: 'user_roles', column: 'user_id' },
      
      // Logs (garder en dernier)
      { table: 'audit_logs', column: 'user_id' },
    ]

    let deletedCounts: Record<string, number> = {}

    for (const { table, column, via } of deletionTables) {
      try {
        if (via) {
          // Suppression indirecte via une jointure
          if (via === 'sfd_clients') {
            const { data: clients } = await supabaseAdmin
              .from('sfd_clients')
              .select('id')
              .eq('user_id', user.id)
            
            if (clients && clients.length > 0) {
              const clientIds = clients.map(c => c.id)
              const { count } = await supabaseAdmin
                .from(table)
                .delete({ count: 'exact' })
                .in(column, clientIds)
              deletedCounts[table] = count || 0
            }
          } else if (via === 'sfd_loans') {
            const { data: clients } = await supabaseAdmin
              .from('sfd_clients')
              .select('id')
              .eq('user_id', user.id)
            
            if (clients && clients.length > 0) {
              const { data: loans } = await supabaseAdmin
                .from('sfd_loans')
                .select('id')
                .in('client_id', clients.map(c => c.id))
              
              if (loans && loans.length > 0) {
                const loanIds = loans.map(l => l.id)
                const { count } = await supabaseAdmin
                  .from(table)
                  .delete({ count: 'exact' })
                  .in(column, loanIds)
                deletedCounts[table] = count || 0
              }
            }
          } else if (via === 'tontine_members') {
            const { data: members } = await supabaseAdmin
              .from('tontine_members')
              .select('id')
              .eq('user_id', user.id)
            
            if (members && members.length > 0) {
              const memberIds = members.map(m => m.id)
              const { count } = await supabaseAdmin
                .from(table)
                .delete({ count: 'exact' })
                .in(column, memberIds)
              deletedCounts[table] = count || 0
            }
          }
        } else {
          // Suppression directe
          const { count } = await supabaseAdmin
            .from(table)
            .delete({ count: 'exact' })
            .eq(column, user.id)
          deletedCounts[table] = count || 0
        }
        console.log(`✅ ${table}: ${deletedCounts[table] || 0} lignes supprimées`)
      } catch (error) {
        console.error(`⚠️ Erreur lors de la suppression de ${table}:`, error)
        // Continue malgré les erreurs pour supprimer le maximum de données
      }
    }

    // Supprimer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)
    
    if (profileError) {
      console.error('⚠️ Erreur suppression profil:', profileError)
    } else {
      console.log('✅ Profil supprimé')
    }

    // Supprimer l'utilisateur de auth.users (CRITIQUE)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (deleteAuthError) {
      console.error('❌ Erreur suppression auth.users:', deleteAuthError)
      throw new Error('Erreur lors de la suppression du compte d\'authentification')
    }

    console.log('✅ Compte supprimé avec succès')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Compte supprimé définitivement',
        details: deletedCounts
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('❌ Erreur suppression compte:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de la suppression du compte'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
