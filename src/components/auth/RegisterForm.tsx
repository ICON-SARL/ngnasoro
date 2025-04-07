
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, Lock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { initializeSupabase } from '@/utils/initSupabase';

const registerSchema = z.object({
  fullName: z.string()
    .min(3, { message: 'Le nom complet doit contenir au moins 3 caractères' })
    .max(50, { message: 'Le nom complet ne peut pas dépasser 50 caractères' }),
  email: z.string()
    .email({ message: 'Veuillez entrer une adresse email valide' }),
  phoneNumber: z.string()
    .min(8, { message: 'Le numéro de téléphone doit contenir au moins 8 chiffres' })
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
    .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  // Fonction pour initialiser le compte utilisateur
  const initializeUserAccount = async (userId: string, fullName: string) => {
    try {
      // Créer un compte utilisateur s'il n'existe pas déjà
      const { data: existingAccount, error: accountCheckError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (accountCheckError && accountCheckError.code === 'PGRST116') {
        // Compte non existant, créer un nouveau compte
        const { error: createAccountError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            balance: 200000, // Solde par défaut
            currency: 'FCFA'
          });
          
        if (createAccountError) {
          console.error("Erreur lors de la création du compte:", createAccountError);
        }
      }
      
      // Vérifier si le profil existe et le créer ou mettre à jour si nécessaire
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // Profil non existant, créer un nouveau profil
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName
          });
          
        if (createProfileError) {
          console.error("Erreur lors de la création du profil:", createProfileError);
        }
      }
      
      // Initialiser les données associées à Supabase
      await initializeSupabase();
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation du compte:", error);
      return false;
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log("Début de l'inscription avec les données:", { 
        email: data.email, 
        fullName: data.fullName, 
        hasPhone: !!data.phoneNumber 
      });
      
      // Create a proper metadata object with user details
      const metadata = {
        full_name: data.fullName,
        phone: data.phoneNumber || undefined
      };
      
      const result = await signUp(data.email, data.password, metadata);
      
      console.log("Résultat de l'inscription:", result);
      
      // Initialize user account data
      if (result?.user?.id) {
        await initializeUserAccount(result.user.id, data.fullName);
      }
      
      setSuccessMessage("Inscription réussie! Vous allez être redirigé vers la page de connexion.");
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      
      // Reset form after successful registration
      form.reset();
      
      // Redirection vers la page de connexion après un délai
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Show more specific error messages based on the error type
      if (error.message?.includes('Database error saving new user')) {
        setErrorMessage("Erreur lors de l'enregistrement des données utilisateur. Veuillez réessayer.");
      } else if (error.message?.includes('already registered')) {
        setErrorMessage("Cette adresse email est déjà associée à un compte.");
      } else if (error.message?.includes('rate limit')) {
        setErrorMessage("Trop de tentatives. Veuillez réessayer dans quelques minutes.");
      } else {
        setErrorMessage(error.message || "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
      }
      
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {errorMessage && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur d'inscription</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Inscription réussie</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name" className="block text-sm font-medium mb-1">
                  Nom complet
                </FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nom et prénom"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reg-email" className="block text-sm font-medium mb-1">
                  Email
                </FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phone-reg" className="block text-sm font-medium mb-1">
                  Numéro de téléphone
                </FormLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      id="phone-reg"
                      type="tel"
                      placeholder="+223 00 00 00 00"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reg-password" className="block text-sm font-medium mb-1">
                  Mot de passe
                </FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inscription en cours..." : "Créer un compte"}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="underline text-[#0D6A51]">
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="underline text-[#0D6A51]">
              Politique de confidentialité
            </a>
            .
          </p>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
