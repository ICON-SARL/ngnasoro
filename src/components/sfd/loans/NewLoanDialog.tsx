
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client'; 
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface NewLoanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanCreated: () => void;
}

const NewLoanDialog: React.FC<NewLoanDialogProps> = ({ 
  isOpen, 
  onClose,
  onLoanCreated
}) => {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loanPlans, setLoanPlans] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  
  const [loanData, setLoanData] = useState({
    client_id: '',
    amount: '',
    duration_months: '',
    interest_rate: '',
    purpose: '',
    plan_id: '',
  });

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  useEffect(() => {
    if (activeSfdId) {
      fetchClients();
      fetchLoanPlans();
    }
  }, [activeSfdId]);

  // Update fields when a loan plan is selected
  useEffect(() => {
    if (selectedPlan) {
      setLoanData(prev => ({
        ...prev,
        interest_rate: selectedPlan.interest_rate.toString(),
        amount: selectedPlan.min_amount.toString(),
        duration_months: selectedPlan.min_duration.toString()
      }));
    }
  }, [selectedPlan]);

  // Calculate monthly payment whenever amount, interest rate or duration changes
  useEffect(() => {
    calculateMonthlyPayment();
  }, [loanData.amount, loanData.interest_rate, loanData.duration_months]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('id, full_name, email, phone')
        .eq('sfd_id', activeSfdId)
        .eq('status', 'validated');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients",
        variant: "destructive"
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchLoanPlans = async () => {
    try {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .eq('is_active', true);

      if (error) throw error;
      setLoanPlans(data || []);
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de prêt",
        variant: "destructive"
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  const calculateMonthlyPayment = () => {
    const amount = parseFloat(loanData.amount) || 0;
    const interestRate = parseFloat(loanData.interest_rate) || 0;
    const durationMonths = parseInt(loanData.duration_months) || 1;
    
    if (amount <= 0 || durationMonths <= 0) {
      setMonthlyPayment(null);
      return;
    }
    
    // Simple interest calculation (can be replaced with more complex formulas)
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalInterest = amount * monthlyInterestRate * durationMonths;
    const totalAmount = amount + totalInterest;
    const monthly = totalAmount / durationMonths;
    
    setMonthlyPayment(parseFloat(monthly.toFixed(2)));
  };

  const handlePlanChange = (planId: string) => {
    const plan = loanPlans.find(p => p.id === planId);
    setSelectedPlan(plan);
    setLoanData(prev => ({ ...prev, plan_id: planId }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!loanData.client_id) {
      toast({
        title: "Validation",
        description: "Veuillez sélectionner un client",
        variant: "destructive"
      });
      return;
    }

    if (!loanData.amount || parseFloat(loanData.amount) <= 0) {
      toast({
        title: "Validation",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    if (!loanData.purpose.trim()) {
      toast({
        title: "Validation",
        description: "Veuillez préciser l'objet du prêt",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const newLoan = {
        client_id: loanData.client_id,
        sfd_id: activeSfdId,
        amount: parseFloat(loanData.amount),
        duration_months: parseInt(loanData.duration_months),
        interest_rate: parseFloat(loanData.interest_rate),
        purpose: loanData.purpose,
        monthly_payment: monthlyPayment,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('sfd_loans')
        .insert(newLoan)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Prêt créé avec succès",
        description: "La demande de prêt a été créée et est en attente d'approbation."
      });

      onLoanCreated();
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le prêt",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLoanData(prev => ({ ...prev, [name]: value }));
  };

  // Check if amount is within plan limits
  const amountIsValid = selectedPlan 
    ? parseFloat(loanData.amount) >= selectedPlan.min_amount && 
      parseFloat(loanData.amount) <= selectedPlan.max_amount
    : true;

  // Check if duration is within plan limits
  const durationIsValid = selectedPlan
    ? parseInt(loanData.duration_months) >= selectedPlan.min_duration && 
      parseInt(loanData.duration_months) <= selectedPlan.max_duration
    : true;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau Prêt</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <Select
              value={loanData.client_id}
              onValueChange={(value) => setLoanData(prev => ({ ...prev, client_id: value }))}
            >
              <SelectTrigger id="client_id">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {loadingClients ? (
                  <SelectItem value="loading" disabled>Chargement des clients...</SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="none" disabled>Aucun client trouvé</SelectItem>
                ) : (
                  clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} {client.phone ? `(${client.phone})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan_id">Plan de prêt</Label>
            <Select
              value={loanData.plan_id}
              onValueChange={handlePlanChange}
            >
              <SelectTrigger id="plan_id">
                <SelectValue placeholder="Sélectionner un plan" />
              </SelectTrigger>
              <SelectContent>
                {loadingPlans ? (
                  <SelectItem value="loading" disabled>Chargement des plans...</SelectItem>
                ) : loanPlans.length === 0 ? (
                  <SelectItem value="none" disabled>Aucun plan trouvé</SelectItem>
                ) : (
                  loanPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.interest_rate}%
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPlan && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Plan sélectionné: {selectedPlan.name}</AlertTitle>
              <AlertDescription>
                <p>Montant: {selectedPlan.min_amount.toLocaleString()} - {selectedPlan.max_amount.toLocaleString()} FCFA</p>
                <p>Durée: {selectedPlan.min_duration} - {selectedPlan.max_duration} mois</p>
                <p>Taux d'intérêt: {selectedPlan.interest_rate}%</p>
                {selectedPlan.description && <p>Description: {selectedPlan.description}</p>}
              </AlertDescription>
            </Alert>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Montant (FCFA)
                {!amountIsValid && <span className="text-red-500 ml-1">Hors limites</span>}
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={loanData.amount}
                onChange={handleInputChange}
                className={!amountIsValid ? "border-red-500" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_months">
                Durée (mois)
                {!durationIsValid && <span className="text-red-500 ml-1">Hors limites</span>}
              </Label>
              <Input
                id="duration_months"
                name="duration_months"
                type="number"
                value={loanData.duration_months}
                onChange={handleInputChange}
                className={!durationIsValid ? "border-red-500" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
              <Input
                id="interest_rate"
                name="interest_rate"
                type="number"
                step="0.01"
                value={loanData.interest_rate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Mensualité</Label>
              <p className="p-2 bg-muted rounded-md text-center">
                {monthlyPayment 
                  ? `${monthlyPayment.toLocaleString()} FCFA`
                  : '---'
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Objet du prêt</Label>
            <Textarea
              id="purpose"
              name="purpose"
              placeholder="Description de l'objet du prêt"
              value={loanData.purpose}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !amountIsValid || !durationIsValid}
          >
            {isSubmitting ? 'Création...' : 'Créer le prêt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewLoanDialog;
