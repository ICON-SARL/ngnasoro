
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/hooks/auth';
import { useAccount } from '@/hooks/useAccount';
import { useTransactions } from '@/hooks/useTransactions';

// Import refactored components
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';
import { useActionHandler } from '@/utils/actionHandler';

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

  // Check if user is logged in, and if not, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user?.app_metadata?.role === 'admin') {
      // If user is admin, redirect to admin dashboard
      navigate('/super-admin-dashboard');
    } else if (user?.app_metadata?.role === 'sfd_admin') {
      // If user is SFD admin, redirect to SFD dashboard
      navigate('/agency-dashboard');
    }
  }, [user, loading, navigate]);

  // Save welcome screen status
  useEffect(() => {
    if (!showWelcome) {
      localStorage.setItem('hasVisitedApp', 'true');
    }
  }, [showWelcome]);

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
          userId: user?.id || '',
          sfdId: 'default-sfd', 
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

  // Simplified redirect logic to prevent loops
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/mobile-flow' || path === '/mobile-flow/') {
      // Direct to main dashboard if on root mobile path
      navigate('/mobile-flow/main');
    }
  }, [location.pathname, navigate]);

  const isWelcomePage = location.pathname === '/mobile-flow/welcome';

  // Show loading only when loading user account data
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
        transactions={transactions}
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
