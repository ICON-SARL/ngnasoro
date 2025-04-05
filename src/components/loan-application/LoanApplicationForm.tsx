
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast'; // Correct import path
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  loanType: z.string({
    required_error: "Vous devez sélectionner un type de prêt",
  }),
  amount: z.coerce.number()
    .min(10000, "Le montant minimum est de 10,000 FCFA")
    .max(5000000, "Le montant maximum est de 5,000,000 FCFA"),
  duration: z.coerce.number()
    .min(1, "La durée minimum est de 1 mois")
    .max(60, "La durée maximum est de 60 mois"),
  purpose: z.string()
    .min(3, "Veuillez indiquer l'objet du prêt")
    .max(100, "L'objet du prêt est trop long (max 100 caractères)"),
  description: z.string()
    .min(20, "Veuillez donner plus de détails sur votre projet")
    .max(500, "La description est trop longue (max 500 caractères)"),
});

type FormValues = z.infer<typeof formSchema>;

const LoanApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanType: "",
      amount: 100000,
      duration: 12,
      purpose: "",
      description: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      // Submit loan application logic would go here
      console.log('Loan application submitted:', data);
      
      toast({
        title: "Application submitted",
        description: "Your loan application has been submitted successfully. We will review it shortly.",
      });
      
      // Navigate back to the main dashboard or confirmation page
      navigate('/');
    } catch (error) {
      console.error('Error submitting loan application:', error);
      
      toast({
        title: "Error",
        description: "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Loan Application</CardTitle>
        <CardDescription>
          Complete the form below to apply for a loan.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="loanType" className="block text-sm font-medium mb-1">
                  Loan Type
                </label>
                <Select
                  onValueChange={(value) => form.setValue('loanType', value)}
                  defaultValue={form.getValues('loanType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                    <SelectItem value="business">Business Loan</SelectItem>
                    <SelectItem value="education">Education Loan</SelectItem>
                    <SelectItem value="housing">Housing Loan</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.loanType && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.loanType.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1">
                    Loan Amount (FCFA)
                  </label>
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
                  <label htmlFor="duration" className="block text-sm font-medium mb-1">
                    Duration (months)
                  </label>
                  <Input
                    id="duration"
                    type="number"
                    {...form.register('duration', { valueAsNumber: true })}
                  />
                  {form.formState.errors.duration && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.duration.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium mb-1">
                  Loan Purpose
                </label>
                <Input
                  id="purpose"
                  {...form.register('purpose')}
                  placeholder="e.g. Business expansion, Education, etc."
                />
                {form.formState.errors.purpose && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.purpose.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Project Description
                </label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  rows={4}
                  placeholder="Provide details about how you plan to use the loan funds..."
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoanApplicationForm;
