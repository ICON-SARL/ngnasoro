
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SENEGAL_REGIONS } from '@/components/admin/subsidy/request-create/constants';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  amount: z.string().min(1, { message: 'Le montant est requis' }),
  purpose: z.string().min(3, { message: 'L\'objet de la demande est requis' }),
  priority: z.enum(['low', 'normal', 'high', 'urgent'], { 
    required_error: 'Veuillez sélectionner une priorité' 
  }),
  region: z.string().min(1, { message: 'La région est requise' }),
  justification: z.string().min(10, { message: 'La justification doit contenir au moins 10 caractères' }),
  expected_impact: z.string().optional(),
});

interface SubsidyRequestFormProps {
  onSuccess: () => void;
}

export const SubsidyRequestForm: React.FC<SubsidyRequestFormProps> = ({ onSuccess }) => {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      purpose: '',
      priority: 'normal',
      region: '',
      justification: '',
      expected_impact: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté et avoir une SFD active pour soumettre une demande",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convertir le montant en nombre
      const amount = parseFloat(data.amount.replace(/\s/g, '').replace(',', '.'));
      
      // Soumettre la demande à Supabase
      const { data: newRequest, error } = await supabase
        .from('subsidy_requests')
        .insert({
          sfd_id: activeSfdId,
          requested_by: user.id,
          amount: amount,
          purpose: data.purpose,
          justification: data.justification,
          expected_impact: data.expected_impact || null,
          priority: data.priority,
          region: data.region,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la soumission de la demande:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la soumission de votre demande",
          variant: "destructive",
        });
        return;
      }
      
      // Créer une notification pour les administrateurs MEREF
      await supabase.from('admin_notifications').insert({
        title: 'Nouvelle demande de subvention',
        message: `Une nouvelle demande de subvention de ${amount.toLocaleString()} FCFA a été soumise.`,
        type: data.priority === 'urgent' ? 'warning' : 'info',
        recipient_role: 'admin',
        sender_id: user.id,
        action_link: `/admin/subsidy-requests?id=${newRequest.id}`
      });
      
      toast({
        title: "Demande soumise",
        description: "Votre demande de subvention a été soumise avec succès",
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Enlever tous les caractères non numériques
    
    if (value) {
      const numberValue = parseInt(value, 10);
      value = numberValue.toLocaleString('fr-FR');
    }
    
    form.setValue("amount", value);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant demandé (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => formatAmountInput(e)}
                      placeholder="Ex: 5 000 000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une priorité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Région ciblée</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une région" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      {SENEGAL_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet de la demande</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Expansion des activités de microfinance"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Expliquez pourquoi ce prêt est nécessaire et comment il sera utilisé..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expected_impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impact attendu (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Décrivez l'impact social et économique attendu de ce prêt..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Soumission en cours...' : 'Soumettre la demande'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
