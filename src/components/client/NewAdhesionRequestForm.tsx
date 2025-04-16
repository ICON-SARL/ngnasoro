
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useClientAdhesions, AdhesionRequestInput } from '@/hooks/useClientAdhesions';
import { useAuth } from '@/hooks/useAuth';

// Schéma de validation pour le formulaire d'adhésion
const adhesionSchema = z.object({
  full_name: z.string().min(3, "Le nom complet est requis"),
  profession: z.string().min(2, "La profession est requise"),
  monthly_income: z.string().min(1, "Le revenu mensuel est requis"),
  source_of_income: z.string().min(2, "La source de revenu est requise"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  address: z.string().min(3, "L'adresse est requise"),
});

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
  
  // Initialiser le formulaire avec react-hook-form et zod
  const form = useForm<z.infer<typeof adhesionSchema>>({
    resolver: zodResolver(adhesionSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      profession: '',
      monthly_income: '',
      source_of_income: '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof adhesionSchema>) => {
    const result = await submitAdhesionRequest(sfdId, values as AdhesionRequestInput);
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre nom complet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenu mensuel (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="source_of_income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source de revenu</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Salaire, Business, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optionnel)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
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
            
            <Button 
              type="submit" 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" 
              disabled={isCreatingRequest}
            >
              {isCreatingRequest ? (
                <>
                  <Loader size="sm" className="mr-2" /> Envoi en cours...
                </>
              ) : (
                "Soumettre la demande d'adhésion"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
