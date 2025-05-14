
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loan } from '@/types/sfdClients';

export function useClientLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available");
        return [];
      }

      console.log("Fetching loans for user ID:", user.id);
      
      try {
        // First method: Try to get client IDs for this user
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', user.id);

        if (clientsError) {
          console.error('Failed to fetch client data:', clientsError);
        }

        let loans = [];

        // If we found client IDs, use them to fetch loans
        if (clientsData && clientsData.length > 0) {
          console.log("Found client IDs:", clientsData.map(c => c.id));
          const clientIds = clientsData.map(client => client.id);

          const { data: clientLoans, error: loansError } = await supabase
            .from('sfd_loans')
            .select(`*, sfds:sfd_id(name, logo_url)`)
            .in('client_id', clientIds)
            .order('created_at', { ascending: false });

          if (loansError) {
            console.error('Failed to fetch loans by client IDs:', loansError);
          } else if (clientLoans && clientLoans.length > 0) {
            console.log("Found loans by client IDs:", clientLoans.length);
            loans = clientLoans;
          }
        } else {
          console.log("No client IDs found for user, trying alternative methods");
        }

        // If no loans found by client IDs, try getting client records first
        if (loans.length === 0) {
          const { data: clientRecords, error: clientRecordsError } = await supabase
            .from('sfd_clients')
            .select('*')
            .eq('user_id', user.id);

          if (clientRecordsError) {
            console.error('Failed to fetch client records:', clientRecordsError);
          } else if (clientRecords && clientRecords.length > 0) {
            console.log("Found client records:", clientRecords.length);
            
            // Use these client records to fetch loans
            const clientIds = clientRecords.map(client => client.id);
            
            const { data: clientLoans, error: loansError } = await supabase
              .from('sfd_loans')
              .select(`*, sfds:sfd_id(name, logo_url)`)
              .in('client_id', clientIds)
              .order('created_at', { ascending: false });

            if (loansError) {
              console.error('Failed to fetch loans by client records:', loansError);
            } else if (clientLoans && clientLoans.length > 0) {
              console.log("Found loans by client records:", clientLoans.length);
              loans = clientLoans;
            }
          }
        }

        return loans as Loan[];
      } catch (error) {
        console.error('Error fetching client loans:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
}
