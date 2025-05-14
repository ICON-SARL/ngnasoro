
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MobileLoanApplicationFormProps {
  planId?: string;
  sfdId?: string;
}

const MobileLoanApplicationForm: React.FC<MobileLoanApplicationFormProps> = ({ 
  planId,
  sfdId
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(100000);
  const [duration, setDuration] = useState(6);
  const [purpose, setPurpose] = useState('');
  const [selectedSfdId, setSelectedSfdId] = useState<string>(sfdId || '');
  const [sfds, setSfds] = useState<any[]>([]);
  const [minAmount, setMinAmount] = useState(10000);
  const [maxAmount, setMaxAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loanPlan, setLoanPlan] = useState<any | null>(null);
  
  // Use planId and sfdId from props or from location state
  const routePlanId = planId || location.state?.planId;
  const routeSfdId = sfdId || location.state?.sfdId;

  // Fetch loan plan if we have a planId
  useEffect(() => {
    if (routePlanId) {
      fetchLoanPlan(routePlanId);
    }
  }, [routePlanId]);

  // Fetch SFDs for selection dropdown if not provided sfdId
  useEffect(() => {
    if (!routeSfdId) {
      fetchSfds();
    } else {
      setSelectedSfdId(routeSfdId);
    }
    fetchClientId();
  }, [routeSfdId]);

  // Set loan amount constraints based on plan
  useEffect(() => {
    if (loanPlan) {
      setMinAmount(loanPlan.min_amount || 10000);
      setMaxAmount(loanPlan.max_amount || 5000000);
      setInterestRate(loanPlan.interest_rate || 5.5);
      setAmount(Math.max(minAmount, Math.min(amount, maxAmount)));
    }
  }, [loanPlan, minAmount, maxAmount]);

  const fetchLoanPlan = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*, sfds:sfd_id(id, name)')
        .eq('id', planId)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Loaded loan plan:", data);
        setLoanPlan(data);
        // If we have a plan, we also know the SFD
        if (data.sfd_id) {
          setSelectedSfdId(data.sfd_id);
        }
      }
    } catch (err) {
      console.error('Error fetching loan plan:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du plan de prêt',
        variant: 'destructive',
      });
    }
  };

  const fetchSfds = async () => {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setSfds(data || []);
    } catch (err) {
      console.error('Error fetching SFDs:', err);
    }
  };

  const fetchClientId = async () => {
    if (!user?.id) return;
    
    try {
      // Find the client ID for the current user
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', selectedSfdId)
        .single();

      if (error) {
        console.log('Client not found for this SFD and user, might need to create one');
        return;
      }

      if (data) {
        setClientId(data.id);
      }
    } catch (err) {
      console.error('Error fetching client ID:', err);
    }
  };

  useEffect(() => {
    if (selectedSfdId) {
      fetchClientId();
    }
  }, [selectedSfdId, user?.id]);

  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, duration)) /
                   (Math.pow(1 + monthlyRate, duration) - 1);
    return isFinite(payment) ? Math.round(payment) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSfdId || !purpose) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    if (!clientId) {
      toast({
        title: 'Erreur',
        description: 'Vous devez d\'abord être client de cette SFD. Veuillez soumettre une demande d\'adhésion.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Submitting loan application with:", {
        client_id: clientId,
        sfd_id: selectedSfdId,
        loan_plan_id: routePlanId || null,
        amount,
        duration_months: duration,
        purpose,
        interest_rate: interestRate,
        monthly_payment: calculateMonthlyPayment(),
      });

      // Submit to API directly using edge function
      const { data, error } = await supabase.functions
        .invoke('loan-manager', {
          body: {
            action: 'create_loan',
            data: {
              client_id: clientId,
              sfd_id: selectedSfdId,
              loan_plan_id: routePlanId || null,
              amount,
              duration_months: duration,
              purpose,
              interest_rate: interestRate,
              monthly_payment: calculateMonthlyPayment(),
              status: 'pending'
            }
          }
        });

      if (error) {
        throw new Error(`Error creating loan: ${error.message}`);
      }

      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de prêt a été soumise avec succès',
      });
      
      navigate('/mobile-flow/my-loans', { replace: true });
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la soumission de votre demande',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR') + ' FCFA';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Only show SFD selection if no loan plan is selected */}
      {!routePlanId && !routeSfdId && (
        <div className="space-y-2">
          <Label htmlFor="sfd">Institution de microfinance (SFD)</Label>
          <Select
            value={selectedSfdId}
            onValueChange={setSelectedSfdId}
            required
          >
            <SelectTrigger id="sfd">
              <SelectValue placeholder="Sélectionnez une SFD" />
            </SelectTrigger>
            <SelectContent>
              {sfds.map((sfd) => (
                <SelectItem key={sfd.id} value={sfd.id}>
                  {sfd.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Display loan plan name if one is selected */}
      {loanPlan && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-2">
          <p className="text-sm font-medium">Plan de prêt: {loanPlan.name}</p>
          <p className="text-xs text-gray-500">
            Taux: {loanPlan.interest_rate}% - Montant: {loanPlan.min_amount.toLocaleString()} à {loanPlan.max_amount.toLocaleString()} FCFA
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="amount">Montant du prêt</Label>
            <span className="text-sm font-medium">{formatCurrency(amount)}</span>
          </div>
          <Slider
            id="amount"
            min={minAmount}
            max={maxAmount}
            step={1000}
            value={[amount]}
            onValueChange={(values) => setAmount(values[0])}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Durée du prêt (mois)</Label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
            required
          >
            <SelectTrigger id="duration">
              <SelectValue placeholder="Sélectionnez une durée" />
            </SelectTrigger>
            <SelectContent>
              {[3, 6, 12, 18, 24, 36].map((months) => (
                <SelectItem key={months} value={months.toString()}>
                  {months} mois
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Objet du prêt</Label>
          <Select
            value={purpose}
            onValueChange={setPurpose}
            required
          >
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Sélectionnez l'objet du prêt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Commerce">Commerce</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Éducation">Éducation</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Fonds de roulement">Fonds de roulement</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
          <div className="flex justify-between">
            <span className="text-sm">Taux d'intérêt</span>
            <span className="font-medium">{interestRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Mensualité</span>
            <span className="font-medium">{formatCurrency(calculateMonthlyPayment())}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-sm font-medium">Coût total</span>
            <span className="font-bold">{formatCurrency(calculateMonthlyPayment() * duration)}</span>
          </div>
        </div>

        {!clientId && selectedSfdId && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-sm">
            Vous devez d'abord être client de cette SFD pour soumettre une demande de prêt.
            <Button 
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => navigate('/mobile-flow/adhesion', { state: { sfdId: selectedSfdId } })}
            >
              Soumettre une demande d'adhésion
            </Button>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !selectedSfdId || !purpose || !clientId}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : 'Soumettre la demande'}
        </Button>
      </div>
    </form>
  );
};

export default MobileLoanApplicationForm;
