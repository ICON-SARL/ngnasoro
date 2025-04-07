import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Import your routes
import SuperAdminDashboard from './pages/SuperAdminDashboard';
// ... import other pages as needed

// Auth context provider
import { AuthProvider } from './hooks/auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppWithFooter />
    </AuthProvider>
  );
}

function AppWithFooter() {
  return (
    <>
      <Routes>
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
        {/* Add your other routes here */}
      </Routes>
      <Toaster /> {/* Added properly here */}
    </>
  );
}

export default App;
