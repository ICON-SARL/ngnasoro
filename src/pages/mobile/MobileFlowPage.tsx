
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
  
  const { user, loading, signOut, userRole } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    console.log('MobileFlowPage: Auth state check', {
      loading,
      user: !!user,
      userRole,
      pathname: location.pathname
    });

    if (!loading) {
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
      
      // Get the user role
      const role = user.app_metadata?.role;
      console.log('MobileFlowPage: Detected user role:', { role, userRole });
      
      // Allow admin users to access but redirect them to their dashboards
      if (role === 'admin') {
        console.log('MobileFlowPage: Admin user detected, redirecting to admin dashboard');
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur.",
        });
        navigate('/super-admin-dashboard');
        return;
      } 
      
      if (role === 'sfd_admin') {
        console.log('MobileFlowPage: SFD admin detected, redirecting to SFD dashboard');
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur SFD.",
        });
        navigate('/agency-dashboard');
        return;
      }

      // Allow both 'user' and 'client' roles to access mobile flow - Fix the enum comparison
      if (role === 'user' || role === 'client' || userRole === UserRole.Client) {
        console.log('MobileFlowPage: Valid mobile user role detected, allowing access');
        // User has valid mobile role, allow access
      } else {
        console.log('MobileFlowPage: Unknown role, allowing access as fallback for mobile');
        // For mobile flow, be permissive and allow access by default
      }
    }
  }, [user, loading, navigate, toast, location.pathname, userRole]);

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('MobileFlowPage: Starting logout');
      await signOut();
      navigate('/auth');
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

  if (loading) {
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
