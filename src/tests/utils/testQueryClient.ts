
import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a QueryClient configured for testing
 */
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});
