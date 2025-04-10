
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useLoginForm = (
  adminMode: boolean = false, 
  isSfdAdmin: boolean = false,
  onError?: (errorMessage: string) => void
) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const startCooldown = (seconds: number) => {
    setCooldownActive(true);
    setCooldownTime(seconds);

    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldownActive) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        
        const errorMsg = error.message || "Une erreur s'est produite lors de la connexion.";
        setErrorMessage(errorMsg);
        
        // Pass error to parent component if callback exists
        if (onError) {
          onError(errorMsg);
        }
        
        // If too many requests, start cooldown
        if (error.message && error.message.includes('Too many requests')) {
          startCooldown(30);
        }
        
        // Specific error for admin login
        if (adminMode && error.message && error.message.includes('Invalid login')) {
          setErrorMessage("Accès refusé. Ce compte n'a pas les droits administrateur nécessaires.");
        }
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        
        // No need to redirect, the AuthUI component will handle it
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setErrorMessage("Une erreur inattendue s'est produite. Veuillez réessayer.");
      
      if (onError) {
        onError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    isLoading,
    errorMessage,
    cooldownActive,
    cooldownTime,
    emailSent,
    handleLogin
  };
};
