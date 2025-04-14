
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '../../types/sfd-types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export function useSfdData() {
  const { toast } = useToast();
  const [hasShownNetworkError, setHasShownNetworkError] = useState(false);

  // Reset the network error flag when component unmounts
  useEffect(() => {
    return () => setHasShownNetworkError(false);
  }, []);

  const { 
    data: sfds, 
    isLoading, 
    isError,
    error,
    refetch,
    isRefetching,
    isFetching
  } = useQuery({
    queryKey: ['sfds'],
    queryFn: async (): Promise<Sfd[]> => {
      try {
        console.log('Fetching SFDs...');
        
        // Create an AbortController to manage timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, 15000); // 15 second timeout
        
        // Try to use the edge function first (bypass RLS issues)
        try {
          console.log('Attempting to fetch SFDs using Edge Function...');
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('fetch-sfds');
          
          if (edgeFunctionError) {
            console.error('Edge Function error:', edgeFunctionError);
            throw edgeFunctionError;
          }
          
          if (edgeFunctionData) {
            console.log(`Retrieved ${edgeFunctionData.length} SFDs successfully via Edge Function`);
            
            // Convert to properly typed Sfd objects
            const typedSfds = edgeFunctionData.map(sfd => {
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
          }
        } catch (edgeError) {
          console.warn('Failed to fetch SFDs via Edge Function, falling back to direct query:', edgeError);
        }
        
        // Fallback to direct query if edge function fails
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
          .order('name')
          .abortSignal(abortController.signal);
          
        // Clear the timeout as the request has completed
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Supabase error fetching SFDs:', error);
          throw new Error(`Erreur Supabase: ${error.message}`);
        }
        
        // Check for no data
        if (!data || data.length === 0) {
          console.log('No SFDs found in the database');
          return [];
        }
        
        console.log(`Retrieved ${data.length} SFDs successfully`);
        
        // Convert to properly typed Sfd objects
        const typedSfds = data.map(sfd => {
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
        console.error('Error in fetchSfds:', error);
        
        // Format a more user-friendly error message
        let errorMessage = error.message || "Erreur inconnue";
        
        if (error.name === 'AbortError' || errorMessage.includes('Timeout')) {
          errorMessage = "La requête a pris trop de temps. Veuillez réessayer.";
        } else if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError') || 
            errorMessage.includes('net::ERR_') || 
            errorMessage.includes('timeout') ||
            !navigator.onLine) {
          errorMessage = "Problème de connexion au serveur. Veuillez vérifier votre réseau.";
        } else if (errorMessage.includes('infinite recursion detected')) {
          errorMessage = "Erreur Supabase: infinite recursion detected in policy for relation \"user_sfds\"";
        }
        
        // Only show toast if we haven't shown a network error yet
        if (!hasShownNetworkError) {
          toast({
            title: "Erreur de chargement",
            description: `Impossible de charger les SFDs: ${errorMessage}`,
            variant: "destructive",
          });
          setHasShownNetworkError(true);
        }
        
        throw new Error(errorMessage);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once to avoid endless loops
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 10 * 1000), // Backoff exponential with max 10s
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
    sfds: sfds || [], // Ensure we always return an array
    isLoading: isLoading || isFetching,
    isRefetching,
    isError,
    error,
    refetch
  };
}
