import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
      // Première visite → Afficher l'onboarding
      navigate('/onboarding', { replace: true });
    } else {
      // Déjà vu → Aller directement à l'auth
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return null;
};

export default Index;

