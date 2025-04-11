
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Auth components
import { AuthProvider } from '@/hooks/auth/AuthContext';
import Router from '@/components/Router';

// Initialize Supabase data structures
import { initializeSupabase } from '@/utils/initSupabase';
initializeSupabase();

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Router />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
