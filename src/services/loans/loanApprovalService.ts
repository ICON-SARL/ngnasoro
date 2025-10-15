
import { supabase } from "@/integrations/supabase/client";

// Service pour gérer l'approbation, le rejet et le déblocage des prêts
export const loanApprovalService = {
  // Approuver un prêt
  async approveLoan(loanId: string, adminId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Ajouter une activité de prêt
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_approved',
          performed_by: adminId,
          description: 'Prêt approuvé par l\'administrateur'
        });
        
      return data;
    } catch (error) {
      console.error('Error approving loan:', error);
      throw error;
    }
  },
  
  // Rejeter un prêt
  async rejectLoan(loanId: string, adminId: string, reason: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(), // Date de la décision
          approved_by: adminId
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Ajouter une activité de prêt
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_rejected',
          performed_by: adminId,
          description: `Prêt rejeté: ${reason}`
        });
        
      return data;
    } catch (error) {
      console.error('Error rejecting loan:', error);
      throw error;
    }
  },
  
  // Débloquer un prêt (mettre à disposition les fonds)
  async disburseLoan(loanId: string, adminId: string) {
    try {
      // 1. Récupérer les informations du prêt
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      // Vérifier que le prêt est dans l'état 'approved'
      if (loan.status !== 'approved') {
        throw new Error('Le prêt doit être approuvé avant de pouvoir être débloqué');
      }
      
      // subsidy_amount doesn't exist in sfd_loans, skip subsidy logic
      
      // 3. Mettre à jour le statut du prêt à 'active'
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // 4. Ajouter une activité de prêt
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_disbursed',
          performed_by: adminId,
          description: `Prêt débloqué de ${loan.amount} FCFA`
        });
      
      // 5. Créer une transaction dans le compte client
      await supabase
        .from('transactions')
        .insert({
          user_id: adminId, // L'admin qui a effectué l'opération
          // client_id doesn't exist in transactions table
          sfd_id: loan.sfd_id,
          type: 'loan_disbursement',
          amount: loan.amount,
          name: 'Déblocage de prêt',
          description: `Déblocage du prêt #${loanId}`,
          status: 'success'
        });
        
      return data;
    } catch (error) {
      console.error('Error disbursing loan:', error);
      throw error;
    }
  }
};
