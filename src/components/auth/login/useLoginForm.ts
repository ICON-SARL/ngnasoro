
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/utils/auth/authCleanup';

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
      // Clean up auth state before attempting login
      cleanupAuthState();
      
      console.log('Tentative de connexion avec:', { email, adminMode, isSfdAdmin });
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
        
        // Specific error handling based on mode
        if (adminMode && result.error.message && result.error.message.includes('Invalid login')) {
          setErrorMessage("Accès refusé. Ce compte n'a pas les droits administrateur nécessaires.");
        }
        
        if (isSfdAdmin && result.error.message && result.error.message.includes('Invalid login')) {
          setErrorMessage("Accès refusé. Ce compte n'a pas les droits d'administrateur SFD nécessaires.");
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
        
        // Redirect based on mode and user role
        if (adminMode) {
          if (userRole === 'admin') {
            navigate('/super-admin-dashboard');
          } else {
            setErrorMessage("Accès refusé. Ce compte n'a pas les droits administrateur nécessaires.");
            if (onError) onError("Accès refusé. Ce compte n'a pas les droits administrateur nécessaires.");
            return;
          }
        } else if (isSfdAdmin) {
          if (userRole === 'sfd_admin') {
            navigate('/agency-dashboard');
          } else {
            setErrorMessage("Accès refusé. Ce compte n'a pas les droits d'administrateur SFD nécessaires.");
            if (onError) onError("Accès refusé. Ce compte n'a pas les droits d'administrateur SFD nécessaires.");
            return;
          }
        } else {
          navigate('/mobile-flow/main');
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
