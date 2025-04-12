
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
        
        // Simuler un délai pour les tests en environnement de développement
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Utiliser la méthode directe sans timeout complexe
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
        
        // Convert to properly typed Sfd objects and sort priority SFDs
        const typedSfds = (data || []).map(sfd => {
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
        
        // Sort with priority SFDs first
        return sortPrioritySfds(typedSfds);
      } catch (error: any) {
        console.error('Unhandled error in fetchSfds:', error);
        
        // Formatter un message d'erreur plus convivial
        let errorMessage = error.message || "Erreur inconnue";
        
        if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError') || 
            errorMessage.includes('net::ERR_') || 
            errorMessage.includes('timeout') ||
            !navigator.onLine) {
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
    refetchOnWindowFocus: false,
    // Ajouter un fallback pour éviter les erreurs infinies
    placeholderData: []
  });
  
  // Function to prioritize certain SFDs
  const sortPrioritySfds = (sfds: Sfd[]): Sfd[] => {
    const prioritySfdNames = ["premier sfd", "deuxieme", "troisieme"];
    
    return [...sfds].sort((a, b) => {
      const aIsPriority = prioritySfdNames.includes(a.name.toLowerCase());
      const bIsPriority = prioritySfdNames.includes(b.name.toLowerCase());
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      if (aIsPriority && bIsPriority) {
        return prioritySfdNames.indexOf(a.name.toLowerCase()) - prioritySfdNames.indexOf(b.name.toLowerCase());
      }
      
      return a.name.localeCompare(b.name);
    });
  };

  return {
    sfds: sfds || [],
    isLoading,
    isError,
    error,
    refetch
  };
}
