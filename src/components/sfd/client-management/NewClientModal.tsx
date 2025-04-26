
import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

const newClientSchema = z.object({
  full_name: z.string().min(2, { message: 'Le nom complet est requis' }),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onClientCreated }) => {
  const { createClient } = useSfdClientManagement();

  const form = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
    },
  });

  const onSubmit = async (data: NewClientFormData) => {
    try {
      await createClient.mutateAsync({
        full_name: data.full_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        id_type: data.id_type || undefined,
        id_number: data.id_number || undefined,
      });
      
      form.reset();
      onClientCreated();
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Ajouter un nouveau client</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet <span className="text-red-500">*</span></FormLabel>
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
                      <Input placeholder="email@example.com" type="email" {...field} />
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
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse du client" {...field} />
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
                    <FormControl>
                      <Input placeholder="NINA, Passeport, etc." {...field} />
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
                    <FormLabel>Numéro de pièce</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="mr-2"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                disabled={createClient.isPending}
              >
                {createClient.isPending ? 'Création en cours...' : 'Créer le client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientModal;
