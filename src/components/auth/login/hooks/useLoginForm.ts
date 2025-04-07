
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
      // Use password authentication
      const result = await signIn(email, password);
      
      if (result.error) {
        throw result.error;
      }

      // Log successful authentication
      console.log("Connexion réussie:", { email, adminMode, isSfdAdmin });
      
      // Get user information - we need to handle the case where user might be null initially
      const userId = user?.id || 'pending';
      
      // Log successful authentication attempt
      try {
        if (user?.id) {
          await logSuccessfulAuthentication(user.id, email, adminMode, isSfdAdmin);
        }
      } catch (logError) {
        console.warn("Failed to log authentication:", logError);
      }
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      
      // Get user role from the result
      const userData = result.data?.session?.user;
      const userRole = userData?.app_metadata?.role;
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
      try {
        // Only log if user exists to avoid the "invalid input syntax for type uuid" error
        if (user?.id) {
          await logFailedAuthentication(user.id, email, adminMode, isSfdAdmin, error.message);
        }
      } catch (logError) {
        console.warn("Error logging audit event:", logError);
      }
      
      // Check for rate limiting errors
      if (error.message && error.message.includes('rate limit') && error.message.includes('seconds')) {
        const waitTime = extractCooldownTime(error.message);
        // Convert to string before passing to activateCooldown
        activateCooldown(waitTime.toString());
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
