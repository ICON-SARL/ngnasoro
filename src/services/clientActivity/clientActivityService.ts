
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: 'account_creation' | 'account_validation' | 'document_upload' | 'account_credit' | 'loan_request' | 'custom';
  description: string;
  performed_at: string;
  performed_by?: string;
}

export const clientActivityService = {
  /**
   * Récupère l'historique des activités d'un client
   */
  async getClientActivities(clientId: string): Promise<ClientActivity[]> {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .order('performed_at', { ascending: false });
        
      if (error) throw error;
      
      return data as ClientActivity[];
    } catch (error) {
      console.error('Erreur lors de la récupération des activités client:', error);
      return [];
    }
  },
  
  /**
   * Ajoute une nouvelle activité pour un client
   */
  async addClientActivity(activity: Omit<ClientActivity, 'id' | 'performed_at'>): Promise<ClientActivity | null> {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .insert({
          client_id: activity.client_id,
          activity_type: activity.activity_type,
          description: activity.description,
          performed_by: activity.performed_by
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as ClientActivity;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une activité client:', error);
      return null;
    }
  },
  
  /**
   * Journalise l'activité de validation de compte
   */
  async logAccountValidation(clientId: string, validatedBy: string): Promise<void> {
    try {
      await this.addClientActivity({
        client_id: clientId,
        activity_type: 'account_validation',
        description: 'Compte client validé',
        performed_by: validatedBy
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de validation de compte:', error);
    }
  },
  
  /**
   * Journalise l'activité de création de compte
   */
  async logAccountCreation(clientId: string, createdBy?: string): Promise<void> {
    try {
      await this.addClientActivity({
        client_id: clientId,
        activity_type: 'account_creation',
        description: 'Nouveau compte client créé',
        performed_by: createdBy
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de création de compte:', error);
    }
  },
  
  /**
   * Journalise l'activité de téléchargement de document
   */
  async logDocumentUpload(clientId: string, documentType: string, uploadedBy?: string): Promise<void> {
    try {
      await this.addClientActivity({
        client_id: clientId,
        activity_type: 'document_upload',
        description: `Document ${documentType} téléchargé`,
        performed_by: uploadedBy
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de téléchargement de document:', error);
    }
  },
  
  /**
   * Journalise l'activité de crédit de compte
   */
  async logAccountCredit(clientId: string, amount: number, creditedBy?: string): Promise<void> {
    try {
      await this.addClientActivity({
        client_id: clientId,
        activity_type: 'account_credit',
        description: `Compte crédité de ${amount} FCFA`,
        performed_by: creditedBy
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation de crédit de compte:', error);
    }
  }
};
