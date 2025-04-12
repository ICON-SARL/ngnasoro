
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import MobileNavigation from '@/components/MobileNavigation';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';
import { Account } from '@/types/transactions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MobileFlowPage = () => {
  console.log("Rendering MobileFlowPage");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  
  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    console.log("Auth check in MobileFlowPage:", { user, isLoading });
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (user) {
      // Charger les données de l'utilisateur
      fetchUserData();
    }
  }, [user, isLoading, navigate]);
  
  // Fonction pour charger les données de l'utilisateur
  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setTransactionsLoading(true);
      
      // Récupérer le compte de l'utilisateur
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (accountError) {
        console.error("Erreur lors du chargement du compte:", accountError);
        // Utiliser un compte par défaut si aucun n'est trouvé
        setAccount({
          id: 'account-mock',
          user_id: user.id,
          balance: 50000,
          currency: 'FCFA',
          updated_at: new Date().toISOString()
        });
      } else if (accountData) {
        setAccount(accountData as Account);
      } else {
        // Aucun compte trouvé, créer un compte fictif
        console.log("Aucun compte trouvé, utilisation d'un compte fictif");
        setAccount({
          id: 'account-mock',
          user_id: user.id,
          balance: 50000,
          currency: 'FCFA',
          updated_at: new Date().toISOString()
        });
      }
      
      // Récupérer les transactions de l'utilisateur
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (transactionsError) {
        console.error("Erreur lors du chargement des transactions:", transactionsError);
        // Utiliser des transactions fictives
        setTransactions([
          { id: 1, name: 'Dépôt', type: 'deposit', amount: 10000, date: new Date().toISOString(), avatar_url: '' },
          { id: 2, name: 'Retrait', type: 'withdrawal', amount: -5000, date: new Date().toISOString(), avatar_url: '' }
        ]);
      } else if (transactionsData && transactionsData.length > 0) {
        setTransactions(transactionsData);
      } else {
        // Aucune transaction trouvée, utiliser des transactions fictives
        console.log("Aucune transaction trouvée, utilisation de transactions fictives");
        setTransactions([
          { id: 1, name: 'Dépôt', type: 'deposit', amount: 10000, date: new Date().toISOString(), avatar_url: '' },
          { id: 2, name: 'Retrait', type: 'withdrawal', amount: -5000, date: new Date().toISOString(), avatar_url: '' }
        ]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos données. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setTransactionsLoading(false);
    }
  };
  
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
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
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
