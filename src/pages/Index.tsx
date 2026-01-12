import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { UserRole } from '@/hooks/auth/types';
import LandingPage from './LandingPage';
import { Skeleton } from '@/components/ui/skeleton';
import { Capacitor } from '@capacitor/core';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, userRole, isCheckingRole } = useAuth();
  const [shouldShowLanding, setShouldShowLanding] = useState(false);

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (loading || isCheckingRole) {
      return;
    }

    // Si pas d'utilisateur connecté
    if (!user) {
      // Sur mobile natif (Android/iOS), rediriger vers la page de connexion
      const isNative = Capacitor.isNativePlatform();
      if (isNative) {
        console.log('📱 Mobile native détecté, redirection vers /auth');
        navigate('/auth', { replace: true });
        return;
      }
      
      // Sur web, afficher la landing page
      console.log('🌐 Web détecté, affichage de la landing page');
      setShouldShowLanding(true);
      return;
    }

    // Rediriger selon le rôle de l'utilisateur
    console.log('📍 User authenticated with role:', userRole);
    
    switch (userRole) {
      case UserRole.Admin:
        navigate('/super-admin-dashboard', { replace: true });
        break;
      case UserRole.SfdAdmin:
        navigate('/agency-dashboard', { replace: true });
        break;
      case UserRole.Client:
        navigate('/mobile-flow/dashboard', { replace: true });
        break;
      case UserRole.User:
      default:
        // L'utilisateur a un compte mais n'est pas encore client d'une SFD
        navigate('/sfd-selection', { replace: true });
        break;
    }
  }, [user, loading, userRole, isCheckingRole, navigate]);

  // Afficher un loader pendant le chargement
  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Afficher la landing page pour les visiteurs non connectés
  if (shouldShowLanding) {
    return <LandingPage />;
  }

  // Pendant la redirection, ne rien afficher
  return null;
};

export default Index;
