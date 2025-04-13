
import React, { useState, useEffect, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut } = useAuth();
  const { account, isLoading: accountLoading, updateBalance } = useAccount();
  const transactionService = useTransactions(user?.id || '', user?.id ? 'default-sfd' : '');
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
      if (userRole === 'admin') {
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
      
      // Use the createTransaction function
      if (transactionService.createTransaction) {
        await transactionService.createTransaction({
          userId: user?.id || '',
          sfdId: 'default-sfd', 
          name: data.recipient,
          type: 'payment',
          amount: -data.amount,
          paymentMethod: 'sfd_account',
          description: data.note || 'Payment transaction'
        });
      } else {
        console.error('createTransaction is not available');
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

      <MobileFlowRoutes 
        onAction={onAction}
        account={{
          id: account?.id || '1',
          owner_id: user?.id || '1',
          balance: account?.balance || 0,
          currency: account?.currency || 'FCFA',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          status: 'active',
          type: 'savings'
        }}
        transactions={transactionService.transactions}
        transactionsLoading={transactionService.isLoading}
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
