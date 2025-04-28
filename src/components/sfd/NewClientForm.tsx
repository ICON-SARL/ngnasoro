import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import { ClientCodeSearchSection } from './ClientCodeSearchSection';
import { ClientLookupResult } from '@/utils/client-code/lookup';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';

interface NewClientFormProps {
  onSuccess: () => void;
}

// Form schema
const formSchema = z.object({
  full_name: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function NewClientForm({ onSuccess }: NewClientFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { createClient } = useSfdClientManagement();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const clientData = {
        ...data,
        full_name: data.full_name,
        user_id: foundUserId // Include the found user ID if it exists
      };
      
      await createClient.mutateAsync(clientData);
      form.reset();
      setFoundUserId(null); // Reset the found user ID
      
      // After successful creation and query invalidation
      toast({
        title: 'Client créé avec succès',
        description: 'Le nouveau client a été ajouté à votre SFD',
      });
      navigate('/sfd-clients'); // Navigate after successful creation
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du client',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ClientCodeSearchSection onClientFound={handleClientFound} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet *</Label>
            <Input
              id="full_name"
              placeholder="Nom complet du client"
              {...form.register('full_name')}
              className={form.formState.errors.full_name ? 'border-red-500' : ''}
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email du client"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="Ex: +223 XXXXXXXX"
                {...form.register('phone')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder="Adresse du client"
              {...form.register('address')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_type">Type de pièce d'identité</Label>
              <Input
                id="id_type"
                placeholder="CNI, Passeport, etc."
                {...form.register('id_type')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
              <Input
                id="id_number"
                placeholder="Numéro de la pièce"
                {...form.register('id_number')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Notes additionnelles"
              {...form.register('notes')}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer le client'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
