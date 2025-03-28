import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/auth';
import { getRedirectPath } from '@/hooks/auth/authUtils';
import { toast } from '@/hooks/use-toast';

interface LoginFormProps {
  adminMode?: boolean;
  sfdMode?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ adminMode = false, sfdMode = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, session, userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur de connexion",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      // Success toast
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Ngnasoro!",
        variant: "default",
      });
      
    } catch (error: any) {
      // Error toast
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect based on role when session changes
  React.useEffect(() => {
    if (session) {
      const redirectPath = getRedirectPath(session);
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);
    }
  }, [session, navigate]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">
        {adminMode 
          ? "Connexion Super Admin" 
          : sfdMode 
            ? "Connexion Admin SFD" 
            : "Connexion"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <a href="#" className="text-xs text-[#0D6A51] hover:underline">
              Mot de passe oublié?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Se souvenir de moi
            </label>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-[#0D6A51] hover:bg-[#0A5A45]"
          disabled={isLoading}
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
        
        {adminMode && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Pour les comptes de test:</p>
            <p className="font-medium">Email: admin@ngnasoro.ml</p>
            <p className="font-medium">Mot de passe: AdminPass123!</p>
          </div>
        )}
        
        {sfdMode && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Pour les comptes de test:</p>
            <p className="font-medium">Email: sfd-admin@ngnasoro.ml</p>
            <p className="font-medium">Mot de passe: SFDAdmin123!</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
