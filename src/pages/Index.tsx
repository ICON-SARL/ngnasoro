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

    // Si utilisateur connecté → redirection selon le rôle
    if (user) {
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
          navigate('/sfd-selection', { replace: true });
          break;
      }
      return;
    }

    // Utilisateur non connecté - vérifier l'onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
      // Première visite → onboarding
      console.log('🎉 Première visite, redirection vers onboarding');
      navigate('/onboarding', { replace: true });
      return;
    }

    // Onboarding déjà vu
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      console.log('📱 Mobile native, redirection vers /auth');
      navigate('/auth', { replace: true });
    } else {
      console.log('🌐 Web, affichage de la landing page');
      setShouldShowLanding(true);
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

  // Afficher la landing page pour les visiteurs web non connectés
  if (shouldShowLanding) {
    return <LandingPage />;
  }

  // Pendant la redirection, ne rien afficher
  return null;
};

export default Index;
