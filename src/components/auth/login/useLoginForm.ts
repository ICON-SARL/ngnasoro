
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

export const useLoginForm = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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
  };
};
