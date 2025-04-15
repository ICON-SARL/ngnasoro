
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
  const { signIn, signOut } = useAuth();
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
      console.log(`Tentative de connexion avec mode: ${adminMode ? 'admin' : isSfdAdmin ? 'sfd_admin' : 'client'}`);
      const result = await signIn(email, password);
      
      if (result.error) {
        console.error('Login error:', result.error);
        
        const errorMsg = result.error.message || "Une erreur s'est produite lors de la connexion.";
        setErrorMessage(errorMsg);
        
        // Pass error to parent component if callback exists
        if (onError) {
          onError(errorMsg);
        }
        
        // If too many requests, start cooldown
        if (result.error.message && result.error.message.includes('Too many requests')) {
          startCooldown(30);
        }
        
        // Specific error for admin login
        if (adminMode && result.error.message && result.error.message.includes('Invalid login')) {
          setErrorMessage("Accès refusé. Ce compte n'a pas les droits administrateur nécessaires.");
        }
      } else if (result.data) {
        console.log('Login successful:', result.data);
        
        // Get user role from metadata
        const userRole = result.data?.user?.app_metadata?.role;
        console.log('User role from login:', userRole);
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        
        // Vérification stricte du mode et du rôle pour la redirection
        if (adminMode && userRole === 'admin') {
          navigate('/super-admin-dashboard');
        } else if (isSfdAdmin && userRole === 'sfd_admin') {
          navigate('/agency-dashboard');
        } else if (!adminMode && !isSfdAdmin && (userRole === 'user' || userRole === 'client')) {
          navigate('/mobile-flow/main');
        } else {
          // Redirection incorrecte - rôle ne correspond pas au mode
          setErrorMessage(`Accès refusé. Votre compte (${userRole}) n'a pas les droits nécessaires pour cette interface.`);
          
          // Déconnexion automatique après connexion incorrecte
          setTimeout(async () => {
            await signOut();
          }, 1000);
        }
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
