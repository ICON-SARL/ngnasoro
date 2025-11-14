import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { AmountDisplay } from '@/components/shared/AmountDisplay';

interface LoanApplicationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STEPS = [
  { id: 1, title: 'Montant et durée', description: 'Choisissez votre plan de prêt' },
  { id: 2, title: 'Garanties', description: 'Ajoutez vos garanties si nécessaire' },
  { id: 3, title: 'Détails', description: 'Complétez votre demande' },
  { id: 4, title: 'Confirmation', description: 'Vérifiez et soumettez' }
];

export function LoanApplicationWizard({ open, onOpenChange, onSuccess }: LoanApplicationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loanPlans, setLoanPlans] = useState<any[]>([]);

  // Form data
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [collaterals, setCollaterals] = useState<any[]>([]);
  const [collateralType, setCollateralType] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [collateralValue, setCollateralValue] = useState('');

  // Calculated values
  const [calculation, setCalculation] = useState({
    totalAmount: 0,
    monthlyPayment: 0,
    interestAmount: 0
  });

  useEffect(() => {
    if (open) {
      fetchLoanPlans();
    }
  }, [open]);

  useEffect(() => {
    if (selectedPlan && amount) {
      calculateLoan();
    }
  }, [selectedPlan, amount]);

  const fetchLoanPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('is_active', true)
        .order('min_amount');

      if (error) throw error;
      setLoanPlans(data || []);
    } catch (error) {
      console.error('Error fetching loan plans:', error);
    }
  };

  const calculateLoan = () => {
    const plan = loanPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const loanAmount = parseFloat(amount);
    if (isNaN(loanAmount)) return;

    const totalAmount = loanAmount * (1 + plan.interest_rate);
    const monthlyPayment = totalAmount / plan.duration_months;
    const interestAmount = totalAmount - loanAmount;

    setCalculation({
      totalAmount,
      monthlyPayment,
      interestAmount
    });
  };

  const addCollateral = () => {
    if (!collateralType || !collateralDescription || !collateralValue) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs de la garantie',
        variant: 'destructive'
      });
      return;
    }

    setCollaterals([...collaterals, {
      type: collateralType,
      description: collateralDescription,
      value: parseFloat(collateralValue)
    }]);

    setCollateralType('');
    setCollateralDescription('');
    setCollateralValue('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('apply-for-loan', {
        body: {
          amount: parseFloat(amount),
          loanPlanId: selectedPlan,
          purpose,
          collaterals: collaterals.length > 0 ? collaterals : null
        }
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Votre demande de prêt a été soumise avec succès'
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de soumettre la demande',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedPlan && amount && parseFloat(amount) > 0;
      case 2:
        return true; // Collaterals are optional
      case 3:
        return purpose.trim().length >= 20;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan de prêt</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un plan" />
                </SelectTrigger>
                <SelectContent>
                  {loanPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA, {plan.duration_months} mois)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant demandé (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            {selectedPlan && amount && calculation.totalAmount > 0 && (
              <Card className="bg-muted">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Montant emprunté:</span>
                    <AmountDisplay amount={parseFloat(amount)} className="text-sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Intérêts:</span>
                    <AmountDisplay amount={calculation.interestAmount} className="text-sm" />
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total à rembourser:</span>
                    <AmountDisplay amount={calculation.totalAmount} />
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Mensualité:</span>
                    <AmountDisplay amount={calculation.monthlyPayment} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Les garanties sont optionnelles mais peuvent faciliter l'approbation de votre prêt.
            </p>

            <div className="space-y-2">
              <Label>Type de garantie</Label>
              <Select value={collateralType} onValueChange={setCollateralType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_estate">Bien immobilier</SelectItem>
                  <SelectItem value="vehicle">Véhicule</SelectItem>
                  <SelectItem value="equipment">Équipement</SelectItem>
                  <SelectItem value="stock">Stock/Marchandise</SelectItem>
                  <SelectItem value="guarantee">Caution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collateralDescription">Description</Label>
              <Textarea
                id="collateralDescription"
                value={collateralDescription}
                onChange={(e) => setCollateralDescription(e.target.value)}
                placeholder="Décrivez la garantie..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collateralValue">Valeur estimée (FCFA)</Label>
              <Input
                id="collateralValue"
                type="number"
                value={collateralValue}
                onChange={(e) => setCollateralValue(e.target.value)}
                placeholder="0"
              />
            </div>

            <Button type="button" onClick={addCollateral} variant="outline" className="w-full">
              Ajouter cette garantie
            </Button>

            {collaterals.length > 0 && (
              <div className="space-y-2">
                <Label>Garanties ajoutées ({collaterals.length})</Label>
                {collaterals.map((col, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{col.type}</p>
                          <p className="text-sm text-muted-foreground">{col.description}</p>
                        </div>
                        <AmountDisplay amount={col.value} className="text-sm" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Objet du prêt</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Décrivez l'utilisation prévue des fonds (minimum 20 caractères)..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                {purpose.length}/20 caractères minimum
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-muted-foreground">Montant</Label>
                  <p className="text-lg font-semibold"><AmountDisplay amount={parseFloat(amount)} /></p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total à rembourser</Label>
                  <p className="text-lg font-semibold"><AmountDisplay amount={calculation.totalAmount} /></p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mensualité</Label>
                  <p className="text-lg font-semibold"><AmountDisplay amount={calculation.monthlyPayment} /></p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Garanties</Label>
                  <p className="text-sm">{collaterals.length} garantie(s) ajoutée(s)</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Objet</Label>
                  <p className="text-sm">{purpose}</p>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
              En soumettant cette demande, vous acceptez les conditions du prêt.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Demande de prêt</DialogTitle>
          <DialogDescription>
            Étape {currentStep} sur {STEPS.length}: {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep > step.id 
                  ? 'bg-primary border-primary text-primary-foreground'
                  : currentStep === step.id
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed() || loading}
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Soumettre la demande
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
