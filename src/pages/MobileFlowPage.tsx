
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';
import FloatingMenuButton from '@/components/mobile/FloatingMenuButton';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import FundsManagementPage from '@/pages/mobile/FundsManagementPage';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import HomeLoanPage from '@/components/mobile/loan/HomeLoanPage';
import LoanPlansPage from '@/components/mobile/loan/LoanPlansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import MobileNavigation from '@/components/MobileNavigation';
import { LoanActivityPage } from '@/pages/mobile/LoanActivityPage';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut, userRole } = useAuth();

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

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <FloatingMenuButton onClick={toggleMenu} />
      <MobileDrawerMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onLogout={handleLogout} 
      />
      <Routes>
        <Route path="/" element={<MobileMainPage />} />
        <Route path="main" element={<MobileMainPage />} />
        <Route path="loans" element={<HomeLoanPage />} />
        <Route path="loan-plans" element={<LoanPlansPage />} />
        <Route path="my-loans" element={<MobileMyLoansPage />} />
        <Route path="loan-details/:loanId" element={<LoanDetailsPage />} />
        <Route path="loan-activity" element={<LoanActivityPage />} />
        <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
        <Route path="sfd-selector" element={<SfdSelectorPage />} />
        <Route path="funds-management" element={<FundsManagementPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Routes>
      <MobileNavigation />
    </div>
  );
};

export default MobileFlowPage;
