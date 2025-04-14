
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useMerefFundRequests } from '@/hooks/useMerefFundRequests';
import { Loader2, AlertCircle, Building } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const fundRequestSchema = z.object({
  amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0"),
  purpose: z.string().min(5, "L'objet doit contenir au moins 5 caractères"),
  justification: z.string().min(20, "La justification doit contenir au moins 20 caractères"),
});

type FundRequestFormValues = z.infer<typeof fundRequestSchema>;

export function MerefFundRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createFundRequest, isSubmitting } = useMerefFundRequests();
  const { activeSfdId, sfdData, isLoading: isSfdLoading } = useSfdDataAccess();
  const [sfdError, setSfdError] = useState<string | null>(null);
  
  const form = useForm<FundRequestFormValues>({
    resolver: zodResolver(fundRequestSchema),
    defaultValues: {
      amount: 0,
      purpose: '',
      justification: '',
    }
  });
  
  // Check if user has an active SFD
  useEffect(() => {
    if (!isSfdLoading) {
      if (!activeSfdId) {
        if (sfdData.length === 0) {
          setSfdError("Aucune SFD n'est associée à votre compte. Veuillez contacter l'administrateur.");
        } else {
          setSfdError("Aucune SFD active sélectionnée. Veuillez sélectionner une SFD.");
        }
      } else {
        setSfdError(null);
      }
    }
  }, [activeSfdId, sfdData, isSfdLoading]);
  
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
      await createFundRequest.mutateAsync({
        sfdId: activeSfdId,
        amount: data.amount,
        purpose: data.purpose,
        justification: data.justification,
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
  
  // Show loading message while checking SFD state
  if (isSfdLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Chargement des informations SFD...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show error message if no active SFD is selected
  if (sfdError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demande de financement MEREF</CardTitle>
          <CardDescription>
            Soumettez une demande de fonds auprès du MEREF pour votre institution SFD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{sfdError}</AlertDescription>
          </Alert>
          
          {sfdData.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2">Veuillez sélectionner une SFD dans l'en-tête de l'application pour continuer.</p>
              <div className="p-4 border rounded-md bg-muted/20">
                <h3 className="text-sm font-medium mb-2">SFDs disponibles :</h3>
                <ul className="space-y-2">
                  {sfdData.map(sfd => (
                    <li key={sfd.id} className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {sfd.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            Actualiser la page
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
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
          <div>
            <Label htmlFor="amount">Montant demandé (FCFA) *</Label>
            <Input
              id="amount"
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="purpose">Objet de la demande *</Label>
            <Input
              id="purpose"
              {...form.register('purpose')}
            />
            {form.formState.errors.purpose && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.purpose.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="justification">Justification détaillée *</Label>
            <Textarea
              id="justification"
              rows={5}
              {...form.register('justification')}
            />
            {form.formState.errors.justification && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.justification.message}</p>
            )}
          </div>
          
          <Button 
            type="submit"
            className="w-full mt-6"
            disabled={createFundRequest.isPending}
          >
            {createFundRequest.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission en cours...
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
