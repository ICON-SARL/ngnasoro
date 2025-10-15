
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast'; // Correct import path
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import LoanPlansSelector from './LoanPlansSelector';
import SfdSelector from './SfdSelector';
import { LoaderCircle, ArrowLeft } from 'lucide-react';

interface SFD {
  id: string;
  name: string;
  is_default: boolean;
}

interface LoanPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  duration_months: number;
  interest_rate: number;
  sfd_id: string;
  is_active: boolean;
}

const formSchema = z.object({
  sfdId: z.string({
    required_error: "Veuillez sélectionner une SFD",
  }),
  planId: z.string({
    required_error: "Veuillez sélectionner un plan de prêt",
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

const LoanApplicationPage: React.FC = () => {
  const [sfds, setSfds] = useState<SFD[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sfdId: location.state?.sfdId || activeSfdId || "",
      planId: "",
      amount: 100000,
      duration: 12,
      purpose: "",
      description: "",
    },
  });
  
  useEffect(() => {
    const fetchUserSfds = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_sfds')
          .select(`
            id,
            is_default,
            sfd_id,
            sfds:sfd_id (id, name)
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const transformedData = Array.isArray(data) ? data.map(item => ({
          id: item.sfd_id,
          name: item.sfds.name,
          is_default: item.is_default
        })) : [];
        
        setSfds(transformedData);
        
        if (!form.getValues().sfdId && transformedData.length > 0) {
          const defaultSfd = transformedData.find(sfd => sfd.is_default);
          if (defaultSfd) {
            form.setValue('sfdId', defaultSfd.id);
          } else if (transformedData.length > 0) {
            form.setValue('sfdId', transformedData[0].id);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des SFDs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos comptes SFD",
          variant: "destructive",
        });
        setSfds([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSfds();
  }, [user, form, toast, activeSfdId]);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'sfdId') {
        form.setValue('planId', '');
        setSelectedPlan(null);
      } else if (name === 'planId' && selectedPlan) {
        form.trigger(['amount', 'duration']);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, selectedPlan]);
  
  useEffect(() => {
    if (selectedPlan) {
      form.reset({
        ...form.getValues(),
        amount: Math.max(selectedPlan.min_amount, Math.min(form.getValues().amount, selectedPlan.max_amount)),
        duration: selectedPlan.duration_months,
      });
    }
  }, [selectedPlan, form]);
  
  const handlePlanSelect = (plan: LoanPlan) => {
    setSelectedPlan(plan);
    form.setValue('planId', plan.id);
    
    const currentAmount = form.getValues().amount;
    const currentDuration = form.getValues().duration;
    
    if (currentAmount < plan.min_amount || currentAmount > plan.max_amount) {
      form.setValue('amount', Math.max(plan.min_amount, Math.min(currentAmount, plan.max_amount)));
    }
    
    form.setValue('duration', plan.duration_months);
  };
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour faire une demande de prêt",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const monthlyInterestRate = (selectedPlan?.interest_rate || 5) / 100 / 12;
      const monthlyPayment = (data.amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, data.duration)) / 
                          (Math.pow(1 + monthlyInterestRate, data.duration) - 1);
      
      let clientId;
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', data.sfdId)
        .single();
      
      if (clientError) {
        const { data: newClient, error: createClientError } = await supabase
          .from('sfd_clients')
          .insert({
            user_id: user.id,
            sfd_id: data.sfdId,
            full_name: user.user_metadata?.full_name || 'Client',
            email: user.email,
            status: 'pending',
            kyc_level: 1
          })
          .select()
          .single();
          
        if (createClientError) throw createClientError;
        clientId = newClient.id;
      } else {
        clientId = clientData.id;
      }
      
      // Use edge function to create loan
      const { data: loanData, error: loanError } = await supabase.functions
        .invoke('loan-manager', {
          body: {
            action: 'create_loan',
            data: {
              client_id: clientId,
              sfd_id: data.sfdId,
              amount: data.amount,
              duration_months: data.duration,
              interest_rate: selectedPlan?.interest_rate || 5,
              purpose: data.purpose,
              monthly_payment: Math.round(monthlyPayment),
              status: 'pending'
            }
          }
        });
        
      if (loanError) throw loanError;
      
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanData.id,
          activity_type: 'loan_created',
          description: `Demande de prêt de ${data.amount.toLocaleString('fr-FR')} FCFA soumise via l'application mobile`
        });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été soumise avec succès",
      });
      
      navigate('/mobile-flow/loan-activity');
    } catch (error) {
      console.error("Erreur lors de la soumission de la demande:", error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre demande de prêt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRepayment = () => {
    navigate('/mobile-flow/secure-payment', { state: { isRepayment: true } });
  };
  
  return (
    <div className="container px-4 py-6 pb-20">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#0D6A51]">Demande de prêt</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour soumettre votre demande de prêt
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sfdId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sélectionner une SFD</FormLabel>
                    <FormControl>
                      <SfdSelector 
                        value={field.value}
                        onValueChange={field.onChange}
                        sfds={sfds}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.getValues().sfdId && (
                <>
                  <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan de prêt</FormLabel>
                        <FormControl>
                          <div>
                            <input type="hidden" {...field} />
                            <LoanPlansSelector 
                              sfdId={form.getValues().sfdId}
                              onSelectPlan={handlePlanSelect}
                              selectedPlanId={field.value}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedPlan && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
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
                                  min={selectedPlan.min_amount}
                                  max={selectedPlan.max_amount}
                                />
                              </FormControl>
                              <FormDescription>
                                Entre {selectedPlan.min_amount.toLocaleString('fr-FR')} et {selectedPlan.max_amount.toLocaleString('fr-FR')} FCFA
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Durée (mois)</FormLabel>
                              <FormControl>
                                 <Input 
                                  type="number" 
                                  {...field} 
                                  value={selectedPlan.duration_months}
                                  disabled
                                />
                              </FormControl>
                              <FormDescription>
                                Durée fixe: {selectedPlan.duration_months} mois
                              </FormDescription>
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
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Par exemple: commerce, agriculture, construction, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description du projet</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                rows={4}
                                placeholder="Décrivez votre projet et comment vous comptez utiliser ce prêt..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-semibold bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-lg"
                disabled={isLoading || !selectedPlan}
              >
                {isLoading && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                Soumettre ma demande
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Footer for repayment functionality */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-center">
        <Button 
          onClick={navigateToRepayment}
          variant="outline"
          className="text-[#0D6A51] border-[#0D6A51] hover:bg-[#0D6A51]/10"
        >
          Rembours.
        </Button>
      </div>
    </div>
  );
};

export default LoanApplicationPage;
