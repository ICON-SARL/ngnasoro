import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Génération des données de test...");
    
    // 1. Créer 3 SFDs
    const sfds = [
      {
        name: "RCPB Ouagadougou",
        code: "RCPB-OUA",
        region: "Centre",
        status: "active",
        contact_email: "contact@rcpb-oua.bf",
        phone: "+226 25 30 60 70",
        subsidy_balance: 5000000
      },
      {
        name: "Microcred Abidjan",
        code: "MC-ABJ",
        region: "Abidjan",
        status: "active",
        contact_email: "info@microcred-ci.com",
        phone: "+225 27 20 30 40 50",
        subsidy_balance: 3500000
      },
      {
        name: "FUCEC Lomé",
        code: "FUCEC-LOM",
        region: "Maritime",
        status: "active",
        contact_email: "fucec@fucec-togo.tg",
        phone: "+228 22 21 54 87",
        subsidy_balance: 2000000
      }
    ];

    const { data: createdSfds, error: sfdError } = await supabase
      .from("sfds")
      .insert(sfds)
      .select();

    if (sfdError) throw sfdError;
    console.log(`✓ ${createdSfds.length} SFDs créés`);

    // 2. Créer des comptes SFD pour chaque SFD
    const sfdAccounts = createdSfds.flatMap(sfd => [
      { sfd_id: sfd.id, account_type: "operation", balance: 1000000, currency: "FCFA" },
      { sfd_id: sfd.id, account_type: "epargne", balance: 500000, currency: "FCFA" },
      { sfd_id: sfd.id, account_type: "remboursement", balance: 300000, currency: "FCFA" }
    ]);

    await supabase.from("sfd_accounts").insert(sfdAccounts);
    console.log(`✓ ${sfdAccounts.length} comptes SFD créés`);

    // 3. Créer 20 clients par SFD (60 total)
    const firstNames = ["Abdou", "Fatima", "Kouassi", "Awa", "Mamadou", "Aissatou", "Koffi", "Mariama", "Yao", "Aminata"];
    const lastNames = ["Diallo", "Traoré", "Koné", "Ouédraogo", "Kaboré", "Sanogo", "Diabaté", "Touré", "Sawadogo", "Compaoré"];
    
    const clients = [];
    for (const sfd of createdSfds) {
      for (let i = 0; i < 20; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        clients.push({
          sfd_id: sfd.id,
          full_name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
          phone: `+226 ${70 + Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
          address: `Secteur ${Math.floor(Math.random() * 30 + 1)}, Ouagadougou`,
          status: "active",
          kyc_level: Math.floor(Math.random() * 3) + 1,
          client_code: `${sfd.code}-${String(i + 1).padStart(6, '0')}`
        });
      }
    }

    const { data: createdClients, error: clientError } = await supabase
      .from("sfd_clients")
      .insert(clients)
      .select();

    if (clientError) throw clientError;
    console.log(`✓ ${createdClients.length} clients créés`);

    // 4. Créer des plans de prêt
    const loanPlans = createdSfds.flatMap(sfd => [
      {
        sfd_id: sfd.id,
        name: "Petit crédit",
        description: "Pour petits commerces",
        min_amount: 50000,
        max_amount: 500000,
        interest_rate: 0.12,
        duration_months: 6,
        is_active: true
      },
      {
        sfd_id: sfd.id,
        name: "Crédit moyen",
        description: "Pour PME",
        min_amount: 500000,
        max_amount: 2000000,
        interest_rate: 0.15,
        duration_months: 12,
        is_active: true
      },
      {
        sfd_id: sfd.id,
        name: "Grand crédit",
        description: "Pour grands projets",
        min_amount: 2000000,
        max_amount: 10000000,
        interest_rate: 0.18,
        duration_months: 24,
        is_active: true
      }
    ]);

    const { data: createdPlans } = await supabase
      .from("sfd_loan_plans")
      .insert(loanPlans)
      .select();

    console.log(`✓ ${createdPlans.length} plans de prêt créés`);

    // 5. Créer 50 prêts avec différents statuts
    const loanStatuses = ["active", "active", "active", "completed", "pending", "defaulted"];
    const loans = [];
    
    for (let i = 0; i < 50; i++) {
      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      const plan = createdPlans.find(p => p.sfd_id === client.sfd_id);
      const amount = Math.floor(Math.random() * (plan.max_amount - plan.min_amount) + plan.min_amount);
      const totalAmount = amount * (1 + plan.interest_rate);
      const monthlyPayment = totalAmount / plan.duration_months;
      const status = loanStatuses[Math.floor(Math.random() * loanStatuses.length)];
      
      const disbursedDate = new Date();
      disbursedDate.setMonth(disbursedDate.getMonth() - Math.floor(Math.random() * 6));
      
      loans.push({
        sfd_id: client.sfd_id,
        client_id: client.id,
        loan_plan_id: plan.id,
        amount: amount,
        interest_rate: plan.interest_rate,
        duration_months: plan.duration_months,
        monthly_payment: monthlyPayment,
        total_amount: totalAmount,
        remaining_amount: status === "completed" ? 0 : totalAmount - (Math.random() * totalAmount * 0.5),
        status: status,
        purpose: "Développement activité commerciale",
        approved_at: status !== "pending" ? disbursedDate.toISOString() : null,
        disbursed_at: status !== "pending" ? disbursedDate.toISOString() : null,
        next_payment_date: status === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
      });
    }

    const { data: createdLoans } = await supabase
      .from("sfd_loans")
      .insert(loans)
      .select();

    console.log(`✓ ${createdLoans.length} prêts créés`);

    // 6. Créer des paiements pour les prêts actifs/complétés
    const payments = [];
    for (const loan of createdLoans.filter(l => l.status === "active" || l.status === "completed")) {
      const numPayments = loan.status === "completed" 
        ? loan.duration_months 
        : Math.floor(Math.random() * loan.duration_months / 2);
      
      for (let i = 0; i < numPayments; i++) {
        payments.push({
          loan_id: loan.id,
          amount: loan.monthly_payment,
          payment_method: ["mobile_money", "cash", "bank_transfer"][Math.floor(Math.random() * 3)],
          status: "completed",
          reference: `PAY-${Date.now()}-${i}`
        });
      }
    }

    if (payments.length > 0) {
      await supabase.from("loan_payments").insert(payments);
      console.log(`✓ ${payments.length} paiements créés`);
    }

    // 7. Créer des transactions
    const transactions = [];
    for (let i = 0; i < 100; i++) {
      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      const types = ["deposit", "withdrawal", "transfer", "loan_repayment"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      transactions.push({
        user_id: client.user_id || client.id,
        sfd_id: client.sfd_id,
        type: type,
        amount: Math.floor(Math.random() * 100000 + 10000),
        status: "completed",
        payment_method: ["mobile_money", "cash", "bank_transfer"][Math.floor(Math.random() * 3)],
        description: `Transaction ${type}`,
        reference: `TXN-${Date.now()}-${i}`
      });
    }

    await supabase.from("transactions").insert(transactions);
    console.log(`✓ ${transactions.length} transactions créées`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Données de test générées avec succès",
        data: {
          sfds: createdSfds.length,
          clients: createdClients.length,
          loans: createdLoans.length,
          payments: payments.length,
          transactions: transactions.length
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});