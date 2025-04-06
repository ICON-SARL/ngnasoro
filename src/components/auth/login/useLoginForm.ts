
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the form schema
const loginSchema = z.object({
  email: z.string().email({
    message: 'Veuillez entrer une adresse email valide.',
  }),
  password: z.string().min(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginForm = (adminMode: boolean = false, isSfdAdmin: boolean = false) => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Use the correct signIn parameter structure
      const result = await signIn({
        email,
        password
      });
      
      if (result.error) {
        setErrorMessage(result.error.message || 'Échec de la connexion. Vérifiez vos identifiants.');
        
        // Implement cooldown after failed attempts (simplified)
        setCooldownActive(true);
        setCooldownTime(30);
        
        const timer = setInterval(() => {
          setCooldownTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCooldownActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return;
      }
      
      // Success case
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur la plateforme MEREF-SFD.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Une erreur s\'est produite lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Use the correct signIn parameter structure
      const result = await signIn({
        email: data.email,
        password: data.password
      });
      
      if (result.error) {
        toast({
          title: 'Erreur de connexion',
          description: result.error.message || 'Échec de la connexion. Vérifiez vos identifiants.',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur la plateforme MEREF-SFD.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Une erreur s\'est produite lors de la connexion.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    errorMessage,
    cooldownActive,
    cooldownTime,
    emailSent,
    handleLogin
  };
};
