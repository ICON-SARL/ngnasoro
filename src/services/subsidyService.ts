
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const subsidyService = {
  async processSubsidyRequest(action: 'approve' | 'reject' | 'details', requestId: string, data?: unknown) {
    try {
      logger.log(`[SubsidyService] Appel à ${action} pour la requête ${requestId}`, data);
      
      // Vérifier que nous avons un token valide
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        logger.error('[SubsidyService] Erreur de session:', sessionError);
        throw new Error('Session non valide: ' + sessionError.message);
      }
      
      if (!sessionData.session) {
        logger.error('[SubsidyService] Aucune session trouvée');
        throw new Error('Veuillez vous connecter pour effectuer cette action');
      }
      
      logger.log(`[SubsidyService] Session valide, utilisateur: ${sessionData.session.user.id}`);
      
      const payload = {
        action,
        requestId,
        data
      };
      
      logger.log(`[SubsidyService] Envoi du payload:`, payload);
      
      const { data: response, error } = await supabase.functions.invoke('process-subsidy-request', {
        body: JSON.stringify(payload),
      });
      
      if (error) {
        logger.error('[SubsidyService] Erreur de fonction edge:', error);
        throw new Error(`Erreur de service: ${error.message}`);
      }
      
      logger.log(`[SubsidyService] Réponse reçue:`, response);
      return response;
    } catch (error) {
      logger.error('[SubsidyService] Erreur non gérée:', error);
      throw error;
    }
  },
  
  async approveSubsidyRequest(requestId: string) {
    logger.log(`[SubsidyService] Approbation de la requête ${requestId}`);
    return this.processSubsidyRequest('approve', requestId);
  },
  
  async rejectSubsidyRequest(requestId: string, comments?: string) {
    logger.log(`[SubsidyService] Rejet de la requête ${requestId}`, comments);
    return this.processSubsidyRequest('reject', requestId, { comments });
  },
  
  async getSubsidyRequestDetails(requestId: string) {
    logger.log(`[SubsidyService] Récupération des détails de la requête ${requestId}`);
    return this.processSubsidyRequest('details', requestId);
  }
};
