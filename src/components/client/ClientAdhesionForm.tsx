
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
import { useClientAdhesions, AdhesionRequestInput } from '@/hooks/useClientAdhesions.tsx';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Schema definition for adhesion request form
const adhesionFormSchema = z.object({
  full_name: z.string().min(3, 'Le nom complet est requis'),
  profession: z.string().min(2, 'La profession est requise'),
  monthly_income: z.string().min(1, 'Le revenu mensuel est requis'),
  source_of_income: z.string().min(2, 'La source de revenu est requise'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide'),
  address: z.string().min(5, 'L\'adresse est requise'),
});

type AdhesionFormValues = z.infer<typeof adhesionFormSchema>;

interface ClientAdhesionFormProps {
  sfdId: string;
  onSuccess?: () => void;
}

export function ClientAdhesionForm({ sfdId, onSuccess }: ClientAdhesionFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { submitAdhesionRequest, isCreatingRequest } = useClientAdhesions();
  
  // Initialize form with default values from user profile if available
  const form = useForm<AdhesionFormValues>({
    resolver: zodResolver(adhesionFormSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      profession: '',
      monthly_income: '',
      source_of_income: '',
    },
  });

  const onSubmit = async (values: AdhesionFormValues) => {
    try {
      // Create the adhesion data from form values with proper typing
      const adhesionData: AdhesionRequestInput = {
        full_name: values.full_name,
        profession: values.profession,
        monthly_income: values.monthly_income,
        source_of_income: values.source_of_income,
        phone: values.phone,
        email: values.email,
        address: values.address,
      };

      const result = await submitAdhesionRequest(sfdId, adhesionData);
      
      if (result.success) {
        form.reset();
        if (onSuccess) onSuccess();
        
        // Redirect to main page after successful submission
        setTimeout(() => {
          navigate('/mobile-flow/main');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting adhesion form:', error);
    }
  };

  return (
    <>
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <UserCircle2 className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800">Devenir client</AlertTitle>
        <AlertDescription className="text-blue-700">
          Pour accéder à toutes les fonctionnalités de l'application, vous devez devenir client en soumettant cette demande d'adhésion à la SFD.
        </AlertDescription>
      </Alert>

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
            ) : 'Soumettre la demande d\'adhésion'}
          </Button>
        </form>
      </Form>
    </>
  );
}
