
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  adminEmail: string;
  adminName: string;
  role: string;
  createdBy: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const requestData: NotificationRequest = await req.json();
    const { adminEmail, adminName, role, createdBy } = requestData;

    console.log(`Sending notification to new admin: ${adminEmail}`);

    // Send email notification
    // In a real implementation, you would integrate with an email service like Resend, SendGrid, etc.
    // For now, we'll just simulate sending an email by logging it
    console.log(`Email would be sent to: ${adminEmail}`);
    console.log(`Subject: Bienvenue sur le Portail Administrateur`);
    console.log(`Body: Bonjour ${adminName}, un compte administrateur avec le rôle "${role}" a été créé pour vous par ${createdBy}.`);
    
    // For SMS notification, you would integrate with an SMS service like Twilio, Vonage, etc.
    
    // Optionally log this action in audit_logs table
    await supabase.from('audit_logs').insert({
      action: 'admin_notification_sent',
      category: 'user_management',
      severity: 'info',
      details: { recipient: adminEmail, notification_type: 'email' },
      status: 'success'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully' 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in admin-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
