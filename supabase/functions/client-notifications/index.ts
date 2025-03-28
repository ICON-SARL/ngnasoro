
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
  type: string;
  recipient_id: string;
  loan_id?: string;
  amount?: number;
  payment_date?: string;
  message?: string;
  phone_number?: string; // For SMS notifications
}

const sendSmsNotification = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
  
  // This is a placeholder for an actual SMS service integration
  // You would integrate with a service like Twilio, Vonage, or a local SMS gateway
  
  // For demonstration purposes, we're just logging the message
  // In a real implementation, you would make an API call to your SMS provider
  
  return true;
};

const sendNotification = async (req: Request) => {
  try {
    const { type, recipient_id, loan_id, amount, payment_date, message, phone_number } = await req.json() as NotificationRequest;
    
    if (!type || !recipient_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Create notification in database
    const { data: notificationData, error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        type,
        recipient_id,
        title: type.includes('approved') 
          ? 'Prêt approuvé' 
          : type.includes('payment') 
            ? 'Rappel de paiement' 
            : 'Notification',
        message: message || 'Nouvelle notification',
        read: false,
        action_link: loan_id ? `/loans/${loan_id}` : undefined,
      })
      .select()
      .single();
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }
    
    // If phone number is provided, send SMS
    if (phone_number) {
      let smsMessage = message || '';
      
      // Generate default message if none provided
      if (!smsMessage) {
        if (type.includes('approved')) {
          smsMessage = `Votre demande de prêt de ${amount?.toLocaleString('fr-FR')} FCFA a été approuvée.`;
        } else if (type.includes('payment')) {
          smsMessage = `Rappel: Votre paiement de ${amount?.toLocaleString('fr-FR')} FCFA est dû pour le ${payment_date}.`;
        }
      }
      
      await sendSmsNotification(phone_number, smsMessage);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        notification: notificationData
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in client-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Route the request based on method
  if (req.method === 'POST') {
    return sendNotification(req);
  }
  
  // Default response for unsupported methods
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
});
