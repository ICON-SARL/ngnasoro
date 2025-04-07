
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { asString } from '@/utils/typeSafeAccess';
import { LoanPlan } from '../types';

// Form schema definition
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

export type LoanFormValues = z.infer<typeof formSchema>;

export interface SFD {
  id: string;
  name: string;
  is_default: boolean;
}

export function useLoanApplication() {
  const [sfds, setSfds] = useState<SFD[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const form = useForm<LoanFormValues>({
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
          name: asString(item.sfds?.name, 'Unknown SFD'),
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
        duration: Math.max(selectedPlan.min_duration, Math.min(form.getValues().duration, selectedPlan.max_duration)),
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
    
    if (currentDuration < plan.min_duration || currentDuration > plan.max_duration) {
      form.setValue('duration', Math.max(plan.min_duration, Math.min(currentDuration, plan.max_duration)));
    }
  };
  
  const onSubmit = async (data: LoanFormValues) => {
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
      
      const { data: loanData, error: loanError } = await supabase
        .from('sfd_loans')
        .insert({
          client_id: clientId,
          sfd_id: data.sfdId,
          amount: data.amount,
          duration_months: data.duration,
          interest_rate: selectedPlan?.interest_rate || 5,
          purpose: data.purpose,
          monthly_payment: Math.round(monthlyPayment),
          status: 'pending'
        })
        .select()
        .single();
        
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

  return {
    form,
    sfds,
    isLoading,
    selectedPlan,
    handlePlanSelect,
    onSubmit,
    navigateToRepayment,
    navigate
  };
}
