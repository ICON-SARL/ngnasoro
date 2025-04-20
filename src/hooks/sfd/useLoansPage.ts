
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loan } from '@/types/sfdClients';

export function useLoansPage() {
  const { user } = useAuth();
  
  const fetchLoans = async (): Promise<Loan[]> => {
    try {
      if (!user?.id) {
        return [];
      }
      
      // Get SFD ID associated with the current admin
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (sfdsError) throw sfdsError;
      
      if (!userSfds || userSfds.length === 0) {
        console.error('No SFD associated with this admin user');
        return [];
      }
      
      const sfdId = userSfds[0].sfd_id;
      
      // Fetch loans
      const { data: loans, error: loansError } = await supabase
        .from('sfd_loans')
        .select(`
          id, 
          amount, 
          status, 
          duration_months, 
          interest_rate, 
          purpose,
          created_at,
          subsidy_amount,
          client_id
        `)
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
        
      if (loansError) throw loansError;
      
      if (!loans || loans.length === 0) {
        return [];
      }
      
      // Fetch client names for loans
      const clientIds = loans.map(loan => loan.client_id);
      const { data: clients, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id, full_name')
        .in('id', clientIds);
        
      if (clientsError) throw clientsError;
      
      // Map client names to loans
      const loansWithClientNames: Loan[] = loans.map(loan => {
        const client = clients?.find(c => c.id === loan.client_id);
        return {
          ...loan,
          client_name: client?.full_name || 'Client Inconnu',
          reference: loan.id.substring(0, 8).toUpperCase()
        } as Loan;
      });
      
      return loansWithClientNames;
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-loans'],
    queryFn: fetchLoans,
    enabled: !!user?.id
  });
  
  return {
    loans: data || [],
    isLoading,
    error,
    refetch
  };
}
