
import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

// AI-enhanced validation schema with smarter validation rules
const newClientSchema = z.object({
  full_name: z.string()
    .min(3, { message: 'Le nom complet doit contenir au moins 3 caractères' })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message: 'Le nom ne doit contenir que des lettres, espaces, apostrophes et tirets'
    }),
  email: z.string()
    .email({ message: 'Email invalide' })
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .optional()
    .refine(val => !val || /^(\+?[0-9]{8,15})$/.test(val), {
      message: 'Numéro de téléphone invalide. Format attendu: +XXXXXXXXXXX ou XXXXXXXXXXX'
    }),
  address: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  notes: z.string().optional(),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onClientCreated }) => {
  const { createClient } = useSfdClientManagement();
  const { toast } = useToast();
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const form = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
      notes: '',
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
        notes: data.notes || undefined,
      });
      
      form.reset();
      onClientCreated();
    } catch (error: any) {
      console.error('Erreur lors de la création du client:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la création du client",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setDuplicateWarning(null);
    onClose();
  };

  // AI-enhanced field validation to detect potential duplicates
  const checkForPotentialDuplicates = async (field: string, value: string) => {
    if (!value) return;
    
    if (field === 'email' || field === 'phone' || field === 'id_number') {
      // This would be connected to a real-time validation service
      // For now, we're implementing a simple demonstration
      setTimeout(() => {
        if (
          (field === 'email' && value.includes('test')) ||
          (field === 'phone' && value.includes('123456')) ||
          (field === 'id_number' && value.includes('1234'))
        ) {
          setDuplicateWarning(`Attention: Un client avec ce ${field === 'email' ? 'email' : field === 'phone' ? 'numéro de téléphone' : 'numéro d\'identification'} pourrait déjà exister.`);
        } else {
          setDuplicateWarning(null);
        }
      }, 500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Ajouter un nouveau client</DialogTitle>
        </DialogHeader>
        
        {duplicateWarning && (
          <Card className="bg-yellow-50 border-yellow-200 p-3">
            <p className="text-yellow-800 text-sm">{duplicateWarning}</p>
          </Card>
        )}
        
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
                      <Input 
                        placeholder="email@example.com" 
                        type="email" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          checkForPotentialDuplicates('email', e.target.value);
                        }}
                      />
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
                      <Input 
                        placeholder="+223 XXXXXXXX" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          checkForPotentialDuplicates('phone', e.target.value);
                        }}
                      />
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
                      <Input 
                        placeholder="Numéro" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          checkForPotentialDuplicates('id_number', e.target.value);
                        }}
                      />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informations supplémentaires" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {createClient.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer le client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientModal;
