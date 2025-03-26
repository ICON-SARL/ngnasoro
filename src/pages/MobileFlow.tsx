import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import MobileHeader from '@/components/mobile/MobileHeader';
import ContextualHeader from '@/components/mobile/ContextualHeader';
import TransactionList from '@/components/mobile/TransactionList';
import PaymentTabContent from '@/components/mobile/PaymentTabContent';
import SecurePaymentTab from '@/components/mobile/SecurePaymentTab';
import ScheduleTransferTab from '@/components/mobile/ScheduleTransferTab';
import InstantLoanPage from '@/components/mobile/InstantLoanPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanSetupPage from '@/components/mobile/LoanSetupPage';
import LoanProcessFlow from '@/components/mobile/LoanProcessFlow';
import WelcomeScreen from '@/components/mobile/WelcomeScreen';
import LoanDisbursementPage from '@/components/mobile/LoanDisbursementPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import { PaymentOptions } from '@/components/PaymentOptions';
import { LatePaymentAlerts } from '@/components/LatePaymentAlerts';
import LoanApplicationFlow from '@/components/LoanApplicationFlow';
import MultiSFDAccounts from '@/components/MultiSFDAccounts';
import { SecurePaymentLayer } from '@/components/SecurePaymentLayer';
import FinancialSnapshot from '@/components/mobile/FinancialSnapshot';
import QuickActionsCard from '@/components/mobile/QuickActionsCard';
import SFDSavingsOverview from '@/components/mobile/SFDSavingsOverview';

import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Bell, 
  Wallet, 
  CreditCard, 
  Calendar, 
  HandCoins, 
  Building,
  Search,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Settings,
  ArrowLeft,
  ActivitySquare
} from 'lucide-react';

const FundsManagementPage = lazy(() => import('@/components/mobile/FundsManagementPage'));

const MainDashboard = ({ onAction, account, transactions, transactionsLoading, toggleMenu }) => {
  return (
    <div className="space-y-4 mt-0 p-0 pb-20">
      <div className="bg-gradient-to-b from-[#0D6A51] to-[#0D6A51]/90 text-white p-4 rounded-b-3xl relative">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="text-white p-1 hover:bg-white/10" onClick={toggleMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ContextualHeader />
      </div>
      
      <div className="mx-4 -mt-10">
        <FinancialSnapshot 
          loanId="LOAN123" 
          nextPaymentDate="2023-07-15" 
          nextPaymentAmount={25000} 
        />
      </div>
      
      <div className="mx-4">
        <QuickActionsCard 
          onAction={onAction} 
          loanId="LOAN123" 
          paymentDue={25000} 
        />
      </div>
      
      <div className="mx-4">
        <SFDSavingsOverview />
      </div>
      
      <TransactionList 
        transactions={transactions.map(tx => ({
          id: tx.id,
          name: tx.name,
          type: tx.type,
          amount: tx.amount.toString(),
          date: new Date(tx.date).toLocaleDateString(),
          avatar: tx.avatar_url
        }))}
        isLoading={transactionsLoading}
        onViewAll={() => onAction('Loans')}
        title="Transactions Récentes"
      />
    </div>
  );
};

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut } = useAuth();
  const { account, isLoading: accountLoading, updateBalance } = useAccount();
  const { transactions, isLoading: transactionsLoading, addTransaction } = useTransactions();

  const [showWelcome, setShowWelcome] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisitedApp');
    return !hasVisited;
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!showWelcome) {
      localStorage.setItem('hasVisitedApp', 'true');
    }
  }, [showWelcome]);

  const handleAction = async (action: string, data?: any) => {
    toast({
      title: `Action ${action}`,
      description: `Vous avez choisi de ${action.toLowerCase()}`,
    });
    
    if (action === 'Send' || action === 'Receive') {
      navigate('/mobile-flow/payment');
    } else if (action === 'Float me cash' || action === 'Funds Management') {
      navigate('/mobile-flow/funds-management');
    } else if (action === 'Schedule transfer') {
      navigate('/mobile-flow/schedule-transfer');
    } else if (action.startsWith('Transfer to')) {
      navigate('/mobile-flow/payment');
    } else if (action === 'Loans') {
      navigate('/mobile-flow/home-loan');
    } else if (action === 'Loan Activity') {
      navigate('/mobile-flow/loan-activity');
    } else if (action === 'Loan Details') {
      navigate('/mobile-flow/loan-details');
    } else if (action === 'Loan Setup') {
      navigate('/mobile-flow/loan-setup');
    } else if (action === 'Payment Options') {
      navigate('/mobile-flow/payment-options');
    } else if (action === 'Late Payments') {
      navigate('/mobile-flow/late-payments');
    } else if (action === 'Loan Application') {
      navigate('/mobile-flow/loan-application');
    } else if (action === 'Multi SFD') {
      navigate('/mobile-flow/multi-sfd');
    } else if (action === 'Secure Layer') {
      navigate('/mobile-flow/secure-layer');
    } else if (action === 'Loan Process') {
      navigate('/mobile-flow/loan-process');
    } else if (action === 'Start') {
      navigate('/mobile-flow/main');
      setShowWelcome(false);
    } else if (action === 'Repayment') {
      navigate('/mobile-flow/secure-payment');
      if (data && data.amount) {
        // You would handle setting repayment amount here
      }
    } else if (action === 'Home') {
      navigate('/mobile-flow/main');
    }
  };

  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    try {
      await updateBalance.mutateAsync({ amount: -data.amount });
      
      await addTransaction.mutateAsync({
        name: data.recipient,
        type: 'Envoi',
        amount: -data.amount,
        date: new Date().toISOString(),
        avatar_url: null
      });
      
      navigate('/mobile-flow/main');
      
      toast({
        title: 'Paiement réussi',
        description: `Vous avez envoyé ${data.amount} FCFA à ${data.recipient}`,
      });
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

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

  useEffect(() => {
    if (showWelcome && location.pathname === '/mobile-flow') {
      navigate('/mobile-flow/welcome');
    }
    else if (location.pathname !== '/mobile-flow/welcome' && location.pathname !== '/mobile-flow') {
      setShowWelcome(false);
    }
  }, [showWelcome, location.pathname, navigate]);

  if (loading || accountLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white relative">
      {menuOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-white z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu principal</h2>
              <Button variant="ghost" size="sm" onClick={toggleMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Opérations bancaires</h3>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/payment'); toggleMenu(); }}>
                  <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" /> Paiements et transferts
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/secure-payment'); toggleMenu(); }}>
                  <ShieldCheck className="h-5 w-5 mr-2 text-[#0D6A51]" /> Paiement sécurisé
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/schedule-transfer'); toggleMenu(); }}>
                  <Calendar className="h-5 w-5 mr-2 text-[#0D6A51]" /> Transferts programmés
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/multi-sfd'); toggleMenu(); }}>
                  <Building className="h-5 w-5 mr-2 text-[#0D6A51]" /> Gestion Multi-SFD
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/secure-layer'); toggleMenu(); }}>
                  <ShieldCheck className="h-5 w-5 mr-2 text-[#0D6A51]" /> Sécurité avancée
                </Button>
              </div>
              
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Prêts et financements</h3>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/home-loan'); toggleMenu(); }}>
                  <Wallet className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Mes prêts
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/loan-application'); toggleMenu(); }}>
                  <HandCoins className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Demander un prêt
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/payment-options'); toggleMenu(); }}>
                  <CreditCard className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Options de paiement
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/mobile-flow/late-payments'); toggleMenu(); }}>
                  <Bell className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Alertes retards
                </Button>
              </div>

              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Support & Aide</h3>
                <Button variant="ghost" className="justify-start">
                  <MessageSquare className="h-5 w-5 mr-2" /> Contacter un conseiller
                </Button>
                <Button variant="ghost" className="justify-start">
                  <HelpCircle className="h-5 w-5 mr-2" /> FAQ et assistance
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Search className="h-5 w-5 mr-2" /> Rechercher
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
                  <Settings className="h-5 w-5 mr-2" /> Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="welcome" element={<WelcomeScreen onStart={() => handleAction('Start')} />} />
        <Route path="main" element={
          <MainDashboard 
            onAction={handleAction}
            account={account}
            transactions={transactions}
            transactionsLoading={transactionsLoading}
            toggleMenu={toggleMenu}
          />
        } />
        <Route path="payment" element={
          <PaymentTabContent 
            onBack={() => navigate('/mobile-flow/main')} 
            onSubmit={handlePaymentSubmit}
          />
        } />
        <Route path="secure-payment" element={
          <SecurePaymentTab onBack={() => navigate('/mobile-flow/main')} />
        } />
        <Route path="funds-management" element={
          <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
            <FundsManagementPage />
          </Suspense>
        } />
        <Route path="schedule-transfer" element={
          <ScheduleTransferTab onBack={() => navigate('/mobile-flow/main')} />
        } />
        <Route path="home-loan" element={<InstantLoanPage />} />
        <Route path="loan-activity" element={<LoanActivityPage />} />
        <Route path="loan-details" element={
          <LoanDetailsPage onBack={() => navigate('/mobile-flow/home-loan')} />
        } />
        <Route path="loan-setup" element={<LoanSetupPage />} />
        <Route path="loan-disbursement" element={<LoanDisbursementPage />} />
        <Route path="loan-agreement" element={<LoanAgreementPage />} />
        <Route path="payment-options" element={
          <div className="p-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate('/mobile-flow/main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <PaymentOptions />
          </div>
        } />
        <Route path="late-payments" element={
          <div className="p-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate('/mobile-flow/main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <LatePaymentAlerts />
          </div>
        } />
        <Route path="loan-application" element={
          <div>
            <div className="bg-white py-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-4" 
                onClick={() => navigate('/mobile-flow/main')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour
              </Button>
            </div>
            <LoanApplicationFlow />
          </div>
        } />
        <Route path="multi-sfd" element={
          <div className="p-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate('/mobile-flow/main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <MultiSFDAccounts />
          </div>
        } />
        <Route path="secure-layer" element={
          <div className="p-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate('/mobile-flow/main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <SecurePaymentLayer />
          </div>
        } />
        <Route path="loan-process" element={
          <LoanProcessFlow onBack={() => navigate('/mobile-flow/main')} />
        } />
        <Route path="profile" element={
          <div className="p-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate('/mobile-flow/main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <MultiSFDAccounts />
          </div>
        } />
        <Route path="" element={<Navigate to="/mobile-flow/welcome" replace />} />
        <Route path="*" element={<Navigate to="/mobile-flow/welcome" replace />} />
      </Routes>
      
      <MobileNavigation onAction={handleAction} />
    </div>
  );
};

export default MobileFlow;
