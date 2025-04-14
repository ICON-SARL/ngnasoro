
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const adhesionRequestSchema = z.object({
  full_name: z.string().min(3, 'Le nom complet est requis'),
  profession: z.string().min(2, 'La profession est requise'),
  monthly_income: z.string().min(1, 'Le revenu mensuel est requis'),
  source_of_income: z.string().min(2, 'La source de revenu est requise'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide'),
  address: z.string().min(5, 'L\'adresse est requise'),
});

type FormData = z.infer<typeof adhesionRequestSchema>;

interface NewAdhesionRequestFormProps {
  sfdId: string;
  onSuccess?: () => void;
}

export function NewAdhesionRequestForm({ sfdId, onSuccess }: NewAdhesionRequestFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(adhesionRequestSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      profession: '',
      monthly_income: '',
      source_of_income: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour soumettre une demande.',
          variant: 'destructive',
        });
        return;
      }

      // Assurez-vous que full_name n'est pas vide
      if (!data.full_name) {
        toast({
          title: 'Erreur',
          description: 'Le nom complet est obligatoire.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          full_name: data.full_name,
          profession: data.profession,
          monthly_income: parseFloat(data.monthly_income), // Convertir en nombre
          source_of_income: data.source_of_income,
          phone: data.phone,
          email: data.email,
          address: data.address,
          sfd_id: sfdId,
          user_id: user.id,
          status: 'pending',
          kyc_status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès.',
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de votre demande.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthly_income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revenu mensuel (FCFA)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source_of_income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source de revenu</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salaire</SelectItem>
                    <SelectItem value="business">Entreprise</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
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
                <Input type="email" {...field} />
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
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Soumettre la demande
        </Button>
      </form>
    </Form>
  );
}
