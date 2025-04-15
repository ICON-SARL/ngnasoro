
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface NotificationRequest {
  sfd_id: string;
  loan_plan_id: string;
  loan_plan_name: string;
  sfd_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  try {
    const { sfd_id, loan_plan_id, loan_plan_name, sfd_name } = await req.json() as NotificationRequest;
    
    if (!sfd_id || !loan_plan_id) {
      return new Response(
        JSON.stringify({ error: 'Paramètres manquants' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Get all users associated with this SFD
    const { data: sfdUsers, error: usersError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfd_id);
      
    if (usersError) throw usersError;
    
    // Create a notification for each user
    const notifications = sfdUsers?.map(user => ({
      recipient_id: user.user_id,
      title: 'Nouveau plan de prêt disponible',
      message: `${sfd_name} a publié un nouveau plan de prêt: ${loan_plan_name}. Consultez l'application pour plus de détails.`,
      type: 'loan_plan',
      read: false,
      action_link: `/mobile-flow/loan-plans?sfd=${sfd_id}`
    })) || [];
    
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert(notifications);
        
      if (notificationError) throw notificationError;
    }
    
    // For email notifications, we could integrate with an email service here
    // For demonstration, we'll just log what would be sent
    console.log(`Emails would be sent to ${sfdUsers?.length || 0} users about new loan plan ${loan_plan_name}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications envoyées à ${notifications.length} utilisateurs`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Erreur dans loan-plan-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
