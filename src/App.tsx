
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ngnasoro-theme">
      <AppRoutes />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
