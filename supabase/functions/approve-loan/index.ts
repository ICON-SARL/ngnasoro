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

    const { loanId, approved, rejectionReason } = await req.json();

    console.log('Loan approval process:', { loanId, approved, userId: user.id });

    // Vérifier que l'utilisateur est sfd_admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'sfd_admin')
      .single();

    if (!userRole) {
      throw new Error('Only SFD admins can approve loans');
    }

    // Récupérer le prêt
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('*, client:sfd_clients(*), sfd:sfds(*)')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      throw new Error('Loan not found');
    }

    // Vérifier que le prêt est en attente
    if (loan.status !== 'pending') {
      throw new Error(`Loan is not pending (current status: ${loan.status})`);
    }

    // Vérifier que l'admin appartient au même SFD
    const { data: userSfd } = await supabase
      .from('user_sfds')
      .select('sfd_id')
      .eq('user_id', user.id)
      .eq('sfd_id', loan.sfd_id)
      .single();

    if (!userSfd) {
      throw new Error('You can only approve loans from your SFD');
    }

    let updateData: any = {
      approved_by: user.id,
      approved_at: new Date().toISOString()
    };

    if (approved) {
      // Vérifier la disponibilité des subventions si nécessaire
      const { data: subsidies } = await supabase
        .from('sfd_subsidies')
        .select('*')
        .eq('sfd_id', loan.sfd_id)
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      const availableSubsidy = subsidies?.reduce((total, sub) => 
        total + (sub.amount - (sub.used_amount || 0)), 0
      ) || 0;

      if (loan.amount > availableSubsidy) {
        console.warn('Insufficient subsidy balance:', { required: loan.amount, available: availableSubsidy });
      }

      updateData.status = 'approved';
    } else {
      if (!rejectionReason) {
        throw new Error('Rejection reason is required');
      }
      updateData.status = 'rejected';
      updateData.rejection_reason = rejectionReason;
    }

    // Mettre à jour le prêt
    const { data: updatedLoan, error: updateError } = await supabase
      .from('sfd_loans')
      .update(updateData)
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating loan:', updateError);
      throw new Error('Failed to update loan status');
    }

    // Logger l'activité
    await supabase.from('loan_activities').insert({
      loan_id: loanId,
      activity_type: approved ? 'loan_approved' : 'loan_rejected',
      description: approved 
        ? 'Loan approved by SFD admin'
        : `Loan rejected: ${rejectionReason}`,
      performed_by: user.id
    });

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: approved ? 'loan_approval' : 'loan_rejection',
      category: 'LOAN',
      severity: 'info',
      status: 'success',
      details: {
        loan_id: loanId,
        approved,
        rejection_reason: rejectionReason,
        amount: loan.amount
      }
    });

    // Notifier le client
    if (loan.client.user_id) {
      await supabase.from('admin_notifications').insert({
        user_id: loan.client.user_id,
        type: approved ? 'loan_approved' : 'loan_rejected',
        title: approved ? 'Prêt approuvé' : 'Prêt rejeté',
        message: approved
          ? `Votre demande de prêt de ${loan.amount} FCFA a été approuvée`
          : `Votre demande de prêt a été rejetée: ${rejectionReason}`,
        action_url: `/client/loans/${loanId}`
      });
    }

    console.log('Loan approval successful:', { loanId, approved });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: updatedLoan,
        message: approved ? 'Loan approved successfully' : 'Loan rejected'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in approve-loan:', error);
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
