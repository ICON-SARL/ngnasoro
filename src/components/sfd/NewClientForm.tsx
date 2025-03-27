
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClients } from '@/hooks/useSfdClients';

interface NewClientFormProps {
  onSuccess?: () => void;
}

export const NewClientForm = ({ onSuccess }: NewClientFormProps) => {
  const { activeSfdId } = useAuth();
  const { createClient } = useSfdClients();
  
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      idNumber: '',
      idType: '',
      notes: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await createClient.mutateAsync({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        id_number: data.idNumber,
        id_type: data.idType,
        notes: data.notes,
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Nom et prénom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+223 XX XX XX XX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Adresse du client" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="idType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de pièce d'identité</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="driver">Permis de conduire</SelectItem>
                    <SelectItem value="voter">Carte d'électeur</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de pièce d'identité</FormLabel>
                <FormControl>
                  <Input placeholder="Numéro de la pièce" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Informations supplémentaires" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={createClient.isPending}>
            {createClient.isPending ? 'Création...' : 'Créer le client'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
