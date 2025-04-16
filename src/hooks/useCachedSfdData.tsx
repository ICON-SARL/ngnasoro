
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sfdCache } from '@/utils/cacheUtils';

/**
 * Hook to fetch and cache SFD data
 * This hook optimizes performance by caching frequently accessed data
 */
export function useCachedSfdData(sfdId: string | undefined, queryKey: string, fetchFunction: () => Promise<any>) {
  const queryClient = useQueryClient();
  const [isCacheHit, setIsCacheHit] = useState(false);
  
  // Check cache before fetching
  useEffect(() => {
    if (!sfdId) return;
    
    const cachedData = sfdCache.get(sfdId, queryKey);
    if (cachedData) {
      // If data is in cache, update React Query cache
      queryClient.setQueryData([queryKey, sfdId], cachedData);
      setIsCacheHit(true);
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
      setIsCacheHit(false);
      const data = await query.refetch();
      return data.data;
    },
    // Clear cache for this query
    clearCache: () => {
      if (!sfdId) return;
      sfdCache.delete(sfdId, queryKey);
      setIsCacheHit(false);
    }
  };
}
