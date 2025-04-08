
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';

export function useSfdData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Fonction pour récupérer les SFDs avec options de cache optimisées
  const fetchSfds = async () => {
    try {
      console.log("Fetching SFDs from database...");
      
      // Ajouter des paramètres pour contourner le cache
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false })
        .throwOnError();
      
      if (error) {
        console.error("Error fetching SFDs:", error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} SFDs:`, data);
      return data || [];
    } catch (err: any) {
      console.error("Error in fetchSfds:", err);
      throw new Error(`Une erreur est survenue lors de la récupération des SFDs: ${err.message}`);
    }
  };
  
  // Utilisation de React Query avec des paramètres optimisés pour les problèmes de mise à jour
  const {
    data: sfds,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sfds', forceRefresh], // Inclure forceRefresh pour forcer un refetch
    queryFn: fetchSfds,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 5000, // 5 secondes jusqu'à ce que les données soient considérées comme obsolètes
    gcTime: 10000, // 10 secondes en cache
    retry: 3,
    retryDelay: 1000,
    meta: {
      errorMessage: "Impossible de charger la liste des SFDs"
    }
  });

  // Traiter les erreurs en dehors des options useQuery
  useEffect(() => {
    if (isError && error) {
      console.error("Query error:", error);
      toast({
        title: "Erreur de chargement",
        description: error instanceof Error ? error.message : "Impossible de charger la liste des SFDs",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Définir la fonction startPolling de manière optimisée
  const startPolling = useCallback(() => {
    console.log("Starting polling for SFDs...");
    
    // Forcer un refetch immédiat
    queryClient.removeQueries({ queryKey: ['sfds'] });
    setForceRefresh(prev => prev + 1);
    
    // Configurer un polling agressif
    setRefetchInterval(2000); // Refetch toutes les 2 secondes
    
    // Désactiver le polling après un certain temps
    setTimeout(() => {
      console.log("Stopping polling for SFDs");
      setRefetchInterval(false);
    }, 10000); // Arrêter le polling après 10 secondes
  }, [queryClient]);

  // Fonction pour forcer manuellement un refetch complet
  const forceRefetchAll = useCallback(() => {
    console.log("Forcing complete refresh of SFD data...");
    queryClient.removeQueries({ queryKey: ['sfds'] });
    setForceRefresh(prev => prev + 1);
    refetch();
  }, [queryClient, refetch]);

  return {
    sfds: sfds || [],
    isLoading,
    isError,
    error,
    refetch,
    startPolling,
    forceRefetchAll
  };
}
