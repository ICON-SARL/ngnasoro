
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';

// Schema for form validation
const adminFormSchema = z.object({
  full_name: z.string().min(3, { message: "Le nom complet doit contenir au moins 3 caractères" }),
  email: z.string().email({ message: "Format d'email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  notify: z.boolean().default(true),
});

type AdminFormSchema = z.infer<typeof adminFormSchema>;

interface AddSfdAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: { 
    email: string; 
    password: string; 
    full_name: string; 
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => void;
  isLoading: boolean;
  error: string | null;
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
  const form = useForm<AdminFormSchema>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      notify: true
    },
  });
  
  const handleSubmit = (values: AdminFormSchema) => {
    onAddAdmin({
      ...values,
      role: 'sfd_admin',
      sfd_id: sfdId
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un compte administrateur pour {sfdName}. Cet utilisateur aura accès aux fonctionnalités de gestion de la SFD.
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
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemple.com" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notify"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Notifier l'administrateur
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Envoyer un email de notification avec les instructions de connexion
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Création..." : "Créer l'administrateur"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
