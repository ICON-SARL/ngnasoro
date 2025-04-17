
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useSfdAdhesionRequests } from '@/hooks/useSfdAdhesionRequests';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { AdhesionRequestInput } from '@/hooks/useClientAdhesions';

interface NewAdhesionRequestFormProps {
  sfdId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  full_name: z.string().min(3, 'Le nom complet est requis'),
  profession: z.string().optional(),
  monthly_income: z.string().optional(),
  source_of_income: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewAdhesionRequestForm({ sfdId, onSuccess }: NewAdhesionRequestFormProps) {
  const { submitAdhesionRequest, isSubmitting } = useSfdAdhesionRequests();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      profession: '',
      monthly_income: '',
      source_of_income: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Ensure full_name is not empty - it's required in the AdhesionRequestInput type
      if (!values.full_name) {
        form.setError('full_name', { 
          type: 'manual', 
          message: 'Le nom complet est requis' 
        });
        return;
      }
      
      const input: AdhesionRequestInput = {
        full_name: values.full_name,
        profession: values.profession,
        monthly_income: values.monthly_income,
        source_of_income: values.source_of_income,
        phone: values.phone,
        email: values.email,
        address: values.address
      };
      
      const result = await submitAdhesionRequest(sfdId, input);
      
      if (result.success) {
        form.reset();
        if (onSuccess) onSuccess();
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
              <FormLabel>Nom complet *</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="Numéro de téléphone" {...field} />
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
                  <Input placeholder="Adresse email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input placeholder="Votre profession" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="monthly_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revenu mensuel (FCFA)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 150000" {...field} />
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
                  <Input placeholder="Ex: Salaire, Commerce..." {...field} />
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
                <Input placeholder="Votre adresse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Envoi en cours...
              </>
            ) : (
              'Soumettre la demande'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
