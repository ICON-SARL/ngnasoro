import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { initializeSupabase } from '@/utils/initSupabase';
import { registerSchema, RegisterFormValues } from './schema';
import { Profile } from '@/types/profile';

export const useRegisterForm = (onError?: (errorMessage: string) => void) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clientCode, setClientCode] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setClientCode(null);
    
    try {
      console.log("Starting registration with data:", { 
        email: data.email, 
        fullName: data.fullName, 
        hasPhone: !!data.phoneNumber 
      });
      
      // Générer le code client
      const userClientCode = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setClientCode(userClientCode);
      
      // Create metadata object
      const metadata = {
        full_name: data.fullName,
        phone: data.phoneNumber || undefined
      };
      
      // Register the user
      const result = await signUp(data.email, data.password, metadata);
      
      if (result.error) {
        throw result.error;
      }
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Failed to get user session after registration");
      }
      
      if (!sessionData?.session?.user?.id) {
        throw new Error("No user ID found after registration");
      }
      
      // Update profile with client code and terms acceptance
      const updateData: any = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        client_code: userClientCode,
        terms_accepted_at: new Date().toISOString(),
        terms_version: '1.0'
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', sessionData.session.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        // Non-blocking error - we continue
      }

      // Initialize the user account
      await initializeSupabase();
      
      setSuccessMessage(`Inscription réussie! Conservez votre code client: ${userClientCode}`);
      
      toast({
        title: "Inscription réussie",
        description: `Votre compte a été créé avec succès. Votre code client est: ${userClientCode}`,
      });
      
      form.reset();
      
      setTimeout(() => {
        navigate('/sfd-selector', { replace: true });
      }, 5000);
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
      
      if (onError) {
        onError(error.message || "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
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
    successMessage,
    clientCode
  };
};
