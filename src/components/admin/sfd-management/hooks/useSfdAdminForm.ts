
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SfdAdminFormData } from '../types';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';

const formSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  sfd_id: z.string().uuid("Veuillez sélectionner une SFD"),
  notify: z.boolean().default(true),
});

export const useSfdAdminForm = (onSuccess: () => void) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createSfdAdmin, isLoading, error: apiError } = useSfdAdminManagement();

  const form = useForm<SfdAdminFormData>({
    resolver: zodResolver<SfdAdminFormData>(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      sfd_id: '',
      notify: true,
    },
  });

  const handleFormSubmit = async (values: SfdAdminFormData) => {
    setSubmitError(null);
    
    try {
      const success = await createSfdAdmin(values.email, values.sfd_id);
      
      if (success) {
        form.reset();
        onSuccess();
      } else {
        setSubmitError(apiError || "Une erreur s'est produite lors de la création de l'administrateur");
      }
    } catch (error: any) {
      setSubmitError(error.message || "Une erreur s'est produite lors de la création de l'administrateur");
    }
  };

  return {
    form,
    isLoading,
    submitError,
    handleSubmit: form.handleSubmit(handleFormSubmit),
  };
};
