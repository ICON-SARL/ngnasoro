
import { useState, useEffect } from 'react';
import { SfdData } from './types';

// This hook is for fetching SFD data from an external source
export function useSfdDataFetcher(userId: string | undefined) {
  const [data, setData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSfdData = async () => {
      if (!userId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockData: SfdData[] = [
          {
            id: 'sfd1',
            name: 'SFD One',
            code: 'SFD1',
            status: 'active',
            token: 'token1',
            lastFetched: new Date()
          },
          {
            id: 'sfd2',
            name: 'SFD Two',
            code: 'SFD2',
            status: 'active',
            token: 'token2',
            lastFetched: new Date()
          }
        ];

        setData(mockData);
      } catch (err) {
        console.error('Error fetching SFD data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch SFD data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfdData();
  }, [userId]);

  return { data, isLoading, error };
}
