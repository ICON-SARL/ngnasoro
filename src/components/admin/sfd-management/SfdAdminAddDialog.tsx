
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSfdData } from '@/components/admin/hooks/sfd-management/useSfdData';

// Form schema
const formSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  sfd_id: z.string().uuid("Veuillez sélectionner une SFD"),
  notify: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface SfdAdminAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SfdAdminAddDialog: React.FC<SfdAdminAddDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { sfds, isLoading: isLoadingSfds } = useSfdData();
  const { addSfdAdmin, isLoading, error } = useSfdAdminManagement();
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      sfd_id: '',
      notify: true,
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    setSubmitError(null);
    
    try {
      await addSfdAdmin({
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        role: 'sfd_admin',
        sfd_id: values.sfd_id,
        notify: values.notify,
      });
      
      // Reset form and close dialog on success
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(error.message || "Une erreur s'est produite lors de la création de l'administrateur");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading && open && !newOpen) {
        // Prevent closing during loading without confirmation
        const confirmed = window.confirm("La création de l'administrateur est en cours. Êtes-vous sûr de vouloir annuler ?");
        if (!confirmed) return;
      }
      
      // Reset form when dialog closes
      if (!newOpen) {
        form.reset();
        setSubmitError(null);
      }
      
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte administrateur pour une SFD existante
          </DialogDescription>
        </DialogHeader>
        
        {(submitError || (error && typeof error === 'string')) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError || (error && typeof error === 'string' 
                ? error 
                : error instanceof Error 
                  ? error.message 
                  : 'Une erreur est survenue')}
            </AlertDescription>
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
                    <Input placeholder="Nom complet" {...field} />
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
                    <Input type="email" placeholder="email@example.com" {...field} />
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
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sfd_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SFD</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingSfds}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une SFD" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sfds.map((sfd) => (
                        <SelectItem key={sfd.id} value={sfd.id}>
                          {sfd.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <FormLabel>Envoyer une notification</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Envoyer un email de notification à l'administrateur
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
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer l'administrateur"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
