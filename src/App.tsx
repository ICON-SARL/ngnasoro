
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MobileFlow from '@/pages/MobileFlow';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AgencyDashboard from '@/pages/AgencyDashboard';
import ClientsPage from '@/pages/ClientsPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';
import LoansPage from '@/pages/LoansPage';
import TransactionsPage from '@/pages/TransactionsPage';
import LoanAgreementManagement from '@/components/sfd/LoanAgreementManagement';
import SFDSelector from '@/pages/SFDSelector';
import AuthUI from '@/components/AuthUI';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth" element={<AuthUI />} />
          <Route path="/mobile-flow/*" element={<MobileFlow />} />
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/agency-dashboard" element={<AgencyDashboard />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/agreements" element={<LoanAgreementManagement />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/sfd-selector" element={<SFDSelector />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
