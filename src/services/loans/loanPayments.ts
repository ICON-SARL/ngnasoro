
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Enregistre un paiement de prêt
 */
export const recordLoanPayment = async (
  loanId: string,
  amount: number,
  paymentDate: string = new Date().toISOString(),
  description: string = 'Paiement de prêt'
) => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_date: paymentDate,
        description,
        status: 'completed'
      })
      .select('*')
      .single();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error recording loan payment:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to record loan payment' 
    };
  }
};

/**
 * Envoie un rappel de paiement
 */
export const sendPaymentReminder = async (
  loanId: string,
  clientId: string,
  dueDate: string
) => {
  try {
    // Créer une notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: clientId,
        title: 'Rappel de paiement',
        message: `Votre paiement pour le prêt est dû le ${new Date(dueDate).toLocaleDateString()}`,
        type: 'payment_reminder',
        status: 'unread',
        metadata: { loan_id: loanId, due_date: dueDate }
      });
      
    if (error) throw error;
    
    // Enregistrer l'activité
    await supabase
      .from('loan_activities')
      .insert({
        loan_id: loanId,
        activity_type: 'payment_reminder_sent',
        description: `Rappel de paiement envoyé pour la date du ${new Date(dueDate).toLocaleDateString()}`
      });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending payment reminder:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send payment reminder' 
    };
  }
};

/**
 * Récupère tous les paiements pour un prêt
 */
export const getLoanPayments = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching loan payments:', error);
    throw error;
  }
};
