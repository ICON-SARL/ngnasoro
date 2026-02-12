import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { UserRole } from '@/hooks/auth/types';
import LandingPage from './LandingPage';
import LoadingScreen from '@/components/ui/LoadingScreen';
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
        case UserRole.SupportAdmin:
          navigate('/support-admin-dashboard', { replace: true });
          break;
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

  // Afficher un loader moderne pendant le chargement
  if (loading || isCheckingRole) {
    return <LoadingScreen message="Préparation de votre espace..." />;
  }

  // Afficher la landing page pour les visiteurs web non connectés
  if (shouldShowLanding) {
    return <LandingPage />;
  }

  // Pendant la redirection, ne rien afficher
  return null;
};

export default Index;
