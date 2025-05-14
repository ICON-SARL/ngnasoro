
import React from 'react';
import Router from './components/Router';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/auth/AuthContext';

function App() {
  return (
    <>
      <AuthProvider>
        <Router />
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default App;
