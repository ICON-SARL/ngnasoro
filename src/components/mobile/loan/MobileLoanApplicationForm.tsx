
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MobileLoanApplicationFormProps {
  planId?: string;
  sfdId?: string;
}

const MobileLoanApplicationForm: React.FC<MobileLoanApplicationFormProps> = ({ planId, sfdId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [amountValid, setAmountValid] = useState(true);
  const [durationValid, setDurationValid] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    duration_months: '',
    purpose: ''
  });

  // Fetch plan details if planId is provided
  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!planId) return;
      
      try {
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (error) throw error;
        
        console.log("Loaded loan plan:", data);
        setPlanDetails(data);
        
        // Pre-fill purpose from plan if available
        if (data.name) {
          setFormData(prev => ({ 
            ...prev, 
            purpose: `Prêt ${data.name}` 
          }));
        }
      } catch (err) {
        console.error("Error fetching plan details:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du plan de prêt",
          variant: "destructive",
        });
      }
    };
    
    fetchPlanDetails();
  }, [planId, toast]);
  
  // Fetch client ID for the current user and SFD
  useEffect(() => {
    const fetchClientId = async () => {
      if (!user?.id || !sfdId) return;
      
      try {
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', user.id)
          .eq('sfd_id', sfdId)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          console.log("Found client ID:", data.id);
          setClientId(data.id);
        } else {
          console.log("Client not found for this SFD and user, might need to create one");
        }
      } catch (err) {
        console.error("Error fetching client ID:", err);
      }
    };
    
    fetchClientId();
  }, [user, sfdId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'amount') {
      validateAmount(value);
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'duration_months') {
      validateDuration(parseInt(value));
    }
  };
  
  const validateAmount = (value: string) => {
    const numValue = Number(value);
    
    if (planDetails) {
      const valid = numValue >= planDetails.min_amount && numValue <= planDetails.max_amount;
      setAmountValid(valid);
    }
  };
  
  const validateDuration = (value: number) => {
    if (planDetails) {
      const valid = value >= planDetails.min_duration && value <= planDetails.max_duration;
      setDurationValid(valid);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sfdId) {
      toast({
        title: "Erreur",
        description: "SFD non spécifiée",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientId) {
      toast({
        title: "Erreur",
        description: "Vous n'êtes pas encore client de cette SFD",
        variant: "destructive",
      });
      return;
    }
    
    if (!amountValid || !durationValid) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez vérifier le montant et la durée du prêt",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparation des données du prêt
      const loanData = {
        client_id: clientId,
        sfd_id: sfdId,
        loan_plan_id: planId || null,
        amount: Number(formData.amount),
        duration_months: Number(formData.duration_months),
        purpose: formData.purpose,
      };
      
      console.log("Submitting loan application:", loanData);
      
      // Appel direct à la fonction Edge pour créer le prêt
      const { data, error } = await supabase.functions.invoke('loan-manager', {
        body: {
          action: 'create_loan',
          data: loanData
        }
      });
      
      if (error) {
        console.error("Error creating loan:", error);
        throw new Error(`Erreur lors de la création du prêt: ${error.message}`);
      }
      
      console.log("Loan created successfully:", data);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès",
      });
      
      // Rediriger vers la page des prêts
      navigate('/mobile/loans');
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
  
  // Generate duration options based on plan details
  const getDurationOptions = () => {
    if (!planDetails) return [3, 6, 12, 24, 36];
    
    const { min_duration, max_duration } = planDetails;
    const options = [];
    
    if (min_duration <= 3 && max_duration >= 3) options.push(3);
    if (min_duration <= 6 && max_duration >= 6) options.push(6);
    if (min_duration <= 12 && max_duration >= 12) options.push(12);
    if (min_duration <= 24 && max_duration >= 24) options.push(24);
    if (min_duration <= 36 && max_duration >= 36) options.push(36);
    
    return options;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-4 mb-4">
        <div className="space-y-4">
          {/* Montant */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Montant (FCFA) {planDetails && `(${planDetails.min_amount} - ${planDetails.max_amount})`}
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Montant du prêt"
              required
              className={!amountValid ? "border-red-500" : ""}
            />
            {!amountValid && (
              <p className="text-xs text-red-500 mt-1">
                Le montant doit être entre {planDetails?.min_amount} et {planDetails?.max_amount} FCFA
              </p>
            )}
          </div>
          
          {/* Durée */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Durée (mois) {planDetails && `(${planDetails.min_duration} - ${planDetails.max_duration})`}
            </label>
            <Select 
              name="duration_months"
              value={formData.duration_months}
              onValueChange={(value) => handleSelectChange('duration_months', value)}
            >
              <SelectTrigger className={!durationValid ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionner une durée" />
              </SelectTrigger>
              <SelectContent>
                {getDurationOptions().map(duration => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} mois
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!durationValid && (
              <p className="text-xs text-red-500 mt-1">
                La durée doit être entre {planDetails?.min_duration} et {planDetails?.max_duration} mois
              </p>
            )}
          </div>
          
          {/* Objet du prêt */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
              Objet du prêt*
            </label>
            <Textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Pourquoi avez-vous besoin de ce prêt?"
              rows={3}
              required
            />
          </div>
        </div>
      </Card>
      
      <div className="mt-6">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !amountValid || !durationValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            "Soumettre la demande"
          )}
        </Button>
      </div>
    </form>
  );
};

export default MobileLoanApplicationForm;
