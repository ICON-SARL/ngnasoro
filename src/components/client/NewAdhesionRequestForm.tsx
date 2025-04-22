
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Définir le schéma de validation du formulaire
const formSchema = z.object({
  full_name: z.string().min(2, {
    message: 'Le nom complet doit contenir au moins 2 caractères',
  }),
  email: z.string().email({
    message: 'Veuillez saisir une adresse email valide',
  }),
  phone: z.string().min(8, {
    message: 'Veuillez saisir un numéro de téléphone valide',
  }),
  address: z.string().optional(),
  profession: z.string().optional(),
  monthly_income: z.string().optional(),
  source_of_income: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewAdhesionRequestFormProps {
  onSubmit: (data: FormValues) => void;
  initialData?: any;
  isSubmitting?: boolean;
}

export const NewAdhesionRequestForm: React.FC<NewAdhesionRequestFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  // Initialiser le formulaire avec react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      profession: initialData?.profession || '',
      monthly_income: initialData?.monthly_income?.toString() || '',
      source_of_income: initialData?.source_of_income || '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input placeholder="john.doe@example.com" type="email" {...field} />
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
                <Input placeholder="76123456" {...field} />
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
                <Textarea placeholder="Votre adresse" {...field} />
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
                <Input placeholder="Commerçant, Agriculteur, etc." {...field} />
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
                <Input placeholder="100000" type="number" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une source de revenu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="salary">Salaire</SelectItem>
                  <SelectItem value="business">Commerce</SelectItem>
                  <SelectItem value="farming">Agriculture</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
            </>
          ) : initialData ? (
            'Mettre à jour la demande'
          ) : (
            'Soumettre la demande'
          )}
        </Button>
      </form>
    </Form>
  );
};
