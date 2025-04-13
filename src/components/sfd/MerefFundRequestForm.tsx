
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useMerefFundRequests } from '@/hooks/useMerefFundRequests';
import { Loader2 } from 'lucide-react';

const fundRequestSchema = z.object({
  amount: z.number().min(1, "Le montant doit être supérieur à 0"),
  purpose: z.string().min(5, "L'objet doit contenir au moins 5 caractères"),
  justification: z.string().min(20, "La justification doit contenir au moins 20 caractères"),
});

type FundRequestFormValues = z.infer<typeof fundRequestSchema>;

export function MerefFundRequestForm() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const { createFundRequest, isSubmitting } = useMerefFundRequests();
  
  const form = useForm<FundRequestFormValues>({
    resolver: zodResolver(fundRequestSchema),
    defaultValues: {
      amount: 0,
      purpose: '',
      justification: '',
    }
  });
  
  const onSubmit = async (data: FundRequestFormValues) => {
    if (!activeSfdId) {
      toast({
        title: 'Erreur',
        description: 'Aucune SFD active sélectionnée',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await createFundRequest({
        sfdId: activeSfdId,
        amount: data.amount,
        purpose: data.purpose,
        justification: data.justification,
      });
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de fonds a été envoyée avec succès au MEREF',
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'envoi de la demande',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demande de financement MEREF</CardTitle>
        <CardDescription>
          Soumettez une demande de fonds auprès du MEREF pour votre institution SFD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant demandé (FCFA) *</Label>
            <Input
              id="amount"
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="Entrez le montant"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Objet de la demande *</Label>
            <Input
              id="purpose"
              {...form.register('purpose')}
              placeholder="Objectif de ce financement"
            />
            {form.formState.errors.purpose && (
              <p className="text-sm text-red-500">{form.formState.errors.purpose.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="justification">Justification détaillée *</Label>
            <Textarea
              id="justification"
              {...form.register('justification')}
              placeholder="Décrivez en détail pourquoi vous avez besoin de ce financement"
              rows={4}
            />
            {form.formState.errors.justification && (
              <p className="text-sm text-red-500">{form.formState.errors.justification.message}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Soumettre la demande"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
