
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

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
    staleTime: 0, // Toujours considérer les données comme obsolètes pour forcer le refetch
    gcTime: 0, // Updated from cacheTime (renamed in React Query v5)
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

  // Effet pour désactiver l'intervalle de refetch après un certain temps
  useEffect(() => {
    if (refetchInterval) {
      const timer = setTimeout(() => {
        setRefetchInterval(false);
      }, 30000); // Continuer le polling pendant 30 secondes
      
      return () => clearTimeout(timer);
    }
  }, [refetchInterval]);

  // Fonction pour forcer un refetch périodique temporaire (utile après des opérations de création)
  const startPolling = () => {
    console.log("Starting polling for SFDs...");
    setRefetchInterval(1000); // Refetch toutes les 1 seconde (plus fréquent)
    
    // Force an immediate refetch
    queryClient.removeQueries({ queryKey: ['sfds'] });
    refetch();
  };

  return {
    sfds: sfds || [],
    isLoading,
    isError,
    error,
    refetch,
    startPolling
  };
}
