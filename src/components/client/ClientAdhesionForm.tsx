
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
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { Loader2 } from 'lucide-react';

// Schéma de validation pour le formulaire
const adhesionSchema = z.object({
  full_name: z.string().min(3, 'Le nom complet est requis'),
  profession: z.string().min(2, 'La profession est requise'),
  monthly_income: z.string().min(1, 'Le revenu mensuel est requis'),
  source_of_income: z.string().min(2, 'La source de revenu est requise'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide'),
  address: z.string().min(5, 'L\'adresse est requise'),
});

type FormData = z.infer<typeof adhesionSchema>;

interface ClientAdhesionFormProps {
  sfdId: string;
  onSuccess?: () => void;
}

export const ClientAdhesionForm: React.FC<ClientAdhesionFormProps> = ({ sfdId, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { submitAdhesionRequest, isCreatingRequest } = useClientAdhesions();
  
  const form = useForm<FormData>({
    resolver: zodResolver(adhesionSchema),
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
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour soumettre une demande.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await submitAdhesionRequest(sfdId, {
        full_name: data.full_name,
        profession: data.profession,
        monthly_income: data.monthly_income,
        source_of_income: data.source_of_income,
        phone: data.phone,
        email: data.email,
        address: data.address,
      });
      
      if (result.success) {
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue lors de l\'envoi de votre demande',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer la demande: ${error.message}`,
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

        <Button type="submit" className="w-full" disabled={isCreatingRequest}>
          {isCreatingRequest ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Soumettre la demande"
          )}
        </Button>
      </form>
    </Form>
  );
};
