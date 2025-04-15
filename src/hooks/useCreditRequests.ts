
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CreditRequest {
  id: string;
  reference: string;
  sfd_id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  client_name?: string;
  risk_score?: number;
}

export function useCreditRequests() {
  return useQuery({
    queryKey: ['credit-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          id,
          meref_reference,
          sfd_id,
          amount,
          purpose,
          status,
          risk_score,
          created_at,
          sfds:sfd_id (
            name
          ),
          clients:client_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credit requests:', error);
        throw error;
      }

      // Format the data to match our frontend expectations
      const formattedData = data.map(req => ({
        id: req.id,
        reference: req.meref_reference || `REF-${req.id.slice(0, 8)}`,
        sfd_id: req.sfd_id,
        sfd_name: req.sfds?.name || 'Unknown SFD',
        amount: req.amount,
        purpose: req.purpose,
        status: req.status,
        created_at: req.created_at,
        client_name: req.clients?.full_name,
        risk_score: req.risk_score || Math.floor(Math.random() * (100 - 30) + 30), // Fallback score
      }));

      return formattedData;
    },
    meta: {
      errorMessage: "Impossible de récupérer les demandes de crédit"
    }
  });
}
