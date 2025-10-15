
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

interface MobileLoanApplicationFormProps {
  sfdId?: string;
  planId?: string;
}

const MobileLoanApplicationForm: React.FC<MobileLoanApplicationFormProps> = ({ sfdId: initialSfdId, planId: initialPlanId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sfdId, setSfdId] = useState<string>(initialSfdId || '');
  const [sfdList, setSfdList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    amount: 0,
    duration_months: 0,
    purpose: '',
    loan_plan_id: initialPlanId || '',
  });

  const { loanPlans, isLoadingPlans, submitApplication, isUploading } = useLoanApplication(sfdId);
  
  // Fetch available SFDs if not provided
  useEffect(() => {
    const fetchSfds = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name')
          .eq('status', 'active');
          
        if (error) throw error;
        setSfdList(data || []);
      } catch (error) {
        console.error('Error fetching SFDs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des SFDs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!initialSfdId) {
      fetchSfds();
    }
  }, [initialSfdId, toast]);

  // If we have a selected plan, update form with its details
  useEffect(() => {
    if (initialPlanId && loanPlans.length > 0) {
      const selectedPlan = loanPlans.find(plan => plan.id === initialPlanId);
      if (selectedPlan) {
        setFormData(prev => ({
          ...prev,
          loan_plan_id: selectedPlan.id,
          purpose: selectedPlan.name || 'Prêt',
          amount: selectedPlan.min_amount || 0,
          duration_months: selectedPlan.duration_months || 12,
        }));
      }
    }
  }, [initialPlanId, loanPlans]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'sfdId') {
      setSfdId(value);
    } else if (name === 'loan_plan_id') {
      const selectedPlan = loanPlans.find(plan => plan.id === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        purpose: selectedPlan?.name || prev.purpose // Set purpose based on plan name
      }));
    } else if (name === 'duration_months') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!sfdId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une SFD",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.duration_months || formData.duration_months <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une durée",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.purpose) {
      toast({
        title: "Erreur",
        description: "Veuillez préciser l'objet du prêt",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user?.id) {
      toast({ 
        title: "Non connecté",
        description: "Veuillez vous connecter pour soumettre une demande de prêt",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting loan application with data:", { ...formData, sfd_id: sfdId });
      
      // First, check if user is a client of the SFD
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .maybeSingle();
      
      if (clientError) {
        console.error("Error checking client status:", clientError);
      }
      
      // Call loan-manager edge function directly
      const { data: loanData, error } = await supabase.functions.invoke('loan-manager', {
        body: {
          action: 'create_loan',
          data: {
            ...formData,
            sfd_id: sfdId,
            client_id: clientData?.id || null // Will be looked up in the edge function if null
          }
        }
      });
      
      if (error || !loanData) {
        throw new Error(error?.message || "Erreur lors de la création du prêt");
      }
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès",
      });
      
      // Navigate back to loans list
      navigate('/mobile-flow/loans');
      
    } catch (error: any) {
      console.error("Error submitting loan application:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDurationOptions = () => {
    if (formData.loan_plan_id && loanPlans.length > 0) {
      const selectedPlan = loanPlans.find(plan => plan.id === formData.loan_plan_id);
      if (selectedPlan) {
        // Return only the plan's duration
        return [selectedPlan.duration_months];
      }
    }
    
    // Default options
    return [3, 6, 12, 24, 36];
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        <div className="bg-white p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!initialSfdId && (
              <div>
                <label className="block text-sm font-medium mb-1">SFD</label>
                <Select 
                  value={sfdId} 
                  onValueChange={(value) => handleSelectChange('sfdId', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une SFD" />
                  </SelectTrigger>
                  <SelectContent>
                    {sfdList.map((sfd) => (
                      <SelectItem key={sfd.id} value={sfd.id}>
                        {sfd.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {sfdId && !isLoadingPlans && loanPlans.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Plan de prêt</label>
                <Select 
                  value={formData.loan_plan_id} 
                  onValueChange={(value) => handleSelectChange('loan_plan_id', value)}
                  disabled={!!initialPlanId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.min_amount.toLocaleString()} à {plan.max_amount.toLocaleString()} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleNumberChange}
                placeholder="Exemple: 50000"
                disabled={isLoadingPlans}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Durée (mois)</label>
              <Select
                value={formData.duration_months ? String(formData.duration_months) : ''}
                onValueChange={(value) => handleSelectChange('duration_months', value)}
                disabled={isLoadingPlans}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une durée" />
                </SelectTrigger>
                <SelectContent>
                  {getDurationOptions().map((duration) => (
                    <SelectItem key={duration} value={String(duration)}>
                      {duration} mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Objet du prêt</label>
              <Textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Pourquoi avez-vous besoin de ce prêt?"
                rows={3}
                disabled={isLoadingPlans}
              />
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                disabled={isSubmitting || isUploading || isLoadingPlans}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Traitement en cours...
                  </span>
                ) : (
                  "Soumettre la demande"
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileLoanApplicationForm;
