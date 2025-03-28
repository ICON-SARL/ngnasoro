
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import * as jose from "https://esm.sh/jose@4.14.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-default-jwt-secret-for-development';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    // Extract user_id from token
    const userId = payload.sub;
    if (!userId) {
      throw new Error('Token does not contain a valid user ID');
    }

    console.log(`Fetching notifications for user: ${userId}`);

    // Get the URL query parameters
    const url = new URL(req.url);
    const lastFetched = url.searchParams.get('last_fetched');
    
    // Build query for loan status changes
    let query = supabase
      .from('loan_activities')
      .select(`
        id,
        activity_type,
        description,
        performed_at,
        loan_id,
        loan:loan_id(
          id,
          amount,
          status,
          purpose,
          client_id,
          sfd_id,
          sfd:sfd_id(name)
        )
      `)
      .eq('loan:client_id', userId)
      .order('performed_at', { ascending: false })
      .limit(20);
    
    // Add time filter if last_fetched is provided
    if (lastFetched) {
      query = query.gt('performed_at', lastFetched);
    }
    
    // Execute query
    const { data: activities, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform activities into notifications
    const notifications = activities.map(activity => {
      // Skip activities where loan is null (should not happen with proper joins)
      if (!activity.loan) return null;
      
      // Filter out null notifications
      const notificationType = getNotificationType(activity.activity_type);
      
      return {
        id: activity.id,
        type: notificationType,
        title: getNotificationTitle(activity.activity_type, activity.loan),
        message: activity.description,
        timestamp: activity.performed_at,
        loan_id: activity.loan_id,
        loan_status: activity.loan.status,
        sfd_name: activity.loan.sfd.name,
        amount: activity.loan.amount,
        read: false
      };
    }).filter(notification => notification !== null);

    // Log successful request
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'fetch_notifications',
      category: 'data_access',
      severity: 'info',
      status: 'success',
      details: { 
        endpoint: '/api/notifications',
        notification_count: notifications.length
      },
      target_resource: `user:${userId}:notifications`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: notifications,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in notifications function:', error);

    // Determine appropriate error status
    let status = 500;
    if (error.message.includes('Authorization') || error.message.includes('Token')) {
      status = 401;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

// Helper functions for notification formatting
function getNotificationType(activityType: string): string {
  switch (activityType) {
    case 'loan_created':
      return 'loan_application';
    case 'loan_approved':
      return 'loan_approved';
    case 'loan_rejected':
      return 'loan_rejected';
    case 'loan_disbursed':
      return 'loan_disbursed';
    case 'payment_recorded':
      return 'payment_confirmation';
    default:
      return 'loan_status_update';
  }
}

function getNotificationTitle(activityType: string, loan: any): string {
  switch (activityType) {
    case 'loan_created':
      return `Demande de prêt reçue (${loan.amount} FCFA)`;
    case 'loan_approved':
      return 'Prêt approuvé !';
    case 'loan_rejected':
      return 'Demande de prêt refusée';
    case 'loan_disbursed':
      return `Décaissement effectué (${loan.amount} FCFA)`;
    case 'payment_recorded':
      return 'Paiement enregistré';
    default:
      return 'Mise à jour de statut';
  }
}
