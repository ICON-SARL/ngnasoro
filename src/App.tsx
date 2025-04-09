
import React from 'react';
import { AuthProvider } from './hooks/auth/AuthContext';
import { ToasterProvider } from './components/ToasterProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { LocalizationProvider } from './contexts/LocalizationContext';
import AppRoutes from './routes';
import './App.css';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="meref-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocalizationProvider>
            <ToasterProvider />
            <div className="w-full min-h-screen">
              <AppRoutes />
            </div>
          </LocalizationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
