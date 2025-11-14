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

    const { sfdId, amount, justification, expectedImpact, priority = 'normal' } = await req.json();

    console.log('Subsidy request started:', { sfdId, amount, userId: user.id });

    // Vérifier que l'utilisateur est sfd_admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'sfd_admin')
      .single();

    if (!userRole) {
      throw new Error('Only SFD admins can request subsidies');
    }

    // Vérifier que l'admin appartient au SFD
    const { data: userSfd } = await supabase
      .from('user_sfds')
      .select('sfd_id')
      .eq('user_id', user.id)
      .eq('sfd_id', sfdId)
      .single();

    if (!userSfd) {
      throw new Error('You can only request subsidies for your SFD');
    }

    // Validations
    if (!amount || amount <= 0) {
      throw new Error('Invalid subsidy amount');
    }

    if (!justification || justification.trim().length < 50) {
      throw new Error('Justification must be at least 50 characters');
    }

    // Vérifier qu'il n'y a pas de demande en attente
    const { data: pendingRequest } = await supabase
      .from('subsidy_requests')
      .select('id, status, amount')
      .eq('sfd_id', sfdId)
      .eq('status', 'pending')
      .maybeSingle();

    if (pendingRequest) {
      throw new Error(`You already have a pending subsidy request for ${pendingRequest.amount} FCFA`);
    }

    // Récupérer les informations du SFD
    const { data: sfd } = await supabase
      .from('sfds')
      .select('name, region, subsidy_balance')
      .eq('id', sfdId)
      .single();

    if (!sfd) {
      throw new Error('SFD not found');
    }

    // Vérifier les alertes de seuil
    const { data: threshold } = await supabase
      .from('subsidy_alert_thresholds')
      .select('*')
      .eq('sfd_id', sfdId)
      .maybeSingle();

    let alertTriggered = false;
    if (threshold) {
      const currentBalance = sfd.subsidy_balance || 0;
      alertTriggered = currentBalance < (threshold.low_threshold || 1000000);
    }

    // Créer la demande de subvention
    const { data: subsidyRequest, error: requestError } = await supabase
      .from('subsidy_requests')
      .insert({
        sfd_id: sfdId,
        amount,
        justification,
        expected_impact: expectedImpact,
        priority,
        region: sfd.region,
        alert_triggered: alertTriggered,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating subsidy request:', requestError);
      throw new Error('Failed to create subsidy request');
    }

    // Logger l'activité
    await supabase.from('subsidy_request_activities').insert({
      request_id: subsidyRequest.id,
      activity_type: 'request_submitted',
      description: `Subsidy request of ${amount} FCFA submitted`,
      performed_by: user.id
    });

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'subsidy_request',
      category: 'SUBSIDY',
      severity: alertTriggered ? 'warn' : 'info',
      status: 'success',
      details: {
        request_id: subsidyRequest.id,
        sfd_id: sfdId,
        amount,
        priority,
        alert_triggered: alertTriggered,
        current_balance: sfd.subsidy_balance
      }
    });

    // Notifier les admins MEREF
    const { data: merefAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (merefAdmins && merefAdmins.length > 0) {
      const notifications = merefAdmins.map(admin => ({
        user_id: admin.user_id,
        type: 'subsidy_request',
        title: 'Nouvelle demande de subvention',
        message: `${sfd.name} demande ${amount} FCFA${alertTriggered ? ' (ALERTE: Seuil critique atteint)' : ''}`,
        action_url: `/admin/subsidies/${subsidyRequest.id}`
      }));

      await supabase.from('admin_notifications').insert(notifications);
    }

    console.log('Subsidy request created:', subsidyRequest.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: subsidyRequest,
        message: 'Subsidy request submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in request-subsidy:', error);
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
