
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
// Correctly importing MobileRouter as a named export
import { MobileRouter } from '@/components/Router';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';
import FloatingMenuButton from '@/components/mobile/FloatingMenuButton';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut, userRole } = useAuth();

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

      // Si c'est un nouvel utilisateur sans accès au flux client, l'orienter vers l'adhésion
      if (role === 'user' && location.pathname === '/mobile-flow/main') {
        toast({
          title: "Bienvenue",
          description: "Pour accéder à toutes les fonctionnalités, vous devez d'abord adhérer à une SFD.",
        });
        // Rediriger vers la sélection de SFD pour adhésion
        navigate('/mobile-flow/sfd-selector');
      }
    }
  }, [user, loading, navigate, toast, location.pathname]);

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
      <Routes>
        {/* Route pour la page d'adhésion SFD - accessible aux utilisateurs 'user' */}
        <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
        <Route path="sfd-selector" element={<SfdSelectorPage />} />
        {/* Autres routes MobileFlow */}
        <Route path="*" element={<MobileRouter />} />
      </Routes>
    </div>
  );
};

export default MobileFlowPage;
