
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/auditLogger';

export const useLoginForm = (adminMode: boolean = false, sfdMode: boolean = false) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'simple' | 'advanced'>('simple');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  
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

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage(null);
    setEmailSent(false);
    
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

    // Password validation
    if (!password || password.length < 6) {
      setErrorMessage('Veuillez entrer un mot de passe valide (minimum 6 caractères).');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use password authentication (false for magic link)
      await signIn(email, password, false);
      
      // Log successful authentication attempt
      await logAuditEvent({
        action: adminMode ? "admin_login_attempt" : sfdMode ? "sfd_admin_login_attempt" : "password_login_attempt",
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        details: { email, admin_mode: adminMode, sfd_mode: sfdMode }
      });
      
      // La redirection est gérée par le composant AuthUI en fonction du rôle
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Log failed authentication attempt
      await logAuditEvent({
        action: adminMode ? "admin_login_failed" : sfdMode ? "sfd_admin_login_failed" : "password_login_attempt",
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        error_message: error.message,
        details: { email, admin_mode: adminMode, sfd_mode: sfdMode }
      });
      
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
    handleAuthComplete,
    toggleAuthMode,
    adminMode,
    sfdMode
  };
};
