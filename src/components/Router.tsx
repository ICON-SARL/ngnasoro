
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import MobileLoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanProcessPage from '@/components/mobile/LoanProcessPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import TransferPage from '@/pages/mobile/TransferPage';
import AccountPage from '@/pages/mobile/AccountPage';
import NotificationsPage from '@/pages/mobile/account/NotificationsPage';
import SecurityPage from '@/pages/mobile/account/SecurityPage';
import AboutPage from '@/pages/mobile/account/AboutPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import UsersListPage from '@/pages/admin/UsersListPage';
import UsersManagementPage from '@/pages/UsersManagementPage';
import SfdManagementPage from '@/pages/admin/SfdManagementPage';
import MainDashboard from '@/components/mobile/dashboard/MainDashboard';
import HomeLoanPage from '@/components/mobile/HomeLoanPage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const MobileRouter = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Simple placeholder for routes that don't have components yet
  const PlaceholderPage = ({ title }: { title: string }) => {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="bg-white p-4 shadow-sm mb-4">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-gray-500 text-sm">Cette fonctionnalité est en cours de développement</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>Cette page est en cours de développement et sera bientôt disponible.</p>
          <button 
            onClick={() => toast({
              title: 'Fonctionnalité à venir',
              description: 'Cette fonctionnalité sera disponible prochainement.',
            })}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            En savoir plus
          </button>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main" replace />} />
      <Route path="/main" element={<MainDashboard />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/account/notifications" element={<NotificationsPage />} />
      <Route path="/account/security" element={<SecurityPage />} />
      <Route path="/account/about" element={<AboutPage />} />
      <Route path="/account/terms" element={<PlaceholderPage title="Conditions d'utilisation" />} />
      <Route path="/account/privacy" element={<PlaceholderPage title="Politique de confidentialité" />} />
      <Route path="/account/help" element={<PlaceholderPage title="Centre d'aide" />} />
      <Route path="/transfer" element={<TransferPage />} />
      <Route path="/payment" element={<PlaceholderPage title="Paiement Sécurisé" />} />
      <Route path="/loans" element={<HomeLoanPage />} />
      <Route path="/loan-details/:loanId?" element={<MobileLoanDetailsPage />} />
      <Route path="/my-loans" element={<MobileMyLoansPage />} />
      <Route path="/loan-activity" element={<LoanActivityPage />} />
      <Route path="/loan-process/:loanId?" element={<LoanProcessPage />} />
      <Route path="/loan-agreement" element={<LoanAgreementPage />} />
      <Route path="/loan-application" element={<MobileLoanApplicationPage />} />
      <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      
      {/* Pages de navigation du menu */}
      <Route path="/secure-payment" element={<PlaceholderPage title="Paiement Sécurisé" />} />
      <Route path="/schedule-transfer" element={<PlaceholderPage title="Transferts Programmés" />} />
      <Route path="/multi-sfd" element={<PlaceholderPage title="Gestion Multi-SFD" />} />
      <Route path="/secure-layer" element={<PlaceholderPage title="Sécurité Avancée" />} />
      <Route path="/funds-management" element={<PlaceholderPage title="Gestion des Fonds" />} />
      <Route path="/late-payments" element={<PlaceholderPage title="Alertes Retards" />} />
      <Route path="/contact-advisor" element={<PlaceholderPage title="Contacter un Conseiller" />} />
      <Route path="/faq" element={<PlaceholderPage title="FAQ et Assistance" />} />
      <Route path="/search" element={<PlaceholderPage title="Rechercher" />} />
      
      {/* Routes administrateur */}
      <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/admin/users" element={<UsersListPage />} />
      <Route path="/admin/users/:userId" element={<UsersManagementPage />} />
      <Route path="/sfd-management" element={<SfdManagementPage />} />
      
      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
};

export default MobileRouter;
