
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sfdFormSchema } from './schemas/sfdFormSchema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SfdAddDialog({ open, onOpenChange }: SfdAddDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof sfdFormSchema>>({
    resolver: zodResolver(sfdFormSchema),
    defaultValues: {
      name: '',
      code: '',
      region: '',
      status: 'active',
      description: '',
      contact_email: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof sfdFormSchema>) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      console.log("Submitting SFD form with values:", values);
      
      // Using the new Edge Function
      const { data, error } = await supabase.functions.invoke('create-new-sfd', {
        body: values,
      });
      
      if (error) {
        throw new Error(`Erreur lors de la création de la SFD: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Aucune donnée reçue du serveur");
      }
      
      console.log("SFD created successfully:", data);
      
      // Show success toast
      toast({
        title: 'SFD ajoutée',
        description: 'La SFD a été créée avec succès',
      });
      
      // Invalidate the relevant queries
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      // Reset the form and close the dialog
      form.reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error("SFD creation error:", err);
      
      const errorMessage = err.message || "Une erreur s'est produite lors de la création de la SFD";
      
      // Extraire un message plus clair si possible
      let displayError = errorMessage;
      if (errorMessage.includes("code SFD") && errorMessage.includes("existe déjà")) {
        displayError = `Le code "${values.code}" existe déjà. Veuillez utiliser un code unique.`;
      } else if (errorMessage.includes("non-2xx status") || errorMessage.includes("communication avec le serveur")) {
        displayError = "Erreur de communication avec le serveur. Veuillez réessayer plus tard.";
      }
      
      setError(displayError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Ne pas permettre la fermeture pendant la création
      if (isSubmitting && open && !newOpen) {
        return;
      }
      
      // Réinitialiser le formulaire si le dialogue se ferme
      if (!newOpen) {
        form.reset();
        setError(null);
      }
      
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Créez une nouvelle institution de microfinance sur la plateforme
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la SFD</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom complet de la SFD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Code unique (ex: RCPB-OUA)" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Doit être unique pour chaque SFD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <FormControl>
                      <Input placeholder="Région d'opération" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@sfd.org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+223 7X XX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de la SFD" 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer la SFD"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
