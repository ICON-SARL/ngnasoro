
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import MobileNavigation from '@/components/MobileNavigation';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';
import { Account } from '@/types/transactions';

const MobileFlowPage = () => {
  console.log("Rendering MobileFlowPage");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: isLoading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    console.log("Auth check in MobileFlowPage:", { user, isLoading });
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // Vérifier que la route est valide
  useEffect(() => {
    const path = location.pathname;
    console.log("Current path in MobileFlowPage:", path);
    if (path === '/mobile-flow' || path === '/mobile-flow/') {
      navigate('/mobile-flow/main');
    }
  }, [location.pathname, navigate]);
  
  // Gérer la redirection depuis le splash screen
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (location.pathname !== '/mobile-flow/splash' && !hasSeenSplash) {
      sessionStorage.setItem('hasSeenSplash', 'true');
    }
  }, [location.pathname]);
  
  // Données de compte fictives pour le développement
  const mockAccount: Account = {
    id: 'account-1',
    user_id: user?.id || '',
    balance: 50000,
    currency: 'FCFA',
    updated_at: new Date().toISOString()
  };
  
  // Transactions fictives pour le développement
  const mockTransactions = [
    { id: 1, name: 'Dépôt', type: 'deposit', amount: 10000, date: new Date().toISOString(), avatar_url: '' },
    { id: 2, name: 'Retrait', type: 'withdrawal', amount: -5000, date: new Date().toISOString(), avatar_url: '' }
  ];
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleAction = (action: string, data?: any) => {
    console.log('Action:', action, data);
    
    if (action === 'Start') {
      setShowWelcome(false);
      navigate('/mobile-flow/main');
    }
  };
  
  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    console.log('Payment submitted:', data);
    // Simuler un succès après délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/mobile-flow/main');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  // Déterminer si on doit afficher la navigation
  const showNavigation = !['/mobile-flow/splash', '/mobile-flow/welcome'].includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full h-full pb-16">
        <MobileFlowRoutes 
          onAction={handleAction}
          account={mockAccount}
          transactions={mockTransactions}
          transactionsLoading={false}
          toggleMenu={toggleMenu}
          showWelcome={showWelcome}
          setShowWelcome={setShowWelcome}
          handlePaymentSubmit={handlePaymentSubmit}
        />
      </main>
      
      {showNavigation && <MobileNavigation onAction={handleAction} />}
      
      <MobileMenu 
        isOpen={menuOpen} 
        onClose={toggleMenu} 
        onLogout={handleLogout}
      />
    </div>
  );
};

export default MobileFlowPage;
