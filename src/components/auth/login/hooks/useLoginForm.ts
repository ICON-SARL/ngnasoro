
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLoginValidation } from './useLoginValidation';
import { useCooldown } from './useCooldown';
import { logSuccessfulAuthentication, logFailedAuthentication } from '../utils/auditLogging';
import { LoginFormProps, LoginFormHookReturn } from '../types/loginTypes';
import { extractCooldownTime } from '../utils/errorHandling';

export const useLoginForm = (adminMode: boolean = false, isSfdAdmin: boolean = false): LoginFormHookReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'simple' | 'advanced'>('simple');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { errorMessage, setErrorMessage, validateEmail, validatePassword, clearError } = useLoginValidation();
  const { cooldownActive, cooldownTime, activateCooldown } = useCooldown();

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setEmailSent(false);
    
    // Don't allow login during cooldown
    if (cooldownActive) {
      setErrorMessage(`Veuillez attendre ${cooldownTime} secondes avant de réessayer.`);
      return;
    }

    // Email validation
    if (!validateEmail(email)) return;

    // Password validation
    if (!validatePassword(password)) return;
    
    setIsLoading(true);
    
    try {
      // Use password authentication - fixed return type handling
      const result = await signIn(email, password);
      
      if (result.error) {
        throw result.error;
      }

      // Check if we have user data after successful login
      if (!result.data?.session?.user) {
        throw new Error("Session information is missing after login");
      }

      // Log successful authentication
      console.log("Connexion réussie:", { email, adminMode, isSfdAdmin });
      
      // Log successful authentication attempt
      await logSuccessfulAuthentication(user?.id, email, adminMode, isSfdAdmin);
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      
      // Get user role from the session
      const userRole = result.data?.session?.user?.app_metadata?.role;
      console.log("User role:", userRole);
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow/main');
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Log failed authentication attempt
      await logFailedAuthentication(user?.id, email, adminMode, isSfdAdmin, error.message);
      
      // Check for rate limiting errors
      if (error.message && error.message.includes('rate limit') && error.message.includes('seconds')) {
        const waitTime = extractCooldownTime(error.message);
        activateCooldown(waitTime);
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    authMode,
    showAuthDialog,
    setShowAuthDialog,
    isLoading,
    errorMessage,
    cooldownActive,
    cooldownTime,
    emailSent,
    handleLogin,
    adminMode,
    isSfdAdmin
  };
};
