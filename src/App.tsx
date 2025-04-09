
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/auth/AuthContext';
import { ToasterProvider } from './components/ToasterProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import AppRoutes from './routes';
import './App.css';

// Créer un client de requête pour React Query
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
        <Router>
          <AuthProvider>
            <ToasterProvider />
            <AppRoutes />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
