
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sfdCache } from '@/utils/cacheUtils';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch and cache SFD data
 * This hook optimizes performance by caching frequently accessed data
 */
export function useCachedSfdData(sfdId: string | undefined, queryKey: string, fetchFunction: () => Promise<any>) {
  const queryClient = useQueryClient();
  const [isCacheHit, setIsCacheHit] = useState(false);
  const { toast } = useToast();
  
  // Debug function to check cache state
  const debugCache = useCallback(() => {
    console.log(`[useCachedSfdData] Debug cache for ${queryKey}`);
    sfdCache.debug();
  }, [queryKey]);
  
  // Check cache before fetching
  useEffect(() => {
    if (!sfdId) return;
    
    const cachedData = sfdCache.get(sfdId, queryKey);
    if (cachedData) {
      // If data is in cache, update React Query cache
      console.log(`[useCachedSfdData] Cache hit for ${queryKey} in SFD ${sfdId}`, {
        ttl: sfdCache.ttl(sfdId, queryKey)
      });
      queryClient.setQueryData([queryKey, sfdId], cachedData);
      setIsCacheHit(true);
    } else {
      console.log(`[useCachedSfdData] Cache miss for ${queryKey} in SFD ${sfdId}`);
      setIsCacheHit(false);
    }
  }, [sfdId, queryKey, queryClient]);
  
  // Use React Query to fetch data with updated options
  const query = useQuery({
    queryKey: [queryKey, sfdId],
    queryFn: fetchFunction,
    enabled: !!sfdId && !isCacheHit,
    staleTime: 5 * 60 * 1000, // 5 minutes until data is considered stale
    // Using callbacks instead of direct onSuccess
    meta: {
      onQuerySuccess: (data: any) => {
        // Update our cache on successful fetch
        if (sfdId) {
          console.log(`[useCachedSfdData] Updating cache for ${queryKey} in SFD ${sfdId}`);
          sfdCache.set(sfdId, queryKey, data);
        }
      }
    }
  });
  
  // Handle onSuccess callback separately
  useEffect(() => {
    if (query.data && sfdId) {
      sfdCache.set(sfdId, queryKey, query.data);
    }
  }, [query.data, sfdId, queryKey]);
  
  return {
    ...query,
    isCacheHit,
    // Force refetch and update cache
    forceRefresh: async () => {
      if (!sfdId) return null;
      
      toast({
        title: "Actualisation des données",
        description: "Les données sont en cours d'actualisation...",
      });
      
      console.log(`[useCachedSfdData] Forcing refresh for ${queryKey} in SFD ${sfdId}`);
      setIsCacheHit(false);
      sfdCache.refresh(sfdId, queryKey);
      const data = await query.refetch();
      
      toast({
        title: "Données actualisées",
        description: "Les données ont été rafraîchies avec succès",
      });
      
      return data.data;
    },
    // Clear cache for this query
    clearCache: () => {
      if (!sfdId) return;
      console.log(`[useCachedSfdData] Clearing cache for ${queryKey} in SFD ${sfdId}`);
      sfdCache.delete(sfdId, queryKey);
      setIsCacheHit(false);
    },
    // Debug cache state
    debugCache
  };
}
