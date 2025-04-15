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
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Validation améliorée pour numéro de téléphone malien
const phoneRegex = /^(\+223|00223)?[67]\d{7}$/;

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string()
    .regex(phoneRegex, { message: "Numéro de téléphone malien invalide (format: +223 7XXXXXXX ou +223 6XXXXXXX)" })
    .optional()
    .or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  idType: z.string().optional().or(z.literal('')),
  idNumber: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface NewClientFormProps {
  onSuccess?: () => void;
}

export const NewClientForm = ({ onSuccess }: NewClientFormProps) => {
  const { createClient, activeSfdId } = useSfdClients();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      idType: '',
      idNumber: '',
      notes: '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!activeSfdId) {
        throw new Error("SFD ID non défini. Veuillez sélectionner une SFD active.");
      }
      
      await createClient.mutateAsync({
        full_name: data.fullName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        id_type: data.idType || undefined,
        id_number: data.idNumber || undefined,
        notes: data.notes || undefined
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  // Display a warning if no SFD ID is available
  if (!activeSfdId) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aucune SFD active n'est sélectionnée. Veuillez sélectionner une SFD avant de créer un client.
        </AlertDescription>
      </Alert>
    );
  }

  // Original form rendering
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet*</FormLabel>
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
                <FormLabel>Téléphone*</FormLabel>
                <FormControl>
                  <Input placeholder="+223 6XXXXXXX ou +223 7XXXXXXX" {...field} />
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
                <Textarea placeholder="Adresse du client" {...field} />
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
                <Select onValueChange={field.onChange} value={field.value}>
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
            {createClient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer le client"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
