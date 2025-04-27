
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader } from '@/components/ui/loader';
import { useAdhesionRequests } from '@/hooks/useAdhesionRequests'; 

// Form validation schema
const formSchema = z.object({
  full_name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  id_number: z.string().optional(),
  id_type: z.string().optional(),
});

type JoinSfdFormData = z.infer<typeof formSchema>;

interface JoinSfdButtonProps {
  sfdId: string;
  sfdName: string;
  onSuccess?: () => void;
}

export default function JoinSfdButton({ sfdId, sfdName, onSuccess }: JoinSfdButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createAdhesionRequest, adhesionRequests, isLoading } = useAdhesionRequests();

  // Check if user has already sent a request to this SFD
  const hasPendingRequest = adhesionRequests?.some(
    request => request.sfd_id === sfdId && request.status === 'pending'
  );

  // Initialize form
  const form = useForm<JoinSfdFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      phone: '',
      address: '',
      id_number: '',
      id_type: '',
    }
  });

  const handleSubmit = async (values: JoinSfdFormData) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await createAdhesionRequest(sfdId, values);
      
      if (result.success) {
        setIsOpen(false);
        toast({
          title: "Demande envoyée",
          description: `Votre demande d'adhésion à ${sfdName} a été envoyée avec succès`
        });
        
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error submitting adhesion request:', error);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant={hasPendingRequest ? "outline" : "default"}
        className={hasPendingRequest ? "border-amber-500 text-amber-600" : ""}
        disabled={isLoading || hasPendingRequest}
      >
        {isLoading ? (
          <Loader size="sm" />
        ) : hasPendingRequest ? (
          "Demande en cours"
        ) : (
          "Rejoindre"
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejoindre {sfdName}</DialogTitle>
            <DialogDescription>
              Remplissez ce formulaire pour demander à rejoindre cette institution financière.
            </DialogDescription>
          </DialogHeader>
          
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
                      <Input placeholder="Votre adresse" {...field} />
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
                        <Input placeholder="CNI, Passeport, etc." {...field} />
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
                      <FormLabel>N° de pièce d'identité</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader size="sm" className="mr-2" /> : null}
                  Envoyer la demande
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
