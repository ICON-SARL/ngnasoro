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

    const { requestId, approved, rejectionReason, approvedAmount, startDate, endDate, notes } = await req.json();

    console.log('Subsidy approval process:', { requestId, approved, userId: user.id });

    // Vérifier que l'utilisateur est admin (MEREF)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRole) {
      throw new Error('Only MEREF admins can approve subsidies');
    }

    // Récupérer la demande
    const { data: request, error: requestError } = await supabase
      .from('subsidy_requests')
      .select('*, sfd:sfds(*)')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Subsidy request not found');
    }

    // Vérifier que la demande est en attente
    if (request.status !== 'pending') {
      throw new Error(`Request is not pending (current status: ${request.status})`);
    }

    let updateData: any = {
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    };

    if (approved) {
      const finalAmount = approvedAmount || request.amount;

      // Valider les montants
      if (finalAmount <= 0) {
        throw new Error('Approved amount must be positive');
      }

      if (finalAmount > request.amount * 1.5) {
        throw new Error('Approved amount cannot exceed 150% of requested amount');
      }

      updateData.status = 'approved';

      // Créer la subvention
      const { data: subsidy, error: subsidyError } = await supabase
        .from('sfd_subsidies')
        .insert({
          sfd_id: request.sfd_id,
          amount: finalAmount,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          start_date: startDate || new Date().toISOString(),
          end_date: endDate,
          status: 'active',
          description: `Approved subsidy from request ${requestId}`,
          name: `Subvention ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        })
        .select()
        .single();

      if (subsidyError) {
        console.error('Error creating subsidy:', subsidyError);
        throw new Error('Failed to create subsidy');
      }

      // Mettre à jour le solde de subvention du SFD
      const { error: sfdUpdateError } = await supabase
        .from('sfds')
        .update({
          subsidy_balance: (request.sfd.subsidy_balance || 0) + finalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.sfd_id);

      if (sfdUpdateError) {
        console.error('Error updating SFD balance:', sfdUpdateError);
        // Ne pas échouer la transaction, juste logger
      }

      // Logger l'activité de subvention
      await supabase.from('subsidy_activities').insert({
        request_id: requestId,
        subsidy_id: subsidy.id,
        activity_type: 'subsidy_approved',
        description: `Subsidy approved: ${finalAmount} FCFA`,
        performed_by: user.id
      });

      console.log('Subsidy created:', subsidy.id);
    } else {
      if (!rejectionReason) {
        throw new Error('Rejection reason is required');
      }
      updateData.status = 'rejected';
      updateData.rejection_reason = rejectionReason;
    }

    // Mettre à jour la demande
    const { data: updatedRequest, error: updateError } = await supabase
      .from('subsidy_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating request:', updateError);
      throw new Error('Failed to update subsidy request');
    }

    // Logger l'activité de la demande
    await supabase.from('subsidy_request_activities').insert({
      request_id: requestId,
      activity_type: approved ? 'request_approved' : 'request_rejected',
      description: approved 
        ? `Request approved: ${approvedAmount || request.amount} FCFA allocated`
        : `Request rejected: ${rejectionReason}`,
      performed_by: user.id
    });

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: approved ? 'subsidy_approval' : 'subsidy_rejection',
      category: 'SUBSIDY',
      severity: 'info',
      status: 'success',
      details: {
        request_id: requestId,
        sfd_id: request.sfd_id,
        approved,
        amount: approvedAmount || request.amount,
        rejection_reason: rejectionReason,
        notes
      }
    });

    // Notifier le SFD
    const { data: sfdAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'sfd_admin');

    if (sfdAdmins && sfdAdmins.length > 0) {
      // Filtrer pour n'envoyer qu'aux admins du SFD concerné
      const { data: sfdUsers } = await supabase
        .from('user_sfds')
        .select('user_id')
        .eq('sfd_id', request.sfd_id)
        .in('user_id', sfdAdmins.map(a => a.user_id));

      if (sfdUsers && sfdUsers.length > 0) {
        const notifications = sfdUsers.map(sfdUser => ({
          user_id: sfdUser.user_id,
          type: approved ? 'subsidy_approved' : 'subsidy_rejected',
          title: approved ? 'Subvention approuvée' : 'Subvention rejetée',
          message: approved
            ? `Votre demande de ${request.amount} FCFA a été approuvée${approvedAmount && approvedAmount !== request.amount ? ` (montant alloué: ${approvedAmount} FCFA)` : ''}`
            : `Votre demande de subvention a été rejetée: ${rejectionReason}`,
          action_url: `/sfd/subsidies/${approved ? 'active' : `requests/${requestId}`}`
        }));

        await supabase.from('admin_notifications').insert(notifications);
      }
    }

    console.log('Subsidy approval completed:', { requestId, approved });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: updatedRequest,
        message: approved ? 'Subsidy approved successfully' : 'Subsidy request rejected'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in approve-subsidy:', error);
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
