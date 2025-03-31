
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, CheckCircle2, Clock, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoanPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
}

interface FormValues {
  amount: number;
  duration_months: number;
  purpose: string;
  loanPlanId: string;
  agree_terms: boolean;
}

const LoanApplicationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { applyForLoan, isUploading } = useClientLoans();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [sfdId, setSfdId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      amount: 50000,
      duration_months: 6,
      purpose: '',
      loanPlanId: '',
      agree_terms: false
    }
  });

  const { watch } = form;
  const amount = watch('amount');
  const duration = watch('duration_months');
  const loanPlanId = watch('loanPlanId');

  useEffect(() => {
    fetchSfdInfo();
  }, []);

  useEffect(() => {
    if (sfdId) {
      fetchLoanPlans();
    }
  }, [sfdId]);

  useEffect(() => {
    const foundPlan = loanPlans.find(plan => plan.id === loanPlanId);
    setSelectedPlan(foundPlan || null);
  }, [loanPlanId, loanPlans]);

  useEffect(() => {
    if (selectedPlan) {
      calculateMonthlyPayment();
    }
  }, [amount, duration, selectedPlan]);

  const fetchSfdInfo = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { data: sfdData, error: sfdError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userData.user.id)
        .eq('is_default', true)
        .single();

      if (sfdError) throw sfdError;
      setSfdId(sfdData.sfd_id);
    } catch (error) {
      console.error('Erreur lors de la récupération des infos SFD:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos informations SFD",
        variant: "destructive",
      });
    }
  };

  const fetchLoanPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', sfdId)
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        setLoanPlans(data as LoanPlan[]);
        // Set default loan plan
        form.setValue('loanPlanId', data[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des plans de prêt:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les plans de prêt disponibles",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const calculateMonthlyPayment = () => {
    if (!selectedPlan) return;

    const principal = amount;
    const interestRate = selectedPlan.interest_rate / 100 / 12; // Monthly interest rate
    const numberOfPayments = duration;

    // Monthly payment formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyPayment = 
      (principal * interestRate * Math.pow(1 + interestRate, numberOfPayments)) / 
      (Math.pow(1 + interestRate, numberOfPayments) - 1);

    setMonthlyPayment(Math.round(monthlyPayment));
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedPlan || !sfdId) {
      toast({
        title: "Erreur",
        description: "Plan de prêt ou SFD non sélectionné",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await applyForLoan.mutateAsync({
        sfd_id: sfdId,
        amount: values.amount,
        duration_months: values.duration_months,
        purpose: values.purpose,
      });

      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès",
      });
      
      // Redirect to a confirmation or dashboard page
      navigate('/mobile-flow');
    } catch (error: any) {
      console.error('Erreur lors de la demande de prêt:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h1 className="text-2xl font-bold mb-2">Demande de Prêt</h1>
      <p className="text-gray-600 mb-6">
        Remplissez le formulaire ci-dessous pour soumettre votre demande de prêt
      </p>

      {isLoadingPlans ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
          <span className="ml-2">Chargement des plans de prêt...</span>
        </div>
      ) : loanPlans.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="font-medium mb-2">Aucun plan de prêt disponible</h3>
          <p className="text-sm text-muted-foreground">
            Veuillez contacter votre SFD pour plus d'informations
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="loanPlanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de prêt</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un plan de prêt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loanPlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedPlan?.description || "Sélectionnez un plan pour voir sa description"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPlan && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Slider
                              min={selectedPlan.min_amount}
                              max={selectedPlan.max_amount}
                              step={5000}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              className="py-4"
                            />
                            <div className="flex justify-between items-center">
                              <Input
                                type="number"
                                min={selectedPlan.min_amount}
                                max={selectedPlan.max_amount}
                                {...field}
                                className="w-2/3"
                              />
                              <span className="text-sm text-muted-foreground">FCFA</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Min: {selectedPlan.min_amount.toLocaleString()} FCFA</span>
                              <span>Max: {selectedPlan.max_amount.toLocaleString()} FCFA</span>
                            </div>
                          </div>
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
                          <div className="space-y-4">
                            <Slider
                              min={selectedPlan.min_duration}
                              max={selectedPlan.max_duration}
                              step={1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              className="py-4"
                            />
                            <div className="flex justify-between items-center">
                              <Input
                                type="number"
                                min={selectedPlan.min_duration}
                                max={selectedPlan.max_duration}
                                {...field}
                                className="w-2/3"
                              />
                              <span className="text-sm text-muted-foreground">mois</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Min: {selectedPlan.min_duration} mois</span>
                              <span>Max: {selectedPlan.max_duration} mois</span>
                            </div>
                          </div>
                        </FormControl>
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
                      <FormLabel>Objet du prêt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez en détail l'objet de votre demande de prêt"
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Expliquez comment vous prévoyez d'utiliser ces fonds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Card className="bg-muted/20">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-[#0D6A51]" />
                      Simulation de prêt
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Montant du prêt</span>
                        <span className="font-medium">{amount.toLocaleString()} FCFA</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Durée</span>
                        <span className="font-medium">{duration} mois</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Taux d'intérêt</span>
                        <span className="font-medium">{selectedPlan.interest_rate}%</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Frais de dossier</span>
                        <span className="font-medium">{selectedPlan.fees}%</span>
                      </div>

                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Frais de dossier (montant)</span>
                        <span className="font-medium">
                          {Math.round(amount * selectedPlan.fees / 100).toLocaleString()} FCFA
                        </span>
                      </div>

                      <div className="flex justify-between py-2 bg-[#0D6A51]/5 px-2 rounded-md">
                        <span className="font-medium">Mensualité estimée</span>
                        <span className="font-bold text-[#0D6A51]">
                          {monthlyPayment.toLocaleString()} FCFA
                        </span>
                      </div>

                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Montant total à rembourser</span>
                        <span className="font-medium">
                          {(monthlyPayment * duration).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {selectedPlan?.requirements && selectedPlan.requirements.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Conditions requises</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPlan.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start space-x-2">
                <div className="flex h-5 items-center">
                  <input
                    id="agree_terms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#0D6A51] focus:ring-[#0D6A51]"
                    onChange={(e) => form.setValue('agree_terms', e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agree_terms" className="font-medium text-gray-900">
                    J'accepte les conditions générales
                  </label>
                  <p className="text-gray-500">
                    Je confirme avoir lu et accepté les conditions générales de prêt et j'atteste que toutes les 
                    informations fournies sont exactes.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  disabled={isSubmitting || !form.watch('agree_terms')}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Soumettre ma demande
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/mobile-flow')}
                >
                  Annuler
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <span>Dossier traité en 24-48h ouvrées</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                <span>Versement rapide après approbation</span>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default LoanApplicationForm;
