
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [authMode, setAuthMode] = useState<'simple' | 'advanced'>('simple');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle cooldown timer
  useEffect(() => {
    if (cooldownTime <= 0) {
      setCooldownActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setCooldownTime(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const extractCooldownTime = (errorMessage: string): number => {
    const match = errorMessage.match(/after (\d+) seconds/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 60; // Default cooldown
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage(null);
    
    // Don't allow login during cooldown
    if (cooldownActive) {
      setErrorMessage(`Veuillez attendre ${cooldownTime} secondes avant de réessayer.`);
      return;
    }

    // Email validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    
    setIsLoading(true);
    
    if (authMode === 'advanced') {
      setShowAuthDialog(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // Use OTP authentication
      await signIn(email);
      toast({
        title: "Connectez-vous avec le lien magique",
        description: "Vérifiez votre e-mail pour le lien de connexion.",
      });
      
      // Redirect to mobile flow after successful magic link send
      setTimeout(() => {
        navigate('/mobile-flow');
      }, 3000);
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check for rate limiting errors
      if (error.message && error.message.includes('security purposes') && error.message.includes('seconds')) {
        const waitTime = extractCooldownTime(error.message);
        setCooldownTime(waitTime);
        setCooldownActive(true);
        setErrorMessage(`Limite de tentatives atteinte. Veuillez attendre ${waitTime} secondes avant de réessayer.`);
      } else {
        setErrorMessage(error.message || "Une erreur s'est produite lors de la connexion.");
        toast({
          title: "Erreur de connexion",
          description: error.message || "Une erreur s'est produite lors de la connexion.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAuthComplete = () => {
    setShowAuthDialog(false);
    toast({
      title: "Authentification réussie",
      description: "Vous êtes maintenant connecté.",
    });
    navigate('/mobile-flow');
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'simple' ? 'advanced' : 'simple');
    setErrorMessage(null);
  };

  return {
    email,
    setEmail,
    authMode,
    showAuthDialog,
    setShowAuthDialog,
    isLoading,
    errorMessage,
    cooldownActive,
    cooldownTime,
    handleLogin,
    handleAuthComplete,
    toggleAuthMode
  };
};
