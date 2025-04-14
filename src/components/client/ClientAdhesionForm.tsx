
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ClientAdhesionFormProps {
  sfdId: string;
  onSuccess?: () => void;
}

const adhesionFormSchema = z.object({
  full_name: z.string().min(3, "Le nom complet est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  phone: z.string().min(8, "Numéro de téléphone invalide").optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  id_type: z.string().optional(),
  id_number: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal(''))
});

type AdhesionFormValues = z.infer<typeof adhesionFormSchema>;

export const ClientAdhesionForm: React.FC<ClientAdhesionFormProps> = ({ sfdId, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createAdhesionRequest } = useClientAdhesions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AdhesionFormValues>({
    resolver: zodResolver(adhesionFormSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
      notes: ''
    }
  });
  
  const handleSubmit = async (values: AdhesionFormValues) => {
    if (!sfdId) {
      toast({
        title: "Erreur",
        description: "Identifiant SFD manquant",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createAdhesionRequest.mutateAsync({
        sfd_id: sfdId,
        ...values
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer la demande: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <Input placeholder="Votre nom complet" {...field} />
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
                  <Input type="email" placeholder="votre@email.com" {...field} />
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
                  <Input placeholder="+XX XXXXXXXX" {...field} />
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
                <Textarea placeholder="Votre adresse complète" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id_type"
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
                    <SelectItem value="permis">Permis de conduire</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
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
                <FormLabel>Numéro de pièce d'identité</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le numéro" {...field} />
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
              <FormLabel>Notes supplémentaires</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informations complémentaires pour votre demande" 
                  {...field} 
                  className="h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          disabled={isSubmitting || createAdhesionRequest.isPending}
        >
          {isSubmitting || createAdhesionRequest.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer la demande d'adhésion"
          )}
        </Button>
      </form>
    </Form>
  );
};
