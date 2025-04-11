
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const clientFormSchema = z.object({
  full_name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Email invalide' }),
  phone: z.string().min(8, { message: 'Numéro de téléphone invalide' }),
  address: z.string().min(5, { message: 'Adresse requise' }),
  id_type: z.enum(['passport', 'national_id', 'driver_license']),
  id_number: z.string().min(3, { message: 'Numéro d\'identification invalide' }),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export const NewClientForm = () => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: 'national_id',
      id_number: '',
      notes: '',
    },
  });

  const { toast } = useToast();

  const onSubmit = async (data: ClientFormValues) => {
    try {
      // For now, we're just logging the data and showing a success message
      console.log('Client data submitted:', data);
      
      toast({
        title: 'Client créé avec succès',
        description: `${data.full_name} a été ajouté à votre liste de clients.`,
      });
      
      form.reset();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du client.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input placeholder="Amadou Diallo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="amadou.diallo@example.com" {...field} />
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
                  <Input placeholder="+223 76 00 00 00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="Bamako, Mali" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="id_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'identification</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type d'ID" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="national_id">Carte d'identité nationale</SelectItem>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="driver_license">Permis de conduire</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro d'identification</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
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
                <Textarea 
                  placeholder="Informations supplémentaires sur le client..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
          <Button type="submit">Créer le client</Button>
        </div>
      </form>
    </Form>
  );
};
