
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AuthenticationSystem from '@/components/AuthenticationSystem';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {cooldownActive && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Délai d'attente</AlertTitle>
          <AlertDescription className="text-amber-700">
            Vous pourrez réessayer dans {cooldownTime} secondes
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || cooldownActive}
            />
          </div>
        </div>
        
        {authMode === 'simple' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="text-muted-foreground">Authentification par lien magique</span>
            </div>
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-primary" 
              type="button"
              onClick={toggleAuthMode}
              disabled={isLoading || cooldownActive}
            >
              Méthode avancée
            </Button>
          </div>
        )}
        
        {authMode === 'advanced' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-primary" />
              <span className="text-muted-foreground">Authentification avancée activée</span>
            </div>
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-muted-foreground" 
              type="button"
              onClick={toggleAuthMode}
              disabled={isLoading}
            >
              Méthode simple
            </Button>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || cooldownActive}
        >
          {isLoading ? 'Chargement...' : (authMode === 'simple' ? 'Se connecter' : 'Authentification sécurisée')}
        </Button>
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Ou</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">Facebook</Button>
        </div>
      </form>
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <AuthenticationSystem onComplete={handleAuthComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;
