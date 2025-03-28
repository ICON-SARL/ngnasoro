
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL') || '';
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { error_type, message, technical_details, status_code, timestamp } = await req.json();
    
    // Log the received error details
    console.log("Critical error alert triggered:", { error_type, message, status_code });
    
    // Prepare message for both Slack and email
    const formattedMessage = `
🚨 *ALERTE ERREUR CRITIQUE* 🚨
*Type*: ${error_type}
*Message*: ${message}
*Code*: ${status_code || 'N/A'}
*Date*: ${timestamp}
${technical_details ? `*Détails techniques*: ${technical_details}` : ''}
    `;
    
    // Send alert to Slack if webhook is configured
    if (SLACK_WEBHOOK_URL) {
      try {
        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: formattedMessage
          })
        });
        
        if (!slackResponse.ok) {
          console.error("Error sending Slack alert:", await slackResponse.text());
        } else {
          console.log("Slack alert sent successfully");
        }
      } catch (slackError) {
        console.error("Failed to send Slack alert:", slackError);
      }
    } else {
      console.log("Slack webhook URL not configured, skipping Slack alert");
    }
    
    // Send email alert if admin email is configured
    // This is a placeholder - in a real implementation, you would use an email service
    // like SendGrid, Mailgun, or AWS SES
    if (ADMIN_EMAIL) {
      console.log(`Would send email to ${ADMIN_EMAIL} with message: ${formattedMessage}`);
      // Placeholder for email sending implementation
    } else {
      console.log("Admin email not configured, skipping email alert");
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in alert-critical-error function:', error);
    
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
