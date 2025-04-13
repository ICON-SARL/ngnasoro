import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/hooks/use-toast';
import { AuthProvider } from '@/hooks/useAuth';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { JotaiProvider } from 'jotai';

// Import Pages
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/ProfilePage';
import ClientLoansPage from '@/pages/ClientLoansPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import FormPage from '@/pages/FormPage';
import StatsPage from '@/pages/StatsPage';
import SettingsPage from '@/pages/SettingsPage';
import MobileFlowEntryPage from '@/pages/mobile/MobileFlowEntryPage';
import MobileDashboardPage from '@/pages/mobile/MobileDashboardPage';
import MobileProfilePage from '@/pages/mobile/MobileProfilePage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanProcessPage from '@/components/mobile/LoanProcessPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import LoanDisbursementPage from '@/components/mobile/LoanDisbursementPage';
import MobileTransactionsPage from '@/pages/mobile/MobileTransactionsPage';
import MobileGuidesPage from '@/pages/mobile/MobileGuidesPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminMerefFundingPage from '@/pages/AdminMerefFundingPage';
import AdminSfdManagementPage from '@/pages/AdminSfdManagementPage';
import AdminClientsPage from '@/pages/AdminClientsPage';
import AgencyDashboardPage from '@/pages/AgencyDashboardPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SfdSettingsPage from '@/pages/SfdSettingsPage';

export default function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LocalizationProvider>
              <JotaiProvider>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/access-denied" element={<AccessDeniedPage />} />
                  
                  {/* Client Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/loans" element={<ClientLoansPage />} />
                  <Route path="/loans/apply" element={<LoanApplicationPage />} />
                  <Route path="/loans/:loanId" element={<LoanDetailsPage />} />
                  <Route path="/form" element={<FormPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Mobile Flow */}
                  <Route path="/mobile-flow" element={<MobileFlowEntryPage />} />
                  <Route path="/mobile-flow/main" element={<MobileDashboardPage />} />
                  <Route path="/mobile-flow/profile" element={<MobileProfilePage />} />
                  <Route path="/mobile-flow/loans" element={<MobileLoansPage />} />
                  <Route path="/mobile-flow/loan-details/:loanId" element={<LoanDetailsPage />} />
                  <Route path="/mobile-flow/loan-process/:loanId" element={<LoanProcessPage />} />
                  <Route path="/mobile-flow/loan-agreement" element={<LoanAgreementPage />} />
                  <Route path="/mobile-flow/loan-disbursement" element={<LoanDisbursementPage />} />
                  <Route path="/mobile-flow/transactions" element={<MobileTransactionsPage />} />
                  <Route path="/mobile-flow/guides" element={<MobileGuidesPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/meref-funding" element={<AdminMerefFundingPage />} />
                  <Route path="/admin/sfd-management" element={<AdminSfdManagementPage />} />
                  <Route path="/admin/clients" element={<AdminClientsPage />} />
                  
                  {/* SFD Routes */}
                  <Route path="/agency-dashboard" element={<AgencyDashboardPage />} />
                  <Route path="/sfd-loans" element={<SfdLoansPage />} />
                  <Route path="/sfd-settings" element={<SfdSettingsPage />} />
                  <Route path="/sfd-clients" element={<SfdClientsPage />} />
                  <Route path="/sfd-transactions" element={<SfdTransactionsPage />} />
                  <Route path="/sfd-subsidy-requests" element={<SfdSubsidyRequestsPage />} />
                </Routes>
              </JotaiProvider>
            </LocalizationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}
