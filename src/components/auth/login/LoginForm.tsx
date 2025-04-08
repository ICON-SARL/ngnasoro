
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  adminMode?: boolean;
  isSfdAdmin?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ adminMode = false, isSfdAdmin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur de connexion",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        let errorMessage = "Une erreur s'est produite lors de la connexion.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Identifiants invalides. Veuillez vérifier votre email et mot de passe.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte mail.";
        }
        
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      // Redirection is handled by the parent component
      
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClasses = () => {
    if (adminMode) {
      return "bg-amber-600 hover:bg-amber-700";
    } else if (isSfdAdmin) {
      return "bg-blue-600 hover:bg-blue-700";
    }
    return "bg-[#0D6A51] hover:bg-[#0D6A51]/90";
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="votre@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <a href="#" className="text-xs text-blue-600 hover:underline">
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
        />
      </div>
      
      <Button 
        type="submit" 
        className={`w-full ${getButtonClasses()}`} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
