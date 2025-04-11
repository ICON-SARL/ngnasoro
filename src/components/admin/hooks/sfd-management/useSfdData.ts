
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '../../types/sfd-types';
import { useToast } from '@/hooks/use-toast';

export function useSfdData() {
  const { toast } = useToast();

  const { 
    data: sfds, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sfds'],
    queryFn: async (): Promise<Sfd[]> => {
      try {
        console.log('Fetching SFDs...');
        
        // Ajout d'un délai de 500ms pour éviter les problèmes de rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data, error } = await supabase
          .from('sfds')
          .select(`
            id,
            name,
            code,
            region,
            status,
            logo_url,
            contact_email,
            phone,
            description,
            created_at,
            updated_at
          `)
          .order('name');

        if (error) {
          console.error('Error fetching SFDs:', error);
          throw new Error(`Erreur lors de la récupération des SFDs: ${error.message}`);
        }

        console.log(`Retrieved ${data?.length || 0} SFDs successfully`);
        
        // Convert to properly typed Sfd objects with all required fields
        return (data || []).map(sfd => {
          const typedSfd: Sfd = {
            id: sfd.id,
            name: sfd.name,
            code: sfd.code,
            region: sfd.region || undefined,
            status: (sfd.status as 'active' | 'suspended' | 'pending') || 'pending',
            logo_url: sfd.logo_url || undefined,
            contact_email: sfd.contact_email || undefined,
            phone: sfd.phone || undefined,
            description: sfd.description || undefined,
            created_at: sfd.created_at,
            updated_at: sfd.updated_at || undefined,
            // Add properties used in UI that aren't in the database query
            email: sfd.contact_email || undefined,
            address: undefined,
            legal_document_url: undefined,
            subsidy_balance: undefined,
            suspended_at: undefined,
            suspension_reason: undefined,
            client_count: undefined,
            loan_count: undefined,
            total_loan_amount: undefined,
            admin_count: undefined,
            last_admin_login: undefined
          };
          return typedSfd;
        });
      } catch (error: any) {
        console.error('Unhandled error in fetchSfds:', error);
        
        // Afficher une toast pour informer l'utilisateur
        toast({
          title: "Erreur de chargement",
          description: `Impossible de charger les SFDs: ${error.message}`,
          variant: "destructive",
        });
        
        // Renvoyer un tableau vide pour éviter les erreurs d'affichage
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Augmenter le nombre de tentatives
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // Backoff exponentiel
    refetchOnWindowFocus: false
  });

  return {
    sfds: sfds || [],
    isLoading,
    isError,
    error,
    refetch
  };
}
