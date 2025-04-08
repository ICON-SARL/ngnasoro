
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MobileFlow from './pages/MobileFlow';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SfdDashboardPage from './pages/SfdDashboardPage';
import SfdClientsPage from './pages/SfdClientsPage';
import SfdTransactionsPage from './pages/SfdTransactionsPage';
import SfdStatsPage from './pages/SfdStatsPage';
import SfdSettingsPage from './pages/SfdSettingsPage';
import SfdLoansPage from './pages/SfdLoansPage';
import SfdAdminListPage from './pages/SfdAdminListPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSfdList from './pages/SuperAdminSfdList';
import CreditApprovalPage from './pages/CreditApprovalPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';
import MerefSubsidyRequestPage from './pages/MerefSubsidyRequestPage';
import MerefLoanManagementPage from './pages/MerefLoanManagementPage';

function App() {
  const { user, loading } = useAuth();

  // Auth guard pour les routes protégées
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div>Chargement...</div>;
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/agency-dashboard" : "/auth"} />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Routes Mobile */}
      <Route path="/mobile-flow/*" element={
        <ProtectedRoute>
          <MobileFlow />
        </ProtectedRoute>
      } />
      
      {/* Routes Admin SFD */}
      <Route path="/agency-dashboard" element={
        <ProtectedRoute>
          <SfdDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/agency-clients" element={
        <ProtectedRoute>
          <SfdClientsPage />
        </ProtectedRoute>
      } />
      <Route path="/agency-transactions" element={
        <ProtectedRoute>
          <SfdTransactionsPage />
        </ProtectedRoute>
      } />
      <Route path="/agency-stats" element={
        <ProtectedRoute>
          <SfdStatsPage />
        </ProtectedRoute>
      } />
      <Route path="/agency-settings" element={
        <ProtectedRoute>
          <SfdSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/agency-loans" element={
        <ProtectedRoute>
          <SfdLoansPage />
        </ProtectedRoute>
      } />
      <Route path="/agency-admins" element={
        <ProtectedRoute>
          <SfdAdminListPage />
        </ProtectedRoute>
      } />
      <Route path="/meref-subsidy" element={
        <ProtectedRoute>
          <MerefSubsidyRequestPage />
        </ProtectedRoute>
      } />
      <Route path="/meref-loan-management" element={
        <ProtectedRoute>
          <MerefLoanManagementPage />
        </ProtectedRoute>
      } />
      
      {/* Routes Super Admin */}
      <Route path="/super-admin-dashboard" element={
        <ProtectedRoute>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/super-admin-sfds" element={
        <ProtectedRoute>
          <SuperAdminSfdList />
        </ProtectedRoute>
      } />
      <Route path="/credit-approval" element={
        <ProtectedRoute>
          <CreditApprovalPage />
        </ProtectedRoute>
      } />
      
      {/* Page 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
