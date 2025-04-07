
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Import your routes
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SfdLoginPage from './pages/SfdLoginPage';
import LogoutPage from './pages/LogoutPage';
import SupportPage from './pages/SupportPage';
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
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/logout" element={<LogoutPage />} />
        <Route path="/sfd/auth" element={<SfdLoginPage />} />
        <Route path="/support" element={<SupportPage />} />
        {/* Add your other routes here */}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
