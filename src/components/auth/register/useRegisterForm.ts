
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { initializeSupabase } from '@/utils/initSupabase';
import { registerSchema, RegisterFormValues } from './schema';

export const useRegisterForm = () => {
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

  // Function to initialize user account
  const initializeUserAccount = async (userId: string, fullName: string) => {
    try {
      console.log("Initializing account for user:", userId);
      
      // Check if profile exists first
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileCheckError) {
        // Create profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            email: form.getValues('email')
          });
          
        if (createProfileError) {
          console.error("Error creating profile:", createProfileError);
          throw new Error("Failed to create user profile");
        }
      }
      
      // Check if account exists
      const { data: existingAccount, error: accountCheckError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (accountCheckError) {
        // Create account if it doesn't exist
        const { error: createAccountError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            balance: 200000,
            currency: 'FCFA'
          });
          
        if (createAccountError) {
          console.error("Error creating account:", createAccountError);
          throw new Error("Failed to create user account");
        }
      }
      
      // Initialize Supabase data
      await initializeSupabase();
      
      return true;
    } catch (error) {
      console.error("Error initializing user account:", error);
      throw error;
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log("Starting registration with data:", { 
        email: data.email, 
        fullName: data.fullName, 
        hasPhone: !!data.phoneNumber 
      });
      
      // Create metadata object
      const metadata = {
        full_name: data.fullName,
        phone: data.phoneNumber || undefined
      };
      
      // Register the user
      await signUp(data.email, data.password, metadata);
      
      // Get the session to access the user ID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Failed to get user session after registration");
      }
      
      if (!sessionData?.session?.user?.id) {
        throw new Error("No user ID found after registration");
      }
      
      // Initialize the user account
      await initializeUserAccount(sessionData.session.user.id, data.fullName);
      
      setSuccessMessage("Inscription réussie! Vous allez être redirigé vers la page de sélection SFD.");
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous devez maintenant ajouter une SFD.",
      });
      
      // Reset form after successful registration
      form.reset();
      
      // Redirect to SFD selector page after a delay
      setTimeout(() => {
        navigate('/sfd-selector', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Show specific error messages
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

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    errorMessage,
    successMessage
  };
};
