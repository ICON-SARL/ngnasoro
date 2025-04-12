
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

const addAdminSchema = z.object({
  full_name: z.string().min(1, { message: 'Nom complet requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  role: z.string().default('sfd_admin'),
  notify: z.boolean().default(true),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

interface AddSfdAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: any) => void;
  isLoading: boolean;
  error: any;
}

export function AddSfdAdminDialog({
  open,
  onOpenChange,
  sfdId,
  sfdName,
  onAddAdmin,
  isLoading,
  error
}: AddSfdAdminDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      role: 'sfd_admin',
      notify: true
    },
  });
  
  // Mise à jour de l'erreur à partir des props
  useEffect(() => {
    setFormError(error);
  }, [error]);
  
  // Réinitialiser le formulaire lorsque le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      form.reset({
        full_name: '',
        email: '',
        password: '',
        role: 'sfd_admin',
        notify: true
      });
      setFormError(null);
    }
  }, [open, form]);

  const handleSubmit = (values: AddAdminFormValues) => {
    setFormError(null);
    onAddAdmin({
      ...values,
      sfd_id: sfdId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpenState) => {
      // Si l'utilisateur ferme le dialogue et qu'un chargement est en cours, ne pas fermer
      if (isLoading && !newOpenState) return;
      onOpenChange(newOpenState);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un compte d'administrateur pour {sfdName}
          </DialogDescription>
        </DialogHeader>
        
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom complet" autoComplete="name" />
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
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="email@example.com" type="email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="••••••••" type="password" autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notify"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Notifier par email</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Envoyez un email de notification à l'administrateur
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Alert variant="info" className="bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                L'administrateur aura accès à la gestion des clients et des prêts pour cette SFD.
              </AlertDescription>
            </Alert>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => !isLoading && onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer l\'administrateur'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
