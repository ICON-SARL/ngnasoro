
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import { clientFormSchema, ClientFormData } from './types';
import { ClientLookupResult } from '@/utils/client-code/lookup';
import { normalizeMaliPhoneNumber } from '@/lib/constants';

export function useClientForm(onSuccess: () => void) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { createClient } = useSfdClientManagement();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
      notes: '',
    },
  });

  const handleClientFound = (client: ClientLookupResult) => {
    setFoundUserId(client.user_id || null);
    form.reset({
      full_name: client.full_name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: '',
      id_type: '',
      id_number: '',
      notes: '',
    });
    
    if (client.user_id) {
      form.setValue('email', client.email || '', { shouldValidate: true });
      form.setValue('phone', client.phone || '', { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      const clientData = {
        ...data,
        full_name: data.full_name,
        phone: data.phone ? normalizeMaliPhoneNumber(data.phone) : undefined,
        user_id: foundUserId
      };
      
      await createClient.mutateAsync(clientData);
      form.reset();
      setFoundUserId(null);
      
      toast({
        title: 'Client créé avec succès',
        description: 'Le nouveau client a été ajouté à votre SFD',
      });
      
      // Call the success callback
      onSuccess();
      
      // Optionally navigate to the clients page
      // navigate('/sfd-clients');
    } catch (error: any) {
      // Improved error handling for duplicate clients
      if (error.message && error.message.includes("existe déjà")) {
        toast({
          title: 'Client déjà existant',
          description: error.message || 'Un client avec ces informations existe déjà.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erreur',
          description: error.message || 'Erreur lors de la création du client',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleClientFound,
    onSubmit,
  };
}
