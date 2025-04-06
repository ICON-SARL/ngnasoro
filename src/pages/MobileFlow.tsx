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

  console.log('MobileFlow component state:', {
    userEmail: user?.email,
    userRole: user?.app_metadata?.role,
    loading,
    location: location.pathname
  });

  // Check if user is logged in, and redirect based on role if needed
  useEffect(() => {
    if (!loading && user) {
      const userRole = user.app_metadata?.role;
      console.log('MobileFlow role check:', { 
        email: user.email, 
        role: userRole,
        pathname: location.pathname
      });
      
      if (userRole === 'admin') {
        // Redirect admin to admin dashboard
        console.log('Admin detected in MobileFlow, redirecting...');
        navigate('/super-admin-dashboard', { replace: true });
        return;
      } else if (userRole === 'sfd_admin') {
        // Redirect SFD admin to agency dashboard
        console.log('SFD Admin detected in MobileFlow, redirecting...');
        navigate('/agency-dashboard', { replace: true });
        return;
      }
    }
  }, [user, loading, navigate, location.pathname]);

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
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If still loading, show a spinner
  if (loading || accountLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0D6A51]"></div>
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  if (!user) {
    console.log('No user in MobileFlow render, rendering nothing');
    return null;
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
      
      {location.pathname !== '/mobile-flow/welcome' && <div className="sm:hidden"><MobileNavigation onAction={onAction} /></div>}
    </div>
  );
};

export default MobileFlow;
