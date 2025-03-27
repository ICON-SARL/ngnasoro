
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileHeader from '@/components/mobile/MobileHeader';
import { MainDashboard } from '@/components/mobile/dashboard';
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import { useAuth } from '@/hooks/useAuth';
import SecurePaymentTab from '@/components/mobile/secure-payment';

const MobileFlowPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  // Cette fonction extrait le sous-chemin du path /mobile-flow/X
  const getSubPath = () => {
    const path = location.pathname;
    // Si c'est exactement /mobile-flow ou /mobile-flow/
    if (path === '/mobile-flow' || path === '/mobile-flow/') {
      return 'main';
    }
    
    // Sinon extraire le sous-chemin
    const parts = path.split('/');
    if (parts.length >= 3) {
      return parts[2]; // /mobile-flow/X -> X
    }
    
    return 'main';
  };
  
  const subPath = getSubPath();
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // Rediriger les chemins inconnus vers le dashboard
  useEffect(() => {
    const validPaths = ['main', 'profile', 'create-sfd', 'secure-payment', 'sfd-clients'];
    if (!validPaths.includes(subPath)) {
      console.log(`Redirecting from unknown path: ${subPath} to main dashboard`);
      navigate('/mobile-flow/main');
    }
  }, [subPath, navigate]);
  
  // Si chargement en cours ou user null, montrer un loader
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  const renderContent = () => {
    switch (subPath) {
      case 'main':
        return <MainDashboard />;
      case 'profile':
        return <ProfilePage />;
      case 'create-sfd':
        return <SfdSetupPage />;
      case 'secure-payment':
        return <SecurePaymentTab onBack={() => navigate(-1)} />;
      case 'sfd-clients':
        return <SfdClientsPage />;
      default:
        return <MainDashboard />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader />
      
      <main className="flex-1 container mx-auto max-w-md pb-16">
        {renderContent()}
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default MobileFlowPage;
