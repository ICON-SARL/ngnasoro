
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileRouter } from '@/components/Router';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/hooks/auth/types';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';
import FloatingMenuButton from '@/components/mobile/FloatingMenuButton';
import MobileNavigation from '@/components/MobileNavigation';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, loading, signOut, isAdmin, isSfdAdmin, isClient, isCheckingRole } = useAuth();

  // Check if user is authenticated and redirect appropriately
  useEffect(() => {
    console.log('MobileFlowPage: Auth state check', {
      loading,
      isCheckingRole,
      user: !!user,
      isAdmin,
      isSfdAdmin,
      isClient,
      pathname: location.pathname
    });

    if (!loading && !isCheckingRole) {
      if (!user) {
        console.log('MobileFlowPage: No user, redirecting to auth');
        toast({
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder à cette page.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      // Redirect admin users to their appropriate dashboards immediately
      if (isAdmin) {
        console.log('MobileFlowPage: Admin user detected, redirecting to admin dashboard');
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur.",
        });
        navigate('/super-admin-dashboard', { replace: true });
        return;
      } 
      
      if (isSfdAdmin) {
        console.log('MobileFlowPage: SFD admin detected, redirecting to SFD dashboard');
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur SFD.",
        });
        navigate('/agency-dashboard', { replace: true });
        return;
      }

      // Allow clients to access mobile flow
      if (isClient) {
        console.log('MobileFlowPage: Client user detected, allowing access');
        // User has valid mobile role, allow access
      } else {
        console.log('MobileFlowPage: Unknown role, redirecting to auth for clarity');
        toast({
          title: "Rôle non reconnu",
          description: "Votre rôle n'est pas reconnu pour cette interface.",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
        return;
      }
    }
  }, [user, loading, isCheckingRole, navigate, toast, location.pathname, isAdmin, isSfdAdmin, isClient]);

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('MobileFlowPage: Starting logout');
      await signOut();
      navigate('/auth', { replace: true });
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error('MobileFlowPage: Logout error:', error);
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

  if (loading || isCheckingRole) {
    console.log('MobileFlowPage: Still loading...');
    return <div className="p-8 text-center">Chargement...</div>;
  }

  console.log('MobileFlowPage: Rendering mobile interface');
  return (
    <div className="min-h-screen bg-white pb-16">
      <FloatingMenuButton onClick={toggleMenu} />
      <MobileDrawerMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onLogout={handleLogout} 
      />
      <MobileRouter />
      <MobileNavigation />
    </div>
  );
};

export default MobileFlowPage;
