
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';
import FloatingMenuButton from '@/components/mobile/FloatingMenuButton';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  const { user, loading, signOut } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast({
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder à cette page.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      // Get the user role and redirect if needed
      const role = user.app_metadata?.role;
      
      if (role === 'admin') {
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur.",
        });
        navigate('/super-admin-dashboard');
        return;
      } 
      
      if (role === 'sfd_admin') {
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur SFD.",
        });
        navigate('/agency-dashboard');
        return;
      }
    }
  }, [user, loading, navigate, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Impossible de vous déconnecter.",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleAction = (action: string, data?: any) => {
    console.log("Action:", action, data);
    // Handle actions from child components
  };
  
  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    console.log("Payment submitted:", data);
    // Implement payment submission logic
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <FloatingMenuButton onClick={toggleMenu} />
      <MobileDrawerMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onLogout={handleLogout} 
      />
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
    </div>
  );
};

export default MobileFlowPage;
