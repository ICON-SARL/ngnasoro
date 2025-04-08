
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';

export function useSfdData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);

  // Fonction pour récupérer les SFDs
  const fetchSfds = async () => {
    try {
      console.log("Fetching SFDs from database...");
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false });
      
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
  
  // Utilisation de React Query pour gérer les données avec des paramètres plus agressifs
  const {
    data: sfds,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sfds'],
    queryFn: fetchSfds,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Considérer les données comme obsolètes après 30 secondes
    gcTime: 60000, // Garder en cache pendant 1 minute
    retry: 2,
    meta: {
      errorMessage: "Impossible de charger la liste des SFDs"
    }
  });

  // Handle errors outside the useQuery options
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

  // Définir la fonction startPolling en dehors des effets pour pouvoir l'exporter
  const startPolling = useCallback(() => {
    console.log("Starting polling for SFDs...");
    setRefetchInterval(2000); // Refetch toutes les 2 secondes
    
    // Force an immediate refetch
    queryClient.removeQueries({ queryKey: ['sfds'] });
    refetch();
    
    // Désactiver le polling après un certain temps
    setTimeout(() => {
      console.log("Stopping polling for SFDs");
      setRefetchInterval(false);
    }, 10000); // Arrêter le polling après 10 secondes
  }, [queryClient, refetch]);

  return {
    sfds: sfds || [],
    isLoading,
    isError,
    error,
    refetch,
    startPolling
  };
}
