import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🚀 Starting MVP test data generation...');

    // Récupérer une SFD active
    const { data: sfds } = await supabase
      .from('sfds')
      .select('*')
      .eq('status', 'active')
      .limit(3);

    if (!sfds || sfds.length === 0) {
      throw new Error('No active SFDs found');
    }

    const targetSfd = sfds[0];
    console.log(`✅ Using SFD: ${targetSfd.name} (${targetSfd.code})`);

    const results = {
      adhesion_requests: { created: 0, approved: 0, pending: 0, rejected: 0 },
      kyc_documents: { created: 0, verified: 0, pending: 0 },
      loans: { created: 0 },
      transactions: { created: 0 },
      subsidy_requests: { created: 0 }
    };

    // ========================================
    // 1. CRÉER 5 DEMANDES D'ADHÉSION
    // ========================================
    console.log('\n📝 Creating adhesion requests...');
    
    const testUsers = [
      { name: 'Marie Kouadio', email: 'marie.kouadio@test.com', phone: '+225 07 12 34 56 78', status: 'approved' },
      { name: 'Jean Traoré', email: 'jean.traore@test.com', phone: '+225 07 23 45 67 89', status: 'approved' },
      { name: 'Fatou Diallo', email: 'fatou.diallo@test.com', phone: '+225 07 34 56 78 90', status: 'pending' },
      { name: 'Amadou Sanogo', email: 'amadou.sanogo@test.com', phone: '+225 07 45 67 89 01', status: 'pending' },
      { name: 'Aissatou Keita', email: 'aissatou.keita@test.com', phone: '+225 07 56 78 90 12', status: 'rejected' }
    ];

    for (const testUser of testUsers) {
      // Créer un user auth si nécessaire
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      let userId = existingUser?.users?.find(u => u.email === testUser.email)?.id;

      if (!userId) {
        const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: 'Test123456!',
          email_confirm: true,
          user_metadata: { full_name: testUser.name }
        });

        if (authError) {
          console.error(`Failed to create user ${testUser.name}:`, authError);
          continue;
        }
        userId = newUser.user.id;

        // Créer le profil
        await supabase.from('profiles').insert({
          id: userId,
          full_name: testUser.name,
          phone: testUser.phone
        });

        // Assigner rôle user
        await supabase.from('user_roles').insert({
          user_id: userId,
          role: 'user'
        });
      }

      // Créer demande d'adhésion
      const { data: adhesionRequest, error: adhesionError } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: userId,
          sfd_id: targetSfd.id,
          full_name: testUser.name,
          email: testUser.email,
          phone: testUser.phone,
          address: `Abidjan, Côte d'Ivoire`,
          status: testUser.status === 'approved' ? 'pending' : testUser.status
        })
        .select()
        .single();

      if (adhesionError) {
        console.error(`Failed to create adhesion for ${testUser.name}:`, adhesionError);
        continue;
      }

      results.adhesion_requests.created++;

      // Si status approved, approuver maintenant
      if (testUser.status === 'approved' && adhesionRequest) {
        const { data: approvalResult } = await supabase.rpc('approve_client_adhesion', {
          p_request_id: adhesionRequest.id,
          p_reviewed_by: userId // Auto-approbation pour test
        });

        if (approvalResult?.success) {
          results.adhesion_requests.approved++;
          console.log(`✅ Approved adhesion for ${testUser.name}`);
        }
      } else if (testUser.status === 'pending') {
        results.adhesion_requests.pending++;
      } else if (testUser.status === 'rejected') {
        results.adhesion_requests.rejected++;
      }
    }

    // ========================================
    // 2. CRÉER DOCUMENTS KYC POUR CLIENTS APPROUVÉS
    // ========================================
    console.log('\n📄 Creating KYC documents...');

    const { data: approvedClients } = await supabase
      .from('sfd_clients')
      .select('id, user_id, full_name')
      .eq('sfd_id', targetSfd.id)
      .limit(3);

    if (approvedClients && approvedClients.length > 0) {
      const docTypes = ['identity', 'proof_of_address', 'bank_statement'];
      
      for (const client of approvedClients) {
        // Créer 2-3 documents par client
        const numDocs = Math.floor(Math.random() * 2) + 2; // 2 ou 3 documents
        
        for (let i = 0; i < numDocs && i < docTypes.length; i++) {
          const isVerified = i < 2; // 2 premiers vérifiés, 3ème en attente
          
          const { error: docError } = await supabase
            .from('client_documents')
            .insert({
              client_id: client.id,
              document_type: docTypes[i],
              document_url: `https://placeholder.com/document-${docTypes[i]}.pdf`,
              uploaded_by: client.user_id,
              status: isVerified ? 'verified' : 'pending',
              verified: isVerified,
              verified_at: isVerified ? new Date().toISOString() : null,
              verified_by: isVerified ? client.user_id : null
            });

          if (!docError) {
            results.kyc_documents.created++;
            if (isVerified) {
              results.kyc_documents.verified++;
            } else {
              results.kyc_documents.pending++;
            }
          }
        }

        // Recalculer KYC level
        await supabase.functions.invoke('recalculate-kyc-level', {
          body: { clientId: client.id }
        });
      }

      console.log(`✅ Created ${results.kyc_documents.created} KYC documents`);
    }

    // ========================================
    // 3. CRÉER DES PRÊTS ACTIFS
    // ========================================
    console.log('\n💰 Creating active loans...');

    if (approvedClients && approvedClients.length > 0) {
      // Récupérer un plan de prêt
      const { data: loanPlans } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', targetSfd.id)
        .eq('is_active', true)
        .limit(1);

      if (loanPlans && loanPlans.length > 0) {
        const plan = loanPlans[0];

        for (let i = 0; i < Math.min(3, approvedClients.length); i++) {
          const client = approvedClients[i];
          const amount = plan.min_amount + (plan.max_amount - plan.min_amount) * 0.5;
          const totalAmount = amount * (1 + plan.interest_rate / 100);
          const monthlyPayment = totalAmount / plan.duration_months;

          const { error: loanError } = await supabase
            .from('sfd_loans')
            .insert({
              client_id: client.id,
              sfd_id: targetSfd.id,
              loan_plan_id: plan.id,
              amount: amount,
              total_amount: totalAmount,
              monthly_payment: monthlyPayment,
              interest_rate: plan.interest_rate,
              duration_months: plan.duration_months,
              remaining_amount: totalAmount * 0.7, // 30% déjà remboursé
              status: 'active',
              approved_at: new Date().toISOString(),
              approved_by: client.user_id,
              disbursed_at: new Date().toISOString(),
              next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (!loanError) {
            results.loans.created++;
          }
        }

        console.log(`✅ Created ${results.loans.created} active loans`);
      }
    }

    // ========================================
    // 4. CRÉER DES TRANSACTIONS
    // ========================================
    console.log('\n💸 Creating transactions...');

    if (approvedClients && approvedClients.length > 0) {
      const transactionTypes = ['deposit', 'withdrawal', 'loan_payment'];

      for (const client of approvedClients.slice(0, 2)) {
        // Récupérer les comptes du client
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', client.user_id)
          .eq('sfd_id', targetSfd.id);

        if (accounts && accounts.length > 0) {
          // Créer 3-5 transactions par client
          const numTransactions = Math.floor(Math.random() * 3) + 3;

          for (let i = 0; i < numTransactions; i++) {
            const account = accounts[Math.floor(Math.random() * accounts.length)];
            const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
            const amount = Math.floor(Math.random() * 50000) + 10000;

            const { error: txError } = await supabase
              .from('transactions')
              .insert({
                user_id: client.user_id,
                sfd_id: targetSfd.id,
                account_id: account.id,
                amount: amount,
                type: type,
                status: 'completed',
                payment_method: 'mobile_money',
                description: `Transaction test ${type}`,
                reference: `TX-${Date.now()}-${i}`
              });

            if (!txError) {
              results.transactions.created++;
            }
          }
        }
      }

      console.log(`✅ Created ${results.transactions.created} transactions`);
    }

    // ========================================
    // 5. CRÉER DES DEMANDES DE SUBVENTIONS
    // ========================================
    console.log('\n🏦 Creating subsidy requests...');

    const subsidyStatuses = ['pending', 'approved'];
    
    for (let i = 0; i < 2; i++) {
      const { error: subsidyError } = await supabase
        .from('subsidy_requests')
        .insert({
          sfd_id: targetSfd.id,
          amount: 5000000 + (i * 2000000),
          justification: `Demande de subvention test ${i + 1} pour expansion des activités`,
          status: subsidyStatuses[i],
          priority: i === 0 ? 'high' : 'normal',
          region: targetSfd.region,
          expected_impact: `Impact estimé: ${100 + (i * 50)} nouveaux clients`
        });

      if (!subsidyError) {
        results.subsidy_requests.created++;
      }
    }

    console.log(`✅ Created ${results.subsidy_requests.created} subsidy requests`);

    // ========================================
    // RÉSULTATS FINAUX
    // ========================================
    console.log('\n✨ MVP Test Data Generation Complete!');
    console.log('Results:', JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'MVP test data generated successfully',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error generating MVP test data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
