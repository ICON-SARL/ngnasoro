import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SFDManagementPage from './pages/admin/SFDManagementPage';
import ClientManagementPage from './pages/admin/ClientManagementPage';
import LoanManagementPage from './pages/admin/LoanManagementPage';
import TransactionManagementPage from './pages/admin/TransactionManagementPage';
import SubsidyRequestManagementPage from './pages/admin/SubsidyRequestManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import MobileDashboardPage from './pages/mobile/MobileDashboardPage';
import MobileLoginPage from './pages/mobile/MobileLoginPage';
import MobileRegisterPage from './pages/mobile/MobileRegisterPage';
import MobileProfilePage from './pages/mobile/MobileProfilePage';
import MobileSettingsPage from './pages/mobile/MobileSettingsPage';
import MobileMyLoansPageContainer from './pages/mobile/MobileMyLoansPage';
import LoanApplicationPage from './pages/mobile/LoanApplicationPage';
import ClientLoanStatus from './components/ClientLoanStatus';
import LoanApplicationPageContainer from './pages/LoanApplicationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/sfds" element={<SFDManagementPage />} />
          <Route path="/admin/clients" element={<ClientManagementPage />} />
          <Route path="/admin/loans" element={<LoanManagementPage />} />
          <Route path="/admin/transactions" element={<TransactionManagementPage />} />
          <Route path="/admin/subsidy-requests" element={<SubsidyRequestManagementPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogPage />} />
          
          {/* Mobile Routes */}
          <Route path="/mobile-flow/dashboard" element={<MobileDashboardPage />} />
          <Route path="/mobile-flow/login" element={<MobileLoginPage />} />
          <Route path="/mobile-flow/register" element={<MobileRegisterPage />} />
          <Route path="/mobile-flow/profile" element={<MobileProfilePage />} />
          <Route path="/mobile-flow/settings" element={<MobileSettingsPage />} />
          <Route path="/mobile-flow/my-loans" element={<MobileMyLoansPageContainer />} />
          <Route path="/loans/status" element={<ClientLoanStatus />} />
          <Route path="/loans/apply" element={<LoanApplicationPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
