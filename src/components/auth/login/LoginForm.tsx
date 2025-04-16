
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email({ message: "L'email est invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

type LoginFormProps = {
  adminMode?: boolean;
  isSfdAdmin?: boolean;
  onError?: (message: string) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ 
  adminMode = false, 
  isSfdAdmin = false,
  onError
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      if (onError) onError(''); // Clear previous errors
      
      console.log('Attempting login with email:', values.email);
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error('Login error:', error);
        
        // Determine user-friendly error message
        let errorMessage = "Une erreur s'est produite lors de la connexion.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
        } else if (error.message.includes('network')) {
          errorMessage = "Problème de connexion réseau. Vérifiez votre connexion internet";
        }
        
        // Set local error state
        setLoginError(errorMessage);
        
        // Display toast notification
        toast({
          title: "Échec de connexion",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Propagate error to parent if callback provided
        if (onError) onError(errorMessage);
        
        setIsLoading(false);
        return;
      }
      
      // If we get here, login was successful
      console.log('Login successful');
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      
    } catch (err) {
      console.error('Unexpected error during login:', err);
      
      const errorMessage = "Une erreur inattendue s'est produite lors de la connexion";
      setLoginError(errorMessage);
      
      // Show generic error message
      toast({
        title: "Erreur inattendue",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (onError) onError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        {loginError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="exemple@email.com"
                  type="email"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    {...field}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="text-right">
          <a href="#" className="text-sm text-primary hover:underline">
            Mot de passe oublié?
          </a>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            <>Se connecter</>
          )}
        </Button>
        
        {adminMode && (
          <div className="mt-4 text-xs text-center text-amber-600">
            Interface administrateur MEREF avec accès aux fonctionnalités avancées
          </div>
        )}
        
        {isSfdAdmin && (
          <div className="mt-4 text-xs text-center text-blue-600">
            Interface administrateur SFD avec accès à la gestion de votre SFD
          </div>
        )}
      </form>
    </Form>
  );
};

export default LoginForm;
