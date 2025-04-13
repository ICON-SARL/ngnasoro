
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  adminMode?: boolean;
  isSfdAdmin?: boolean;
  onError?: (errorMessage: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  adminMode = false, 
  isSfdAdmin = false,
  onError
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Error during login:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message || "Vérifiez vos identifiants et réessayez.",
          variant: "destructive",
        });
        onError?.(error.message);
        return;
      }
      
      console.log('Login successful, redirecting...');
      
      // Redirect will be handled by the AuthContext based on user role
      
    } catch (err: any) {
      console.error('Unexpected error during login:', err);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
        variant: "destructive",
      });
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Adresse e-mail
        </label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={adminMode ? "border-amber-200 focus:border-amber-400" : 
                    isSfdAdmin ? "border-blue-200 focus:border-blue-400" :
                    "border-emerald-200 focus:border-emerald-400"}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <a href="#" className="text-xs text-primary hover:underline">
            Mot de passe oublié?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={adminMode ? "border-amber-200 focus:border-amber-400" : 
                   isSfdAdmin ? "border-blue-200 focus:border-blue-400" :
                   "border-emerald-200 focus:border-emerald-400"}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className={`w-full ${adminMode ? "bg-amber-600 hover:bg-amber-700" : 
                  isSfdAdmin ? "bg-blue-600 hover:bg-blue-700" :
                  "bg-[#0D6A51] hover:bg-[#0D6A51]/90"}`}
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
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
