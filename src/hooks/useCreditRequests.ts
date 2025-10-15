
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
      // First try to fetch from the credit-manager edge function if available
      try {
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('credit-manager', {
          body: JSON.stringify({ action: 'get_applications' })
        });
        
        if (!edgeFunctionError && edgeFunctionData) {
          console.log('Successfully retrieved data from edge function:', edgeFunctionData);
          return edgeFunctionData as CreditRequest[];
        }
      } catch (err) {
        console.warn('Edge function not available, falling back to direct DB query:', err);
      }
      
      // Fall back to direct query if edge function fails
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          id,
          sfd_id,
          amount,
          purpose,
          status,
          created_at,
          client_id
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credit requests:', error);
        throw error;
      }

      // Fetch SFDs and clients separately
      const sfdIds = [...new Set(data.map(r => r.sfd_id))];
      const clientIds = [...new Set(data.map(r => r.client_id))];

      const { data: sfds } = await supabase
        .from('sfds')
        .select('id, name')
        .in('id', sfdIds);

      const { data: clients } = await supabase
        .from('sfd_clients')
        .select('id, full_name')
        .in('id', clientIds);

      const sfdMap = new Map(sfds?.map(s => [s.id, s.name]));
      const clientMap = new Map(clients?.map(c => [c.id, c.full_name]));

      // Format the data to match our frontend expectations and ensure correct typing
      const formattedData: CreditRequest[] = data.map(req => ({
        id: req.id,
        reference: `REF-${req.id.slice(0, 8)}`,
        sfd_id: req.sfd_id,
        sfd_name: sfdMap.get(req.sfd_id) || 'Unknown SFD',
        amount: req.amount,
        purpose: req.purpose,
        status: (req.status === 'pending' || req.status === 'approved' || req.status === 'rejected') 
          ? req.status 
          : 'pending',
        created_at: req.created_at,
        client_name: clientMap.get(req.client_id),
        risk_score: Math.floor(Math.random() * (100 - 30) + 30),
      }));

      return formattedData;
    },
    meta: {
      errorMessage: "Impossible de récupérer les demandes de crédit"
    }
  });
}
