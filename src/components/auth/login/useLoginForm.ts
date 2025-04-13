
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useLoginForm(
  adminMode: boolean = false,
  isSfdAdmin: boolean = false,
  onError?: (message: string) => void
) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleError = (message: string) => {
    setErrorMessage(message);
    setIsLoading(false);
    if (onError) onError(message);
    
    // Incrémenter les tentatives échouées
    setLoginAttempts(prev => prev + 1);
    
    // Activer le délai après 3 tentatives échouées
    if (loginAttempts >= 2) {
      const cooldownSeconds = Math.min(30, 5 * 2 ** (loginAttempts - 2));
      setCooldownActive(true);
      setCooldownTime(cooldownSeconds);
      
      const interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (cooldownActive) return;
    
    if (!email || !password) {
      handleError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        
        // Messages d'erreur personnalisés
        if (error.message?.includes('Invalid login credentials')) {
          handleError('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
        } else if (error.message?.includes('Email not confirmed')) {
          handleError('Votre email n\'a pas été confirmé. Veuillez vérifier votre boîte de réception.');
        } else {
          handleError(error.message || 'Erreur de connexion');
        }
        return;
      }
      
      // Réinitialiser les tentatives de connexion en cas de succès
      setLoginAttempts(0);
      
      // Pas besoin de redirection ici, elle sera gérée par le composant parent
      setIsLoading(false);
      
    } catch (err) {
      console.error('Unexpected login error:', err);
      handleError('Une erreur inattendue s\'est produite');
    }
  }, [email, password, cooldownActive, signIn]);
  
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
}
