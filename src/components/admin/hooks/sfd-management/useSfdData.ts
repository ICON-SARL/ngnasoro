
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
      
      console.log(`Successfully fetched ${data?.length || 0} SFDs`);
      return data || [];
    } catch (err: any) {
      console.error("Error in fetchSfds:", err);
      throw new Error(`Une erreur est survenue lors de la récupération des SFDs: ${err.message}`);
    }
  };
  
  // Utilisation de React Query pour gérer les données
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
    staleTime: 30000, // 30 secondes
    retry: 2,
    meta: {
      onError: (err: any) => {
        console.error("Query error:", err);
        toast({
          title: "Erreur de chargement",
          description: err.message || "Impossible de charger la liste des SFDs",
          variant: "destructive",
        });
      }
    }
  });

  // Effet pour désactiver l'intervalle de refetch après un certain temps
  useEffect(() => {
    if (refetchInterval) {
      const timer = setTimeout(() => {
        setRefetchInterval(false);
      }, 10000); // Arrêter après 10 secondes
      
      return () => clearTimeout(timer);
    }
  }, [refetchInterval]);

  // Fonction pour forcer un refetch périodique temporaire (utile après des opérations de création)
  const startPolling = () => {
    setRefetchInterval(3000); // Refetch toutes les 3 secondes
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
