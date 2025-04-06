
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { AdminRole } from '@/components/admin/management/types';
import { Loader2 } from 'lucide-react';

// Schema for form validation
const formSchema = z.object({
  fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  sendNotification: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface AddSfdAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: { email: string; password: string; full_name: string; role: string; sfd_id: string; notify: boolean }) => Promise<void>;
  isLoading: boolean;
}

export function AddSfdAdminDialog({ 
  open, 
  onOpenChange, 
  sfdId, 
  sfdName, 
  onAddAdmin, 
  isLoading 
}: AddSfdAdminDialogProps) {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      sendNotification: true
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onAddAdmin({
        email: values.email,
        password: values.password,
        full_name: values.fullName,
        role: AdminRole.SFD_ADMIN,
        sfd_id: sfdId,
        notify: values.sendNotification
      });
      
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Error adding SFD admin:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'administrateur",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créer un compte administrateur pour la SFD {sfdName}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Prénom Nom" {...field} />
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
                    <Input type="email" placeholder="admin@exemple.com" {...field} />
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
              name="sendNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Envoyer une notification</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Envoyer un email d'invitation à l'administrateur
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
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : 'Créer le compte'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
