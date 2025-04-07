
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
      
      // Appeler la méthode signUp sans essayer d'accéder au résultat directement
      await signUp(data.email, data.password, metadata);
      
      // Puisque signUp ne retourne pas d'utilisateur, obtenons la session actuelle
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Si nous avons un utilisateur dans la session, initialisons son compte
      if (sessionData?.session?.user?.id) {
        await initializeUserAccount(sessionData.session.user.id, data.fullName);
      }
      
      setSuccessMessage("Inscription réussie! Vous allez être redirigé vers la page de sélection SFD.");
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous devez maintenant ajouter une SFD.",
      });
      
      // Reset form after successful registration
      form.reset();
      
      // Redirection vers la page de sélection SFD après un délai
      setTimeout(() => {
        navigate('/sfd-selector', { replace: true });
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

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    errorMessage,
    successMessage
  };
};
