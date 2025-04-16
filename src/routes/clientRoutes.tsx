
import React from 'react';
import { Route } from 'react-router-dom';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import TransferPage from '@/pages/mobile/TransferPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import PaymentPage from '@/pages/mobile/PaymentPage';
import AccountPage from '@/pages/mobile/AccountPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/hooks/auth/types';

export const ClientRoutes = () => {
  return (
    <>
      <Route path="/mobile-flow/main" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <MobileMainPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/transfer" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <TransferPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/loans" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <MobileLoansPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/my-loans" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <MobileMyLoansPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/loan-details" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <LoanDetailsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/payment" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <PaymentPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/account" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <AccountPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/sfd-adhesion/:sfdId" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <SfdAdhesionPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path="/mobile-flow/*" element={
        <ProtectedRoute>
          <RoleGuard requiredRole={UserRole.Client}>
            <MobileFlowPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
    </>
  );
};
