import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger directement vers l'authentification
    navigate('/auth', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;

