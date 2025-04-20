
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loan } from '@/types/sfdClients';

export function useLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      // Use the updated way to access sfd_id
      const sfdId = user?.sfd_id || user?.app_metadata?.sfd_id;

      if (!sfdId) {
        setError('SFD ID is missing from user data.');
        return;
      }

      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*, sfd_clients(full_name, email)')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Map the raw data to include client_name and ensure all required fields are present
      const formattedLoans: Loan[] = (data || []).map(loan => {
        const loanStatus = loan.status as Loan['status']; // Type assertion for status
        
        return {
          ...loan,
          client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
          reference: loan.id.substring(0, 8), // Create a reference from the ID if it doesn't exist
          subsidy_amount: loan.subsidy_amount || 0,
          subsidy_rate: loan.subsidy_rate || 0,
          id: loan.id,
          client_id: loan.client_id,
          sfd_id: loan.sfd_id,
          amount: loan.amount,
          duration_months: loan.duration_months,
          interest_rate: loan.interest_rate,
          monthly_payment: loan.monthly_payment,
          purpose: loan.purpose,
          status: loanStatus || 'pending',
          created_at: loan.created_at,
        };
      });

      setLoans(formattedLoans);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les prêts de la SFD",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user]);

  return {
    loans,
    isLoading,
    error,
    refetch: fetchLoans,
  };
}
