
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2, BellRing, AlertTriangle } from 'lucide-react';

interface SubsidyAlertSettingsProps {
  thresholds: any[];
  isLoading: boolean;
}

const thresholdFormSchema = z.object({
  threshold_name: z.string().min(1, "Le nom du seuil est requis"),
  threshold_amount: z
    .string()
    .min(1, "Le montant du seuil est requis")
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  is_active: z.boolean().default(true),
  notification_emails: z.string().optional(),
});

type ThresholdFormValues = z.infer<typeof thresholdFormSchema>;

export function SubsidyAlertSettings({ thresholds = [], isLoading }: SubsidyAlertSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Préparer les valeurs par défaut pour le formulaire
  const defaultThreshold = thresholds?.[0] || {
    threshold_name: "Seuil de demande élevée",
    threshold_amount: 5000000,
    is_active: true,
    notification_emails: "",
  };

  // Transformer la liste d'emails en string
  const emailsToString = (emails: string[] | null | undefined) => {
    if (!emails || !Array.isArray(emails)) return "";
    return emails.join(", ");
  };

  const stringToEmails = (emailStr: string | undefined) => {
    if (!emailStr) return [];
    return emailStr
      .split(",")
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  const form = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdFormSchema),
    defaultValues: {
      threshold_name: defaultThreshold.threshold_name,
      threshold_amount: defaultThreshold.threshold_amount.toString(),
      is_active: defaultThreshold.is_active,
      notification_emails: emailsToString(defaultThreshold.notification_emails),
    },
  });

  // Mutation pour sauvegarder les paramètres
  const saveSettings = useMutation({
    mutationFn: async (values: ThresholdFormValues) => {
      const thresholdId = thresholds?.[0]?.id;
      
      const thresholdData = {
        threshold_name: values.threshold_name,
        threshold_amount: values.threshold_amount,
        is_active: values.is_active,
        notification_emails: stringToEmails(values.notification_emails),
        updated_by: user?.id,
      };
      
      // Mettre à jour ou créer selon le cas
      if (thresholdId) {
        const { data, error } = await supabase
          .from('subsidy_alert_thresholds')
          .update(thresholdData)
          .eq('id', thresholdId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('subsidy_alert_thresholds')
          .insert(thresholdData)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-alert-thresholds'] });
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres d'alerte ont été mis à jour",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ThresholdFormValues) => {
    saveSettings.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-amber-500" />
            Paramètres d'alerte de subventions
          </CardTitle>
          <CardDescription>
            Configurez les seuils qui déclencheront des alertes pour les demandes de subvention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <p className="text-sm text-amber-700">
                  Les demandes dépassant le seuil spécifié seront automatiquement marquées pour 
                  une attention particulière et déclencheront des notifications.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activer les alertes</FormLabel>
                      <FormDescription>
                        Activez ou désactivez le système d'alerte
                      </FormDescription>
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
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="threshold_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du seuil</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom descriptif pour ce seuil d'alerte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="threshold_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant seuil (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Les demandes dépassant ce montant déclencheront une alerte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notification_emails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emails de notification</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email1@example.com, email2@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Entrez les adresses email qui recevront les alertes (séparées par des virgules)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveSettings.isPending}
                >
                  {saveSettings.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sauvegarder les paramètres
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
