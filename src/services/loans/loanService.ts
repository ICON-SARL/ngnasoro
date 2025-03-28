
import { supabase } from "@/integrations/supabase/client";
import { Loan } from "@/types/sfdClients";

// Core loan operations
export const loanService = {
  // Get all loans for the current SFD user
  async getSfdLoans() {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as Loan[];
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  },
  
  // Get a specific loan by ID
  async getLoanById(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('id', loanId)
        .single();
        
      if (error) throw error;
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error fetching loan details:', error);
      return null;
    }
  },
  
  // Create a new loan
  async createLoan(loanData: {
    client_id: string;
    sfd_id: string;
    amount: number;
    duration_months: number;
    interest_rate: number;
    purpose: string;
    monthly_payment: number;
    subsidy_amount?: number;
    subsidy_rate?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .insert({
          client_id: loanData.client_id,
          sfd_id: loanData.sfd_id,
          amount: loanData.amount,
          duration_months: loanData.duration_months,
          interest_rate: loanData.interest_rate,
          purpose: loanData.purpose,
          monthly_payment: loanData.monthly_payment,
          status: 'pending',
          subsidy_amount: loanData.subsidy_amount || 0,
          subsidy_rate: loanData.subsidy_rate || 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan creation activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: data.id,
          activity_type: 'loan_created',
          description: `Prêt de ${loanData.amount} FCFA créé pour le client`
        });
        
      return data as unknown as Loan;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }
};
