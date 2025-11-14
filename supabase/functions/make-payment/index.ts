import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { loanId, amount, paymentMethod, reference, cashSessionId } = await req.json();

    console.log('Payment processing:', { loanId, amount, paymentMethod, userId: user.id });

    // Récupérer le prêt
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*, client:sfd_clients(*)')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      throw new Error('Loan not found');
    }

    // Vérifier que le prêt est actif
    if (loan.status !== 'active') {
      throw new Error(`Loan is not active (current status: ${loan.status})`);
    }

    // Vérifier le montant minimum
    if (amount < loan.monthly_payment) {
      throw new Error(`Payment amount must be at least ${loan.monthly_payment} FCFA (monthly payment)`);
    }

    if (amount > loan.remaining_amount) {
      throw new Error(`Payment amount exceeds remaining balance of ${loan.remaining_amount} FCFA`);
    }

    // Vérifier l'autorisation
    const isClient = loan.client.user_id === user.id;
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['cashier', 'sfd_admin'])
      .maybeSingle();

    const isCashierOrAdmin = !!userRole;

    if (!isClient && !isCashierOrAdmin) {
      throw new Error('Not authorized to make payment for this loan');
    }

    // Calculer les pénalités si en retard
    let penaltyAmount = 0;
    const today = new Date();
    const nextPaymentDate = new Date(loan.next_payment_date);
    const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 7) {
      penaltyAmount = loan.monthly_payment * 0.05; // 5% de pénalité
      
      // Créer la pénalité
      await supabase.from('loan_penalties').insert({
        loan_id: loanId,
        amount: penaltyAmount,
        penalty_type: 'late_payment',
        days_overdue: daysOverdue
      });

      console.log('Late payment penalty applied:', { penaltyAmount, daysOverdue });
    }

    // Calculer le nouveau solde
    const newRemainingAmount = loan.remaining_amount - amount + penaltyAmount;
    const isFullyPaid = newRemainingAmount <= 0;

    // Calculer la prochaine date de paiement
    let nextPayment = new Date(loan.next_payment_date);
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    // Mettre à jour le prêt
    const updateData: any = {
      remaining_amount: Math.max(0, newRemainingAmount),
      updated_at: new Date().toISOString()
    };

    if (isFullyPaid) {
      updateData.status = 'completed';
      updateData.next_payment_date = null;
    } else {
      updateData.next_payment_date = nextPayment.toISOString().split('T')[0];
    }

    const { data: updatedLoan, error: updateError } = await supabase
      .from('sfd_loans')
      .update(updateData)
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating loan:', updateError);
      throw new Error('Failed to update loan');
    }

    // Créer l'enregistrement de paiement
    const { data: payment, error: paymentError } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_method: paymentMethod,
        reference: reference || `PAY-${Date.now()}`,
        status: 'completed'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw new Error('Failed to record payment');
    }

    // Créer la transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        user_id: loan.client.user_id,
        sfd_id: loan.sfd_id,
        amount,
        type: 'loan_repayment',
        payment_method: paymentMethod,
        status: 'completed',
        reference: payment.reference,
        description: `Loan repayment for loan ${loanId}`,
        created_by: user.id
      })
      .select()
      .single();

    // Si paiement en cash, enregistrer l'opération de caisse
    if (paymentMethod === 'cash' && cashSessionId) {
      const { data: cashSession } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('id', cashSessionId)
        .eq('status', 'open')
        .single();

      if (cashSession) {
        await supabase.from('cash_operations').insert({
          cash_session_id: cashSessionId,
          transaction_id: transaction?.id,
          operation_type: 'loan_repayment',
          amount,
          client_id: loan.client_id,
          reference: payment.reference,
          performed_by: user.id
        });
      }
    }

    // Logger l'activité
    await supabase.from('loan_activities').insert({
      loan_id: loanId,
      activity_type: 'payment_received',
      description: `Payment of ${amount} FCFA received${penaltyAmount > 0 ? ` (includes ${penaltyAmount} FCFA penalty)` : ''}`,
      performed_by: user.id
    });

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'loan_payment',
      category: 'LOAN',
      severity: 'info',
      status: 'success',
      details: {
        loan_id: loanId,
        payment_id: payment.id,
        amount,
        penalty_amount: penaltyAmount,
        payment_method: paymentMethod,
        remaining_amount: updatedLoan.remaining_amount,
        fully_paid: isFullyPaid
      }
    });

    // Notifier le client
    if (loan.client.user_id) {
      await supabase.from('admin_notifications').insert({
        user_id: loan.client.user_id,
        type: isFullyPaid ? 'loan_completed' : 'payment_received',
        title: isFullyPaid ? 'Prêt remboursé' : 'Paiement reçu',
        message: isFullyPaid
          ? `Félicitations! Votre prêt de ${loan.amount} FCFA a été entièrement remboursé`
          : `Paiement de ${amount} FCFA reçu. Solde restant: ${updatedLoan.remaining_amount} FCFA`,
        action_url: `/client/loans/${loanId}`
      });
    }

    console.log('Payment processed successfully:', { paymentId: payment.id, fullyPaid: isFullyPaid });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          payment,
          loan: updatedLoan,
          penalty_applied: penaltyAmount,
          fully_paid: isFullyPaid
        },
        message: isFullyPaid ? 'Loan fully repaid!' : 'Payment processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in make-payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
