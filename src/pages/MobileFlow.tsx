
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';
import { useTransactions } from '@/hooks/useTransactions';

// Import refactored components
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';
import { useActionHandler } from '@/utils/actionHandler';
import MobileFlowPage from './MobileFlowPage';

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut } = useAuth();
  const { account, isLoading: accountLoading, updateBalance } = useAccount();
  const { transactions, isLoading: transactionsLoading, createTransaction } = useTransactions(user?.id || '', user?.id ? 'default-sfd' : '');
  const { handleAction } = useActionHandler();

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
      
      // If user is admin or super_admin, redirect to admin dashboard
      const userRole = user.app_metadata?.role;
      if (userRole === 'admin' || userRole === 'super_admin') {
        toast({
          title: "Accès refusé",
          description: "Les administrateurs ne peuvent pas accéder à l'interface mobile.",
          variant: "destructive",
        });
        navigate('/super-admin-dashboard');
      }
    }
  }, [user, loading, navigate, toast]);

  // Save welcome screen status
  useEffect(() => {
    if (!showWelcome) {
      localStorage.setItem('hasVisitedApp', 'true');
    }
  }, [showWelcome]);

  // Handle current path
  useEffect(() => {
    // Force redirect to a specific route if we're at the root
    if (location.pathname === '/mobile-flow' || location.pathname === '/mobile-flow/') {
      navigate('/mobile-flow/main', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Custom action handler that uses the toast notification
  const onAction = (action: string, data?: any) => {
    handleAction(action, data);
    
    if (action === 'Start') {
      setShowWelcome(false);
    }
  };

  // Handler for payment submission
  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    try {
      await updateBalance.mutateAsync({ amount: -data.amount });
      
      if (createTransaction) {
        await createTransaction.mutateAsync({
          user_id: user?.id || '',
          sfd_id: 'default-sfd', 
          name: data.recipient,
          type: 'payment',
          amount: -data.amount,
          paymentMethod: 'sfd_account',
          description: data.note || 'Payment transaction'
        });
      }
      
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

      <Routes>
        <Route path="/*" element={
          <MobileFlowRoutes 
            onAction={onAction}
            account={account}
            transactions={transactions}
            transactionsLoading={transactionsLoading}
            toggleMenu={toggleMenu}
            showWelcome={showWelcome}
            setShowWelcome={setShowWelcome}
            handlePaymentSubmit={handlePaymentSubmit}
          />
        } />
      </Routes>
      
      {!isWelcomePage && <div className="sm:hidden"><MobileNavigation onAction={onAction} /></div>}
    </div>
  );
};

export default MobileFlow;
