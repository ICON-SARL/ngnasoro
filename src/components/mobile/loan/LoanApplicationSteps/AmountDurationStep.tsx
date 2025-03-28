
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Re-use schema from parent
const formSchema = z.object({
  amount: z.number().min(10000, 'Le montant minimum est de 10 000 FCFA').max(1000000, 'Le montant maximum est de 1 000 000 FCFA'),
  duration_months: z.number().min(1, 'La durée minimum est de 1 mois').max(36, 'La durée maximum est de 36 mois'),
  purpose: z.string().min(10, 'Veuillez décrire l\'objet du prêt (10 caractères minimum)'),
  sfd_id: z.string().min(1, 'Veuillez sélectionner un SFD'),
});

type FormValues = z.infer<typeof formSchema>;

interface AmountDurationStepProps {
  form: UseFormReturn<FormValues>;
}

const AmountDurationStep: React.FC<AmountDurationStepProps> = ({ form }) => {
  // Calcul de la mensualité (simplifié)
  const calculateMonthlyPayment = () => {
    const amount = form.getValues('amount');
    const duration = form.getValues('duration_months');
    const interestRate = 0.1; // 10% annuel simplifié
    
    // Formule simplifiée
    const monthlyRate = interestRate / 12;
    const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration));
    
    return payment.toFixed(0);
  };

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold mb-2">Montant et durée</div>
      
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Montant du prêt (FCFA)</FormLabel>
            <div className="mb-2">
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </div>
            <Slider
              min={10000}
              max={1000000}
              step={5000}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0])}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>10 000</span>
              <span>1 000 000</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="duration_months"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Durée (mois)</FormLabel>
            <div className="mb-2">
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </div>
            <Slider
              min={1}
              max={36}
              step={1}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0])}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1 mois</span>
              <span>36 mois</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card className="p-4 bg-gray-50">
        <div className="font-semibold text-sm mb-2">Estimation mensuelle</div>
        <div className="text-2xl font-bold">{calculateMonthlyPayment()} FCFA</div>
        <div className="text-xs text-gray-500 mt-1">
          *Taux d'intérêt estimé à 10% annuel
        </div>
      </Card>
    </div>
  );
};

export default AmountDurationStep;
