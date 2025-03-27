
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AuthenticationSystem from '@/components/AuthenticationSystem';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'simple' | 'advanced'>('simple');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'advanced') {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      // Use OTP authentication
      await signIn(email);
      toast({
        title: "Connectez-vous avec le lien magique",
        description: "Vérifiez votre e-mail pour le lien de connexion.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleAuthComplete = () => {
    setShowAuthDialog(false);
    toast({
      title: "Authentification réussie",
      description: "Vous êtes maintenant connecté.",
    });
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'simple' ? 'advanced' : 'simple');
  };

  return (
    <>
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
            >
              Méthode simple
            </Button>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
        >
          {authMode === 'simple' ? 'Se connecter' : 'Authentification sécurisée'}
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
