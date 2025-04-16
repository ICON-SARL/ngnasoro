
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import { Toaster } from '@/components/ui/toaster';

interface TestProvidersProps {
  children: React.ReactNode;
  queryClient: QueryClient;
  initialEntries?: string[];
}

/**
 * Test providers wrapper component
 * Wraps components with necessary providers for testing
 */
export const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  queryClient, 
  initialEntries = ['/'] 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};
