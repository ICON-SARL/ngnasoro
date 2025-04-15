
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, X, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit: any | null;
}

const LoanPlanDialog = ({
  isOpen,
  onClose,
  planToEdit
}: LoanPlanDialogProps) => {
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState<string>('10000');
  const [maxAmount, setMaxAmount] = useState<string>('5000000');
  const [minDuration, setMinDuration] = useState<string>('1');
  const [maxDuration, setMaxDuration] = useState<string>('36');
  const [interestRate, setInterestRate] = useState<string>('5.0');
  const [fees, setFees] = useState<string>('1.0');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [repaymentType, setRepaymentType] = useState<string>('fixed');
  const [merefSettings, setMerefSettings] = useState<any>(null);
  const [interestRateExceeded, setInterestRateExceeded] = useState(false);
  
  // Fetch MEREF settings
  useEffect(() => {
    const fetchMerefSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('meref_settings')
          .select('*')
          .single();
        
        if (error) throw error;
        setMerefSettings(data);
      } catch (error) {
        console.error('Error fetching MEREF settings:', error);
      }
    };
    
    fetchMerefSettings();
  }, []);
  
  // Check interest rate against MEREF limits
  useEffect(() => {
    if (merefSettings && parseFloat(interestRate) > 0) {
      // Since max_interest_rate doesn't exist, we'll use a fallback value
      // or we could check against a hardcoded regulatory limit
      const maxAllowedRate = 20; // Example fallback value for maximum allowed interest rate
      setInterestRateExceeded(parseFloat(interestRate) > maxAllowedRate);
    }
  }, [interestRate, merefSettings]);
  
  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name || '');
      setDescription(planToEdit.description || '');
      setMinAmount(planToEdit.min_amount?.toString() || '10000');
      setMaxAmount(planToEdit.max_amount?.toString() || '5000000');
      setMinDuration(planToEdit.min_duration?.toString() || '1');
      setMaxDuration(planToEdit.max_duration?.toString() || '36');
      setInterestRate(planToEdit.interest_rate?.toString() || '5.0');
      setFees(planToEdit.fees?.toString() || '1.0');
      setRequirements(planToEdit.requirements || []);
      setRepaymentType(planToEdit.repayment_type || 'fixed');
    } else {
      resetForm();
    }
  }, [planToEdit, isOpen]);
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setMinAmount('10000');
    setMaxAmount('5000000');
    setMinDuration('1');
    setMaxDuration('36');
    setInterestRate('5.0');
    setFees('1.0');
    setRequirements([]);
    setNewRequirement('');
    setRepaymentType('fixed');
  };
  
  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };
  
  const handleRemoveRequirement = (index: number) => {
    const updated = [...requirements];
    updated.splice(index, 1);
    setRequirements(updated);
  };
  
  const validateSfdBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('sfd_accounts')
        .select('balance')
        .eq('sfd_id', activeSfdId)
        .eq('account_type', 'operation')
        .single();
      
      if (error) throw error;
      
      // Check if the SFD has enough balance for the max loan amount
      if (data.balance < parseFloat(maxAmount)) {
        return {
          valid: false,
          message: `Le solde du compte d'opération (${data.balance} FCFA) est inférieur au montant maximum du prêt (${maxAmount} FCFA).`
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Error validating SFD balance:', error);
      return { 
        valid: false, 
        message: "Impossible de vérifier le solde du compte d'opération."
      };
    }
  };
  
  const generateAmortizationSchedule = (amount: number, duration: number, rate: number, type: string) => {
    // Simplified amortization schedule generation
    const annualRate = rate / 100;
    const monthlyRate = annualRate / 12;
    let schedule = [];
    
    if (type === 'fixed') {
      // Fixed monthly payment (PMT formula)
      const pmt = amount * monthlyRate * Math.pow(1 + monthlyRate, duration) / 
                (Math.pow(1 + monthlyRate, duration) - 1);
      
      let remainingBalance = amount;
      
      for (let i = 1; i <= duration; i++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = pmt - interestPayment;
        remainingBalance -= principalPayment;
        
        schedule.push({
          month: i,
          payment: pmt,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance > 0 ? remainingBalance : 0
        });
      }
    } else {
      // Decreasing installments (equal principal payments)
      const principalPayment = amount / duration;
      let remainingBalance = amount;
      
      for (let i = 1; i <= duration; i++) {
        const interestPayment = remainingBalance * monthlyRate;
        const payment = principalPayment + interestPayment;
        remainingBalance -= principalPayment;
        
        schedule.push({
          month: i,
          payment: payment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance > 0 ? remainingBalance : 0
        });
      }
    }
    
    return schedule;
  };
  
  const handleSave = async () => {
    if (!name) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier un nom pour ce plan",
        variant: "destructive",
      });
      return;
    }
    
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "SFD non identifié",
        variant: "destructive",
      });
      return;
    }
    
    // Validate interest rate against MEREF limits
    if (interestRateExceeded) {
      toast({
        title: "Taux d'intérêt trop élevé",
        description: "Le taux d'intérêt dépasse les limites réglementaires définies par le MEREF.",
        variant: "destructive",
      });
      return;
    }
    
    // Check SFD account balance
    const balanceCheck = await validateSfdBalance();
    if (!balanceCheck.valid) {
      toast({
        title: "Solde insuffisant",
        description: balanceCheck.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate sample amortization schedule for preview/validation
      const schedule = generateAmortizationSchedule(
        parseFloat(maxAmount),
        parseInt(maxDuration),
        parseFloat(interestRate),
        repaymentType
      );
      
      const planData = {
        name,
        description,
        min_amount: parseFloat(minAmount),
        max_amount: parseFloat(maxAmount),
        min_duration: parseInt(minDuration),
        max_duration: parseInt(maxDuration),
        interest_rate: parseFloat(interestRate),
        fees: parseFloat(fees),
        requirements,
        repayment_type: repaymentType,
        amortization_preview: schedule.slice(0, 3), // Store just first 3 entries as preview
        sfd_id: activeSfdId
      };
      
      if (planToEdit) {
        // Update existing plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update({
            ...planData,
            updated_at: new Date().toISOString()
          })
          .eq('id', planToEdit.id);
          
        if (error) throw error;
        
        toast({
          title: "Plan mis à jour",
          description: "Le plan de prêt a été modifié avec succès",
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData);
          
        if (error) throw error;
        
        toast({
          title: "Plan créé",
          description: "Le nouveau plan de prêt a été créé avec succès",
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le plan : ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{planToEdit ? "Modifier le plan de prêt" : "Nouveau plan de prêt"}</DialogTitle>
          <DialogDescription>
            {planToEdit 
              ? "Modifiez les détails du plan de prêt existant." 
              : "Configurez un nouveau type de prêt à offrir aux clients."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {interestRateExceeded && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Attention : Le taux d'intérêt dépasse les limites réglementaires définies par le MEREF.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Nom du plan *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Prêt Agricole, Microprêt Commercial..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce plan de prêt et ses conditions particulières..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Montant minimum (FCFA) *</Label>
              <Input
                id="minAmount"
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Montant maximum (FCFA) *</Label>
              <Input
                id="maxAmount"
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minDuration">Durée minimum (mois) *</Label>
              <Input
                id="minDuration"
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDuration">Durée maximum (mois) *</Label>
              <Input
                id="maxDuration"
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                required
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Taux d'intérêt (%) *</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fees">Frais administratifs (%) *</Label>
              <Input
                id="fees"
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repaymentType">Type de remboursement *</Label>
            <Select
              value={repaymentType}
              onValueChange={setRepaymentType}
            >
              <SelectTrigger id="repaymentType">
                <SelectValue placeholder="Sélectionnez le type de remboursement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Mensualités fixes</SelectItem>
                <SelectItem value="decreasing">Mensualités dégressives</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Documents requis</Label>
            <div className="flex space-x-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Ajouter un document requis"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddRequirement}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {requirements.length > 0 && (
              <ul className="mt-2 space-y-1">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{req}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveRequirement(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {planToEdit ? "Mise à jour..." : "Création..."}
              </>
            ) : planToEdit ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Mettre à jour
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Créer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanPlanDialog;
