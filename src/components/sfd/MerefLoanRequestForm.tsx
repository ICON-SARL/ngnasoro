
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CreditCard, Building } from 'lucide-react';
import { useMerefSfdLoans } from '@/hooks/useMerefSfdLoans';
import { useActiveSfdId } from '@/hooks/useActiveSfdId';

const loanRequestSchema = z.object({
  amount: z.number().min(100000, 'Montant minimum: 100 000 FCFA'),
  duration_months: z.number().min(6).max(60),
  purpose: z.string().min(10, 'Décrivez l\'objectif du prêt'),
  justification: z.string().min(20, 'Justifiez votre demande'),
});

type LoanRequestFormData = z.infer<typeof loanRequestSchema>;

interface MerefLoanRequestFormProps {
  onSuccess?: () => void;
}

export function MerefLoanRequestForm({ onSuccess }: MerefLoanRequestFormProps) {
  const { activeSfdId } = useActiveSfdId();
  const { createLoanRequest } = useMerefSfdLoans();

  const form = useForm<LoanRequestFormData>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      amount: 1000000,
      duration_months: 12,
      purpose: '',
      justification: '',
    },
  });

  const onSubmit = async (data: LoanRequestFormData) => {
    if (!activeSfdId) return;

    await createLoanRequest.mutateAsync({
      sfd_id: activeSfdId,
      amount: data.amount,
      duration_months: data.duration_months,
      purpose: data.purpose,
      justification: data.justification,
    });

    form.reset();
    onSuccess?.();
  };

  if (!activeSfdId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vous devez être associé à une SFD pour demander un prêt MEREF.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Nouvelle demande de prêt MEREF
        </CardTitle>
        <CardDescription>
          Soumettez une demande de financement auprès du MEREF pour votre SFD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant demandé (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1 000 000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum: 100 000 FCFA
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée de remboursement</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6">6 mois</SelectItem>
                        <SelectItem value="12">12 mois</SelectItem>
                        <SelectItem value="18">18 mois</SelectItem>
                        <SelectItem value="24">24 mois</SelectItem>
                        <SelectItem value="36">36 mois</SelectItem>
                        <SelectItem value="48">48 mois</SelectItem>
                        <SelectItem value="60">60 mois</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectif du prêt</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Financement de microcrédits agricoles"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Décrivez brièvement l'utilisation prévue des fonds
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification détaillée</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Expliquez pourquoi votre SFD a besoin de ce financement, comment il sera utilisé, et quel impact il aura sur vos clients..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Conditions indicatives</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Taux d'intérêt: 5% annuel (fixé par le MEREF)</li>
                <li>• Délai de traitement: 5-10 jours ouvrables</li>
                <li>• Remboursement mensuel automatique</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createLoanRequest.isPending}
            >
              {createLoanRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre la demande'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
