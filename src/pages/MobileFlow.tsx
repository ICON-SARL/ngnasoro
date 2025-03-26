import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import MobileHeader from '@/components/mobile/MobileHeader';
import BalanceSection from '@/components/mobile/BalanceSection';
import QuickAccessCard from '@/components/mobile/QuickAccessCard';
import FinancialOverview from '@/components/mobile/FinancialOverview';
import TransactionList from '@/components/mobile/TransactionList';
import PaymentTabContent from '@/components/mobile/PaymentTabContent';
import SecurePaymentTab from '@/components/mobile/SecurePaymentTab';
import ScheduleTransferTab from '@/components/mobile/ScheduleTransferTab';
import HomeLoanPage from '@/components/mobile/HomeLoanPage';
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

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('welcome');
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut } = useAuth();
  const { account, isLoading: accountLoading, updateBalance } = useAccount();
  const { transactions, isLoading: transactionsLoading, addTransaction } = useTransactions();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAction = async (action: string, data?: any) => {
    toast({
      title: `Action ${action}`,
      description: `Vous avez choisi de ${action.toLowerCase()}`,
    });
    
    if (action === 'Send' || action === 'Receive') {
      setActiveTab('payment');
    } else if (action === 'Float me cash') {
      setActiveTab('secure-payment');
    } else if (action === 'Schedule transfer') {
      setActiveTab('schedule-transfer');
    } else if (action.startsWith('Transfer to')) {
      setActiveTab('payment');
    } else if (action === 'Loans') {
      setActiveTab('home-loan');
    } else if (action === 'Loan Activity') {
      setActiveTab('loan-activity');
    } else if (action === 'Loan Details') {
      setActiveTab('loan-details');
    } else if (action === 'Loan Setup') {
      setActiveTab('loan-setup');
    } else if (action === 'Payment Options') {
      setActiveTab('payment-options');
    } else if (action === 'Late Payments') {
      setActiveTab('late-payments');
    } else if (action === 'Loan Application') {
      setActiveTab('loan-application');
    } else if (action === 'Multi SFD') {
      setActiveTab('multi-sfd');
    } else if (action === 'Secure Layer') {
      setActiveTab('secure-layer');
    } else if (action === 'Loan Process') {
      setActiveTab('loan-process');
    } else if (action === 'Start') {
      setActiveTab('home-loan');
    } else if (action === 'Repayment') {
      setActiveTab('payment');
      if (data && data.amount) {
        // You would handle setting repayment amount here
      }
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
      
      setActiveTab('main');
      
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
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('payment'); toggleMenu(); }}>
                  <CreditCard className="h-5 w-5 mr-2" /> Paiements et transferts
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('secure-payment'); toggleMenu(); }}>
                  <ShieldCheck className="h-5 w-5 mr-2" /> Paiement sécurisé
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('schedule-transfer'); toggleMenu(); }}>
                  <Calendar className="h-5 w-5 mr-2" /> Transferts programmés
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('multi-sfd'); toggleMenu(); }}>
                  <Building className="h-5 w-5 mr-2" /> Gestion Multi-SFD
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('secure-layer'); toggleMenu(); }}>
                  <ShieldCheck className="h-5 w-5 mr-2" /> Sécurité avancée
                </Button>
              </div>
              
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Prêts et financements</h3>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('home-loan'); toggleMenu(); }}>
                  <Wallet className="h-5 w-5 mr-2" /> Mes prêts
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('loan-application'); toggleMenu(); }}>
                  <HandCoins className="h-5 w-5 mr-2" /> Demander un prêt
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('payment-options'); toggleMenu(); }}>
                  <CreditCard className="h-5 w-5 mr-2" /> Options de paiement
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setActiveTab('late-payments'); toggleMenu(); }}>
                  <Bell className="h-5 w-5 mr-2" /> Alertes retards
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="welcome" className="m-0 p-0 h-screen">
          <WelcomeScreen />
        </TabsContent>
        
        <TabsContent value="main" className="space-y-4 mt-0 p-0">
          <div className="bg-blue-600 text-white p-4 rounded-b-3xl relative">
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="sm" className="text-white p-1" onClick={toggleMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <MobileHeader />
            <BalanceSection currency={account?.currency || 'FCFA'} balance={account?.balance || 0} />
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
              onAction={handleAction} 
              loanId="LOAN123" 
              paymentDue={25000} 
            />
          </div>
          
          <QuickAccessCard onAction={handleAction} />
          
          <FinancialOverview />
          
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
            onViewAll={() => handleAction('Loans')}
          />
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4 mt-0">
          <PaymentTabContent 
            onBack={() => setActiveTab('main')} 
            onSubmit={handlePaymentSubmit}
          />
        </TabsContent>

        <TabsContent value="secure-payment" className="space-y-4 mt-0">
          <SecurePaymentTab onBack={() => setActiveTab('main')} />
        </TabsContent>
        
        <TabsContent value="schedule-transfer" className="space-y-4 mt-0">
          <ScheduleTransferTab onBack={() => setActiveTab('main')} />
        </TabsContent>
        
        <TabsContent value="home-loan" className="space-y-4 mt-0 p-0 h-screen">
          <HomeLoanPage />
        </TabsContent>
        
        <TabsContent value="loan-activity" className="space-y-4 mt-0 p-0">
          <LoanActivityPage />
        </TabsContent>
        
        <TabsContent value="loan-details" className="space-y-4 mt-0 p-0">
          <LoanDetailsPage onBack={() => setActiveTab('home-loan')} />
        </TabsContent>
        
        <TabsContent value="loan-setup" className="space-y-4 mt-0 p-0">
          <LoanSetupPage />
        </TabsContent>

        <TabsContent value="loan-disbursement" className="space-y-4 mt-0 p-0 h-screen">
          <LoanDisbursementPage />
        </TabsContent>

        <TabsContent value="loan-agreement" className="space-y-4 mt-0 p-0 h-screen">
          <LoanAgreementPage />
        </TabsContent>

        <TabsContent value="payment-options" className="space-y-4 mt-0 p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => setActiveTab('main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <PaymentOptions />
        </TabsContent>

        <TabsContent value="late-payments" className="space-y-4 mt-0 p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => setActiveTab('main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <LatePaymentAlerts />
        </TabsContent>

        <TabsContent value="loan-application" className="space-y-4 mt-0 p-0">
          <div className="bg-white py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-4" 
              onClick={() => setActiveTab('main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
          </div>
          <LoanApplicationFlow />
        </TabsContent>

        <TabsContent value="multi-sfd" className="space-y-4 mt-0 p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => setActiveTab('main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <MultiSFDAccounts />
        </TabsContent>

        <TabsContent value="secure-layer" className="space-y-4 mt-0 p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => setActiveTab('main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <SecurePaymentLayer />
        </TabsContent>

        <TabsContent value="loan-process" className="space-y-4 mt-0 p-0">
          <LoanProcessFlow onBack={() => setActiveTab('main')} />
        </TabsContent>
      </Tabs>
      
      <MobileNavigation onAction={handleAction} />
    </div>
  );
};

export default MobileFlow;
