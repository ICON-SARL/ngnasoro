
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Loan {
  id: string;
  created_at: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  purpose: string;
  client_id: string;
  sfd_id: string;
  status: string;
}

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
        .select('*')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setLoans(data || []);
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
