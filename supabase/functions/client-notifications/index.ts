
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
  phone_number?: string; // Pour les notifications SMS
}

const sendSmsNotification = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`SMS serait envoyé à ${phoneNumber}: ${message}`);
  
  // Ici nous pourrions intégrer un service SMS malien comme Orange Mali ou Malitel
  // Pour l'instant, c'est juste un placeholder pour une intégration future
  
  // Pour une implémentation réelle, nous ferions un appel API à un fournisseur SMS local
  
  return true;
};

const sendNotification = async (req: Request) => {
  try {
    const { type, recipient_id, loan_id, amount, payment_date, message, phone_number } = await req.json() as NotificationRequest;
    
    if (!type || !recipient_id) {
      return new Response(
        JSON.stringify({ error: 'Informations requises manquantes' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Créer la notification dans la base de données
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
      console.error('Erreur lors de la création de la notification:', notificationError);
      throw notificationError;
    }
    
    // Si un numéro de téléphone est fourni, envoyer un SMS
    if (phone_number) {
      let smsMessage = message || '';
      
      // Générer un message par défaut si aucun n'est fourni
      if (!smsMessage) {
        if (type.includes('approved')) {
          smsMessage = `Votre demande de prêt de ${amount?.toLocaleString('fr-ML')} FCFA a été approuvée.`;
        } else if (type.includes('payment')) {
          smsMessage = `Rappel: Votre paiement de ${amount?.toLocaleString('fr-ML')} FCFA est dû pour le ${payment_date}.`;
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
    console.error('Erreur dans client-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Router la requête selon la méthode
  if (req.method === 'POST') {
    return sendNotification(req);
  }
  
  // Réponse par défaut pour les méthodes non supportées
  return new Response(
    JSON.stringify({ error: 'Méthode non autorisée' }),
    { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
});
