
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLoanApplication, LoanDocumentType } from '@/hooks/useLoanApplication';
import { FileUpload } from '@/components/ui/file-upload';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  loan_plan_id: z.string().min(1, 'Veuillez sélectionner un plan de prêt'),
  amount: z.number().min(1, 'Le montant est requis'),
  duration_months: z.number().min(1, 'La durée est requise'),
  purpose: z.string().min(10, 'Veuillez décrire l\'objet du prêt (minimum 10 caractères)'),
});

type FormValues = z.infer<typeof formSchema>;

export const LoanApplicationForm: React.FC = () => {
  const { sfdId } = useParams();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<Record<LoanDocumentType, File | null>>({
    id_card: null,
    proof_of_income: null,
    bank_statement: null,
    business_plan: null,
  });

  const {
    loanPlans,
    isLoadingPlans,
    isUploading,
    submitApplication
  } = useLoanApplication(sfdId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      duration_months: 0,
      purpose: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const documents = Object.entries(selectedFiles)
      .filter(([_, file]) => file !== null)
      .map(([type, file]) => ({
        type: type as LoanDocumentType,
        file: file as File,
      }));

    await submitApplication.mutateAsync({
      amount: values.amount,
      duration_months: values.duration_months,
      purpose: values.purpose,
      loan_plan_id: values.loan_plan_id,
      documents,
    });

    navigate('/mobile-flow/my-loans');
  };

  if (isLoadingPlans) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="loan_plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan de prêt</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loanPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA)
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                      {...field}
                      placeholder="Décrivez l'utilisation prévue du prêt"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documents requis</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FileUpload
                  label="Carte d'identité"
                  onChange={(file) => setSelectedFiles(prev => ({ ...prev, id_card: file }))}
                  accept="image/*,.pdf"
                />
                
                <FileUpload
                  label="Justificatif de revenus"
                  onChange={(file) => setSelectedFiles(prev => ({ ...prev, proof_of_income: file }))}
                  accept="image/*,.pdf"
                />
                
                <FileUpload
                  label="Relevé bancaire"
                  onChange={(file) => setSelectedFiles(prev => ({ ...prev, bank_statement: file }))}
                  accept="image/*,.pdf"
                />
                
                <FileUpload
                  label="Plan d'affaires"
                  onChange={(file) => setSelectedFiles(prev => ({ ...prev, business_plan: file }))}
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || submitApplication.isPending}
              >
                {isUploading || submitApplication.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Soumettre la demande'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
