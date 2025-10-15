import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Calculator, 
  CalendarCheck, 
  CreditCard, 
  DollarSign, 
  Percent
} from 'lucide-react';

interface Client {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface LoanPlan {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  duration_months: number;
  interest_rate: number;
}

interface LoanFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const NewLoanForm: React.FC<LoanFormProps> = ({ onCancel, onSuccess }) => {
  const { toast } = useToast();
  const { createLoan } = useSfdLoans();
  const { user, activeSfdId } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    amount: 100000,
    duration_months: 6,
    interest_rate: 5.5,
    purpose: '',
    subsidy_requested: false,
    subsidy_amount: 0,
    subsidy_rate: 0,
    plan_id: ''
  });

  useEffect(() => {
    fetchClients();
    fetchLoanPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      setFormData(prev => ({
        ...prev,
        amount: Math.max(prev.amount, selectedPlan.min_amount),
        interest_rate: selectedPlan.interest_rate,
        duration_months: selectedPlan.duration_months
      }));
    }
  }, [selectedPlan]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      if (activeSfdId) {
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('id, full_name, email, phone')
          .eq('sfd_id', activeSfdId)
          .eq('status', 'validated');
          
        if (error) throw error;
        setClients(data || []);
      } else {
        setClients([
          { id: 'client1', full_name: 'Aissatou Diallo' },
          { id: 'client2', full_name: 'Mamadou Sy' },
          { id: 'client3', full_name: 'Fatou Ndiaye' },
          { id: 'client4', full_name: 'Ibrahim Sow' },
          { id: 'client5', full_name: 'Kadiatou Bah' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des clients',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoanPlans = async () => {
    try {
      if (activeSfdId) {
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('sfd_id', activeSfdId)
          .eq('is_active', true);
          
        if (error) throw error;
        setLoanPlans(data || []);
      } else {
        setLoanPlans([
          {
            id: 'plan1',
            name: 'Prêt Standard',
            description: 'Prêt général avec taux fixe',
            min_amount: 50000,
            max_amount: 500000,
            duration_months: 24,
            interest_rate: 5.5
          },
          {
            id: 'plan2',
            name: 'Prêt Agricole',
            description: 'Prêt destiné aux activités agricoles',
            min_amount: 100000,
            max_amount: 1000000,
            duration_months: 36,
            interest_rate: 4.5
          },
          {
            id: 'plan3',
            name: 'Microentreprise',
            description: 'Pour les petites entreprises',
            min_amount: 75000,
            max_amount: 750000,
            duration_months: 30,
            interest_rate: 6.0
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching loan plans:', error);
    }
  };

  const handleSelectPlan = (planId: string) => {
    const plan = loanPlans.find(p => p.id === planId);
    setSelectedPlan(plan || null);
    setFormData(prev => ({
      ...prev,
      plan_id: planId,
      interest_rate: plan?.interest_rate || prev.interest_rate
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      subsidy_requested: checked,
      subsidy_amount: checked ? formData.subsidy_amount : 0,
      subsidy_rate: checked ? formData.subsidy_rate : 0
    });
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData({
      ...formData,
      [name]: value[0]
    });
  };

  const calculateMonthlyPayment = () => {
    const amount = formData.amount;
    const rate = formData.interest_rate / 100 / 12; // Monthly interest rate
    const duration = formData.duration_months;
    
    // Standard loan payment formula: P = (r*A) / (1 - (1+r)^-n)
    const monthlyPayment = (amount * rate * Math.pow(1 + rate, duration)) / 
                          (Math.pow(1 + rate, duration) - 1);
    
    return isNaN(monthlyPayment) ? 0 : Math.round(monthlyPayment);
  };

  const calculateTotalRepayment = () => {
    const monthlyPayment = calculateMonthlyPayment();
    return monthlyPayment * formData.duration_months;
  };

  const calculateTotalInterest = () => {
    const totalRepayment = calculateTotalRepayment();
    return totalRepayment - formData.amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const monthlyPayment = calculateMonthlyPayment();
      
      // Calculate subsidy amount if requested
      let subsidyAmount = 0;
      let subsidyRate = 0;
      
      if (formData.subsidy_requested) {
        subsidyRate = formData.subsidy_rate;
        subsidyAmount = (formData.amount * subsidyRate) / 100;
      }
      
      await createLoan.mutateAsync({
        client_id: formData.client_id,
        sfd_id: activeSfdId || 'sfd-id',
        amount: formData.amount,
        duration_months: formData.duration_months,
        interest_rate: formData.interest_rate,
        purpose: formData.purpose,
        monthly_payment: monthlyPayment,
        subsidy_amount: subsidyAmount,
        subsidy_rate: subsidyRate
      });
      
      toast({
        title: 'Prêt créé avec succès',
        description: 'Le prêt a été enregistré et est en attente d\'approbation'
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le prêt',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleInputChange({ target: { name: 'client_id', value } } as any)}
                required
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan">Plan de prêt</Label>
              <Select
                value={formData.plan_id}
                onValueChange={handleSelectPlan}
                required
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  {loanPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.interest_rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedPlan && (
                <div className="text-sm text-muted-foreground mt-1">
                  <p>{selectedPlan.description}</p>
                  <p className="mt-1">
                    <span className="font-medium">Limites:</span> {formatCurrency(selectedPlan.min_amount)} - {formatCurrency(selectedPlan.max_amount)} | 
                    {selectedPlan.duration_months} mois
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Montant du prêt</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min={selectedPlan?.min_amount || 10000}
                  max={selectedPlan?.max_amount || 5000000}
                />
                <div className="w-20 text-sm font-medium">FCFA</div>
              </div>
              
              {selectedPlan && (
                <>
                  <Slider
                    value={[formData.amount]}
                    min={selectedPlan.min_amount}
                    max={selectedPlan.max_amount}
                    step={5000}
                    onValueChange={(value) => handleSliderChange('amount', value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(selectedPlan.min_amount)}</span>
                    <span>{formatCurrency(selectedPlan.max_amount)}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_months">Durée (en mois)</Label>
              <Input
                id="duration_months"
                name="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={handleInputChange}
                required
                value={selectedPlan?.duration_months || formData.duration_months}
                disabled
              />
              
              {selectedPlan && (
                <div className="text-xs text-muted-foreground">
                  Durée fixe: {selectedPlan.duration_months} mois
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Objet du prêt</Label>
              <Textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Décrivez l'objet du prêt..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="subsidy_requested" 
                checked={formData.subsidy_requested}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="subsidy_requested" className="font-medium">
                Demander une subvention
              </Label>
            </div>

            {formData.subsidy_requested && (
              <div className="space-y-2 pl-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="subsidy_rate">Taux de la subvention (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subsidy_rate"
                      name="subsidy_rate"
                      type="number"
                      value={formData.subsidy_rate}
                      onChange={handleInputChange}
                      min={0}
                      max={90}
                      step={0.5}
                      required={formData.subsidy_requested}
                    />
                    <div className="w-10 text-center">%</div>
                  </div>
                </div>
                
                <Alert className="mt-2 bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-xs">
                    Une demande de subvention sera créée et soumise au MEREF pour approbation.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-[#0D6A51]" />
              <h3 className="font-bold">Calcul du prêt</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Montant
                  </div>
                  <div className="font-semibold">{formatCurrency(formData.amount)}</div>
                </div>
                
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Percent className="h-4 w-4 mr-1" /> Taux d'intérêt
                  </div>
                  <div className="font-semibold">{formData.interest_rate}% annuel</div>
                </div>
                
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <CalendarCheck className="h-4 w-4 mr-1" /> Durée
                  </div>
                  <div className="font-semibold">{formData.duration_months} mois</div>
                </div>
                
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" /> Mensualité
                  </div>
                  <div className="font-semibold">{formatCurrency(calculateMonthlyPayment())}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Montant emprunté</span>
                  <span className="font-medium">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total des intérêts</span>
                  <span className="font-medium">{formatCurrency(calculateTotalInterest())}</span>
                </div>
                {formData.subsidy_requested && formData.subsidy_rate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Subvention ({formData.subsidy_rate}%)</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency((formData.amount * formData.subsidy_rate) / 100)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total à rembourser</span>
                  <span className="font-semibold">{formatCurrency(calculateTotalRepayment())}</span>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-sm">
                  Ce prêt sera à l'état <strong>En attente</strong> jusqu'à son approbation par un responsable autorisé.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Création en cours..." : "Créer le prêt"}
        </Button>
      </div>
    </form>
  );
};
