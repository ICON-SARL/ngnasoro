
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import AdminRoutes from './AdminRoutes';
import SfdRoutes from './SfdRoutes';
import ClientRoutes from './ClientRoutes';
import PublicRoutes from './PublicRoutes';
import { Toaster } from '@/components/ui/toaster';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* SFD routes */}
        <Route path="/sfd/*" element={<SfdRoutes />} />
        
        {/* Client routes */}
        <Route path="/client/*" element={<ClientRoutes />} />
        
        {/* Public routes */}
        <Route path="/*" element={<PublicRoutes />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

// Add default export for the AppRoutes component
export default AppRoutes;
