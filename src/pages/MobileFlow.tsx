
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';
import { useTransactions } from '@/hooks/useTransactions';
import { UserRole } from '@/hooks/auth/types';

// Import refactored components
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';
import { useActionHandler } from '@/utils/actionHandler';

const MobileFlow = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut, userRole } = useAuth();
  
  // Utilisation conditionnelle des hooks pour éviter les erreurs
  const { account, isLoading: accountLoading } = useAccount ? useAccount() : { account: null, isLoading: false };
  const { transactions, isLoading: transactionsLoading } = useTransactions && user?.id ? 
    useTransactions(user.id, user.id ? 'default-sfd' : '') : 
    { transactions: [], isLoading: false };
  
  const { handleAction } = useActionHandler ? useActionHandler() : { handleAction: () => {} };

  const [showWelcome, setShowWelcome] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisitedApp');
    return !hasVisited;
  });

  // Check if user is authenticated and not an admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Get the user role and redirect if needed
      const role = user.app_metadata?.role;
      console.log('MobileFlow - Detected user role:', role);
      
      // Redirect admins to their proper dashboards
      if (role === 'admin') {
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur. Redirection vers le tableau de bord admin.",
        });
        navigate('/super-admin-dashboard');
        return;
      } 
      
      if (role === 'sfd_admin') {
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur SFD. Redirection vers le tableau de bord SFD.",
        });
        navigate('/agency-dashboard');
        return;
      }
    }
  }, [user, loading, navigate, toast]);

  // Save welcome screen status
  useEffect(() => {
    if (!showWelcome) {
      localStorage.setItem('hasVisitedApp', 'true');
    }
  }, [showWelcome]);

  // Custom action handler that uses the toast notification
  const onAction = (action: string, data?: any) => {
    if (handleAction) {
      handleAction(action, data);
    }
    
    if (action === 'Start') {
      setShowWelcome(false);
    }
  };

  // Handler for payment submission
  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    try {
      // Implémentation simplifiée
      navigate('/mobile-flow/main');
      
      toast({
        title: 'Paiement réussi',
        description: `Vous avez envoyé ${data.amount} FCFA à ${data.recipient}`,
      });
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Menu handlers
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle welcome screen navigation
  useEffect(() => {
    if (showWelcome && location.pathname === '/mobile-flow') {
      navigate('/mobile-flow/welcome');
    }
    else if (location.pathname !== '/mobile-flow/welcome' && location.pathname !== '/mobile-flow') {
      setShowWelcome(false);
    }
  }, [showWelcome, location.pathname, navigate]);

  const isWelcomePage = location.pathname === '/mobile-flow/welcome';

  if (loading || accountLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white relative">
      <MobileMenu 
        isOpen={menuOpen} 
        onClose={toggleMenu} 
        onLogout={handleLogout} 
      />

      <MobileFlowRoutes 
        onAction={onAction}
        account={account}
        transactions={transactions || []}
        transactionsLoading={transactionsLoading}
        toggleMenu={toggleMenu}
        showWelcome={showWelcome}
        setShowWelcome={setShowWelcome}
        handlePaymentSubmit={handlePaymentSubmit}
      />
      
      {!isWelcomePage && <div className="sm:hidden"><MobileNavigation onAction={onAction} /></div>}
    </div>
  );
};

export default MobileFlow;
