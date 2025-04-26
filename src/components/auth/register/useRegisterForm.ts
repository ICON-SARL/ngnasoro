
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { initializeSupabase } from '@/utils/initSupabase';
import { registerSchema, RegisterFormValues } from './schema';
import { generateClientCode, storeClientCode } from '@/utils/clientCodeUtils';

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
    },
  });

  // Function to initialize user account
  const initializeUserAccount = async (userId: string, fullName: string) => {
    try {
      console.log("Initializing account for user:", userId);
      
      // Generate a unique client code for the user
      const userClientCode = generateClientCode();
      
      // Check if profile exists first
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileCheckError) {
        // Create profile if it doesn't exist
        const profileData: Record<string, any> = {
          id: userId,
          full_name: fullName,
          email: form.getValues('email')
        };
        
        // Add client_code to the custom object
        profileData.client_code = userClientCode;
        
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert(profileData);
          
        if (createProfileError) {
          console.error("Error creating profile:", createProfileError);
          throw new Error("Failed to create user profile");
        }
      } else {
        // Update the existing profile with the client code using a custom object
        const updateData: Record<string, any> = { 
          client_code: userClientCode 
        };
        
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
          
        if (updateProfileError) {
          console.error("Error updating profile with client code:", updateProfileError);
          // Non-blocking error - we continue
        }
      }
      
      // Save client code in state to display to user
      setClientCode(userClientCode);
      
      // Store client code in local storage
      localStorage.setItem(`client_code_${userId}`, userClientCode);
      
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
    setClientCode(null);
    
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
      const result = await signUp(data.email, data.password, metadata);
      
      if (result.error) {
        throw result.error;
      }
      
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
      
      setSuccessMessage(`Inscription réussie! Conservez votre code client: ${clientCode || 'En cours de génération...'}`);
      
      toast({
        title: "Inscription réussie",
        description: `Votre compte a été créé avec succès. Votre code client est: ${clientCode || 'En cours de génération...'}`,
      });
      
      // Reset form after successful registration
      form.reset();
      
      // Redirect to SFD selector page after a delay
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
