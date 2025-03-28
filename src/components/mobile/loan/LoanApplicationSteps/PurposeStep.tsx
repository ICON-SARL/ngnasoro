
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface PurposeStepProps {
  form: UseFormReturn<FormValues>;
}

const PurposeStep: React.FC<PurposeStepProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold mb-2">Objet du prêt</div>
      
      <FormField
        control={form.control}
        name="sfd_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Institution financière</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un SFD" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sfd-1">Microfinance Alpha</SelectItem>
                <SelectItem value="sfd-2">Crédit Rural</SelectItem>
                <SelectItem value="sfd-3">Finance Solidaire</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objet du prêt</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Décrivez l'objet de votre demande de prêt" 
                className="resize-none h-32"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PurposeStep;
