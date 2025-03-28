
import { supabase } from "@/integrations/supabase/client";
import { Loan } from "@/types/sfdClients";

// Core loan operations with pagination and performance improvements
export const loanService = {
  // Get all loans for the current SFD with pagination
  async getSfdLoans(page = 1, pageSize = 20, filters = {}) {
    try {
      let query = supabase
        .from('sfd_loans')
        .select('*', { count: 'exact' });
        
      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      
      if (filters.fromDate && filters.toDate) {
        query = query.gte('created_at', filters.fromDate).lte('created_at', filters.toDate);
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      
      return {
        loans: data as unknown as Loan[],
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      };
    } catch (error) {
      console.error('Error fetching loans:', error);
      return {
        loans: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  },
  
  // Get a specific loan by ID
  async getLoanById(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          client:client_id(id, full_name, phone, email),
          loan_activities(*)
        `)
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
  },
  
  // Count loans by status for dashboard statistics
  async countLoansByStatus(sfdId: string) {
    try {
      const { data, error } = await supabase
        .rpc('count_loans_by_status', { p_sfd_id: sfdId });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error counting loans by status:', error);
      return {
        pending: 0,
        approved: 0,
        active: 0,
        completed: 0,
        rejected: 0
      };
    }
  },
  
  // Search loans - optimized for performance
  async searchLoans(searchTerm: string, limit = 5) {
    try {
      const { data, error } = await supabase
        .rpc('search_loans', { 
          search_term: searchTerm,
          result_limit: limit
        });
      
      if (error) throw error;
      return data as unknown as Loan[];
    } catch (error) {
      console.error('Error searching loans:', error);
      return [];
    }
  }
};
