
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import AgencyDashboard from '@/pages/AgencyDashboard';
import SfdClientsPage from '@/pages/SfdClientsPage';
import LoansPage from '@/pages/LoansPage';
import ClientsPage from '@/pages/ClientsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import SubsidyRequestsPage from '@/pages/SubsidyRequestsPage';
import LoginPage from '@/pages/LoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import MobileLoginPage from '@/pages/MobileLoginPage';
import MobileDashboard from '@/components/mobile/dashboard/MobileDashboard';
import ClientList from '@/components/mobile/sfd-clients/ClientList';
import NewClientPage from '@/pages/NewClientPage';
import ClientDetailsPage from '@/pages/ClientDetailsPage';
import CreateSfdPage from '@/pages/CreateSfdPage';
import SfdAccountsPage from '@/pages/SfdAccountsPage';
import SiteHeader from '@/components/SiteHeader';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/useAuth';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />

      {/* Routes pour l'authentification */}
      <Route path="/sfd/auth" element={<SfdLoginPage />} />
      <Route path="/admin/auth" element={<LoginPage />} />

      {/* Routes pour l'administrateur */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />

      {/* Routes pour l'agence SFD */}
      <Route path="/agency-dashboard" element={<AgencyDashboard />} />
      <Route path="/sfd-clients" element={<SfdClientsPage />} />
      <Route path="/sfd-loans" element={<LoansPage />} />
      <Route path="/sfd-subsidy-requests" element={<SubsidyRequestsPage />} />

      {/* Mobile flow routes */}
      <Route path="/mobile-flow/auth" element={<MobileLoginPage />} />
      <Route path="/mobile-flow/dashboard" element={<MobileDashboard />} />
      <Route path="/mobile-flow/clients" element={<ClientList />} />
      <Route path="/mobile-flow/client/new" element={<NewClientPage />} />
      <Route path="/mobile-flow/client/:clientId" element={<ClientDetailsPage />} />
      <Route path="/mobile-flow/create-sfd" element={<CreateSfdPage />} />
      <Route path="/mobile-flow/sfd-accounts" element={<SfdAccountsPage />} />
    </Routes>
  );
};

const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {isAdmin ? <SuperAdminHeader /> : <SiteHeader />}
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-4">Bienvenue sur le Portail</h1>
        <p className="text-lg text-center text-gray-700">
          Choisissez votre rôle pour accéder à votre tableau de bord.
        </p>
      </div>
    </div>
  );
};

export default App;
