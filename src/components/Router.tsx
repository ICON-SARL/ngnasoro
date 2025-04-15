import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import RoleGuard from '@/components/RoleGuard';
import PermissionGuard from '@/components/PermissionGuard';
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import LoansPage from '@/pages/LoansPage';
import ClientsPage from '@/pages/ClientsPage';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';
import RoleProtectedRoute from '@/components/routes/RoleProtectedRoute';
import RoleTestingPage from '@/pages/RoleTestingPage';
import RoleTestingDetailPage from '@/pages/RoleTestingDetailPage';
import EnhancedPermissionGuard from '@/components/auth/EnhancedPermissionGuard';

// Ajouter l'import pour la page de test des permissions
import PermissionTestPage from '@/pages/PermissionTestPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Dashboard accessible to all authenticated users */}
        <Route 
          path="/dashboard" 
          element={
            <RoleProtectedRoute>
              <DashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* SFD Dashboard accessible only to SFD Admins */}
        <Route 
          path="/sfd/dashboard" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SFD_ADMIN}>
              <SfdDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Admin Dashboard accessible only to Super Admins */}
        <Route 
          path="/admin/dashboard" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* SFD Loans Page accessible only to SFD Admins */}
        <Route 
          path="/sfd/loans" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SFD_ADMIN}>
              <SfdLoansPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Loans Page accessible to both SFD Admins and Super Admins */}
        <Route 
          path="/loans" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SFD_ADMIN}>
              <LoansPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Clients Page accessible only to SFD Admins */}
        <Route 
          path="/clients" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SFD_ADMIN}>
              <ClientsPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Role Testing Page accessible only to Super Admins */}
        <Route 
          path="/role-test" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
              <RoleTestingPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Role Testing Detail Page accessible only to Super Admins */}
        <Route 
          path="/role-test/:userId" 
          element={
            <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
              <RoleTestingDetailPage />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Page de test des permissions */}
        <Route path="/permission-test" element={<PermissionTestPage />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
