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

    const { sfdId, openingBalance, notes } = await req.json();

    console.log('Opening cash session:', { sfdId, openingBalance, userId: user.id });

    // Vérifier que l'utilisateur est un cashier
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'cashier')
      .single();

    if (!userRole) {
      throw new Error('Only cashiers can open cash sessions');
    }

    // Vérifier que le cashier appartient au SFD
    const { data: userSfd } = await supabase
      .from('user_sfds')
      .select('sfd_id')
      .eq('user_id', user.id)
      .eq('sfd_id', sfdId)
      .single();

    if (!userSfd) {
      throw new Error('You can only open cash sessions for your SFD');
    }

    // Vérifier qu'il n'y a pas de session ouverte aujourd'hui pour ce cashier
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSession } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('sfd_id', sfdId)
      .eq('cashier_id', user.id)
      .eq('session_date', today)
      .eq('status', 'open')
      .maybeSingle();

    if (existingSession) {
      throw new Error('You already have an open cash session for today');
    }

    // Vérifier le solde d'ouverture est cohérent
    if (openingBalance < 0) {
      throw new Error('Opening balance cannot be negative');
    }

    // Créer la session
    const { data: session, error: sessionError } = await supabase
      .from('cash_sessions')
      .insert({
        sfd_id: sfdId,
        cashier_id: user.id,
        session_date: today,
        opening_balance: openingBalance,
        status: 'open',
        notes
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating cash session:', sessionError);
      throw new Error('Failed to create cash session');
    }

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'cash_session_opened',
      category: 'CASH',
      severity: 'info',
      status: 'success',
      details: {
        session_id: session.id,
        sfd_id: sfdId,
        opening_balance: openingBalance,
        session_date: today
      }
    });

    // Notifier les superviseurs
    const { data: supervisors } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'supervisor');

    if (supervisors && supervisors.length > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const notifications = supervisors.map(supervisor => ({
        user_id: supervisor.user_id,
        type: 'cash_session_opened',
        title: 'Caisse ouverte',
        message: `${profile?.full_name || 'Un caissier'} a ouvert une caisse avec ${openingBalance} FCFA`,
        action_url: `/sfd/cash-sessions/${session.id}`
      }));

      await supabase.from('admin_notifications').insert(notifications);
    }

    console.log('Cash session opened successfully:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: session,
        message: 'Cash session opened successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in open-cash-session:', error);
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
