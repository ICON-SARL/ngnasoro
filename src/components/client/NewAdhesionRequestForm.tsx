import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAuth } from '@/hooks/useAuth';
import { useClientAdhesions, AdhesionRequestInput } from '@/hooks/useClientAdhesions';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(2, { message: 'Le nom est requis' }),
  profession: z.string().min(2, { message: 'La profession est requise' }),
  monthly_income: z.string().min(1, { message: 'Le revenu mensuel est requis' }),
  source_of_income: z.string().min(2, { message: 'La source de revenu est requise' }),
  phone: z.string().min(8, { message: 'Le numéro de téléphone est requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  address: z.string().min(5, { message: 'L\'adresse est requise' }),
});

// Define the type for the form values based on the schema
type FormValues = z.infer<typeof formSchema>;

interface NewAdhesionRequestFormProps {
  sfdId: string;
  onSuccess?: () => void;
}

export const NewAdhesionRequestForm: React.FC<NewAdhesionRequestFormProps> = ({ 
  sfdId,
  onSuccess 
}) => {
  const { user } = useAuth();
  const { submitAdhesionRequest, isCreatingRequest } = useClientAdhesions();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      profession: '',
      monthly_income: '',
      source_of_income: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Create the properly typed adhesion data
      const adhesionData: AdhesionRequestInput = {
        full_name: values.full_name,
        profession: values.profession,
        monthly_income: values.monthly_income,
        source_of_income: values.source_of_income,
        phone: values.phone,
        email: values.email,
        address: values.address,
      };
      
      const { success } = await submitAdhesionRequest(sfdId, adhesionData);
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting adhesion request:', error);
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
              <FormLabel>Revenu mensuel</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
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
                <Input {...field} />
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
                <Input {...field} type="tel" />
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
                <Input {...field} type="email" />
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

        <Button 
          type="submit" 
          className="w-full"
          disabled={isCreatingRequest}
        >
          {isCreatingRequest ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer la demande'
          )}
        </Button>
      </form>
    </Form>
  );
};
