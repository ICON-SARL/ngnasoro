
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
        
        // Vérifier si la connexion réseau est disponible
        if (!navigator.onLine) {
          throw new Error("Pas de connexion internet");
        }
        
        // Ajout d'un délai pour éviter les problèmes de rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Création d'une promesse avec un timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('La requête a expiré')), 15000); // 15 secondes timeout
        });
        
        // La requête Supabase
        const fetchPromise = supabase
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
          
        // Course entre les deux promesses
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Si nous avons atteint ce point, cela signifie que la requête s'est terminée avant le timeout
        const { data, error } = result as any;

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
        
        // Formatter un message d'erreur plus convivial
        let errorMessage = error.message || "Erreur inconnue";
        
        if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError') || 
            errorMessage.includes('net::ERR_') || 
            errorMessage.includes('La requête a expiré') ||
            errorMessage.includes('Pas de connexion internet')) {
          errorMessage = "Problème de connexion au serveur. Veuillez vérifier votre réseau.";
        }
        
        // Afficher une toast pour informer l'utilisateur
        toast({
          title: "Erreur de chargement",
          description: `Impossible de charger les SFDs: ${errorMessage}`,
          variant: "destructive",
        });
        
        // Renvoyer un tableau vide pour éviter les erreurs d'affichage
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Nombre de tentatives
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
