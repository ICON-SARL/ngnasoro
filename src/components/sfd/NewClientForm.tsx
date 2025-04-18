
import React, { useState } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useClientManagement } from '@/hooks/useClientManagement';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Suppression de l'import dupliqué de useState

const formSchema = z.object({
  full_name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Email invalide' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Ajout d'une interface pour les props
interface NewClientFormProps {
  onSuccess?: () => void;
}

export const NewClientForm: React.FC<NewClientFormProps> = ({ onSuccess }) => {
  const { createClientWithAccount, isLoading } = useClientManagement();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // S'assurer que full_name et email sont toujours définis
      const clientData = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        id_type: data.id_type,
        id_number: data.id_number,
      };
      
      const result = await createClientWithAccount(clientData);
      setTempPassword(result.tempPassword);
      form.reset();
      
      // Appeler onSuccess s'il est défini
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
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
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
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
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+223 XXXXXXXX" {...field} />
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
                  <Textarea placeholder="Adresse du client" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="id_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de pièce d'identité</FormLabel>
                  <FormControl>
                    <Input placeholder="Type de pièce" {...field} />
                  </FormControl>
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
                    <Input placeholder="Numéro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer le client"
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client créé avec succès</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Un compte utilisateur a été créé pour ce client avec les identifiants suivants :</p>
            <div className="p-4 bg-muted rounded-md">
              <p><strong>Mot de passe temporaire :</strong> {tempPassword}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Veuillez communiquer ces informations au client de manière sécurisée.
              Le client devra changer son mot de passe lors de sa première connexion.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
