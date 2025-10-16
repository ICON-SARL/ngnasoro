
import { supabase } from '@/integrations/supabase/client';

export interface SfdDataSyncRequest {
  sfdId: string;
  requestType: 'loans' | 'clients' | 'transactions' | 'subsidies';
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

export interface SfdDataSyncResponse {
  success: boolean;
  data?: any[];
  count?: number;
  message?: string;
  error?: any;
}

export interface MerefApprovalRequest {
  requestId: string;
  sfdId: string;
  requestType: 'loan' | 'subsidy' | 'client_registration';
  status: 'approved' | 'rejected';
  comments?: string;
  reviewedBy: string;
}

export const merefSfdIntegration = {
  // Synchroniser les données entre MEREF et SFD
  async syncSfdData(request: SfdDataSyncRequest): Promise<SfdDataSyncResponse> {
    try {
      const { sfdId, requestType, filters = {}, page = 1, pageSize = 10 } = request;
      
      // Calculer l'offset pour la pagination
      const offset = (page - 1) * pageSize;
      
      let query;
      
      switch (requestType) {
        case 'loans':
          query = supabase
            .from('sfd_loans')
            .select('*, client_id(*)', { count: 'exact' })
            .eq('sfd_id', sfdId)
            .range(offset, offset + pageSize - 1);
          break;
          
        case 'clients':
          query = supabase
            .from('sfd_clients')
            .select('*', { count: 'exact' })
            .eq('sfd_id', sfdId)
            .range(offset, offset + pageSize - 1);
          break;
          
        case 'transactions':
          query = supabase
            .from('transactions')
            .select('*', { count: 'exact' })
            .eq('sfd_id', sfdId)
            .range(offset, offset + pageSize - 1);
          break;
          
        case 'subsidies':
          query = supabase
            .from('sfd_subsidies')
            .select('*', { count: 'exact' })
            .eq('sfd_id', sfdId)
            .range(offset, offset + pageSize - 1);
          break;
          
        default:
          return {
            success: false,
            message: 'Type de données non valide',
          };
      }
      
      // Appliquer des filtres supplémentaires si nécessaire
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        count,
      };
    } catch (error) {
      console.error('Error synchronizing SFD data:', error);
      return {
        success: false,
        error,
        message: 'Erreur lors de la synchronisation des données'
      };
    }
  },
  
  // MEREF approuve ou rejette une demande de SFD
  async processMerefApproval(request: MerefApprovalRequest): Promise<{ success: boolean; message?: string; error?: any }> {
    try {
      const { requestId, requestType, status, comments, reviewedBy } = request;
      
      let table;
      let statusColumnName = 'status';
      
      switch (requestType) {
        case 'loan':
          table = 'sfd_loans';
          break;
        case 'subsidy':
          table = 'subsidy_requests';
          break;
        case 'client_registration':
          table = 'sfd_clients';
          break;
        default:
          return {
            success: false,
            message: 'Type de demande non valide',
          };
      }
      
      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          [statusColumnName]: status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          decision_comments: comments
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // Consigner l'activité dans le journal d'audit
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: reviewedBy,
          action: `${requestType}_${status}`,
          category: 'APPROVAL',
          severity: 'INFO',
          status: 'success',
          details: {
            requestId,
            requestType,
            comments
          }
        });
      
      if (auditError) throw auditError;
      
      // Ajouter une notification pour l'administrateur SFD concerné
      // Cette partie serait implémentée si nous avions déjà la table admin_notifications
      
      return {
        success: true,
        message: `La demande a été ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`
      };
    } catch (error) {
      console.error('Error processing MEREF approval:', error);
      return {
        success: false,
        error,
        message: 'Erreur lors du traitement de l\'approbation'
      };
    }
  },
  
  // Récupérer les statistiques générales d'une SFD
  async getSfdStatistics(sfdId: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      // Récupérer le nombre total de clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfdId);
        
      if (clientsError) throw clientsError;
      
      const clientsCount = clientsData?.length ?? 0;
      
      // Récupérer le nombre de prêts actifs
      const { data: activeLoansData, error: loansError } = await supabase
        .from('sfd_loans')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfdId)
        .eq('status', 'active');
        
      if (loansError) throw loansError;
      
      const activeLoansCount = activeLoansData?.length ?? 0;
      
      // Récupérer le montant total des prêts
      const { data: loanAmountData, error: loanAmountError } = await supabase
        .from('sfd_loans')
        .select('amount')
        .eq('sfd_id', sfdId);
        
      if (loanAmountError) throw loanAmountError;
      
      const totalLoanAmount = loanAmountData?.reduce((acc, loan) => acc + (loan.amount || 0), 0) ?? 0;
      
      // Récupérer le montant des subventions (used_amount column doesn't exist)
      const { data: subsidyData, error: subsidyError } = await supabase
        .from('sfd_subsidies')
        .select('amount')
        .eq('sfd_id', sfdId);
        
      if (subsidyError) throw subsidyError;
      
      const totalSubsidyAmount = subsidyData?.reduce((acc, subsidy) => acc + (subsidy.amount || 0), 0) ?? 0;
      const usedSubsidyAmount = 0; // Column doesn't exist
      
      return {
        success: true,
        data: {
          clientsCount,
          activeLoansCount,
          totalLoanAmount,
          totalSubsidyAmount,
          usedSubsidyAmount,
          subsidyUtilizationRate: totalSubsidyAmount > 0 
            ? Math.round((usedSubsidyAmount / totalSubsidyAmount) * 100) 
            : 0
        }
      };
    } catch (error) {
      console.error('Error fetching SFD statistics:', error);
      return {
        success: false,
        error,
      };
    }
  }
};
