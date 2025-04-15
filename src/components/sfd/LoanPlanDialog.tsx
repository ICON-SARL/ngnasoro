import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check } from 'lucide-react';
import { LoanAmountFields } from './loan-plan/LoanAmountFields';
import { LoanDurationFields } from './loan-plan/LoanDurationFields';
import { LoanRateFields } from './loan-plan/LoanRateFields';
import { RequirementsList } from './loan-plan/RequirementsList';
import { LOAN_PLAN_OPTIONS, MAX_INTEREST_RATE } from './loan-plan/constants';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  planToEdit: any | null;
}

const LoanPlanDialog = ({
  isOpen,
  onClose,
  onSaved,
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
    
    if (parseFloat(interestRate) > MAX_INTEREST_RATE) {
      toast({
        title: "Taux d'intérêt trop élevé",
        description: `Le taux d'intérêt ne peut pas dépasser ${MAX_INTEREST_RATE}% selon les régulations du MEREF.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
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
        sfd_id: activeSfdId
      };
      
      if (planToEdit) {
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
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData);
          
        if (error) throw error;
        
        toast({
          title: "Plan créé",
          description: "Le nouveau plan de prêt a été créé avec succès",
        });
      }
      
      if (onSaved) {
        onSaved();
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
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Nom du plan *</Label>
            <Select
              value={name}
              onValueChange={setName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de plan" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_PLAN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          
          <LoanAmountFields
            minAmount={minAmount}
            maxAmount={maxAmount}
            onMinAmountChange={setMinAmount}
            onMaxAmountChange={setMaxAmount}
          />
          
          <LoanDurationFields
            minDuration={minDuration}
            maxDuration={maxDuration}
            onMinDurationChange={setMinDuration}
            onMaxDurationChange={setMaxDuration}
          />
          
          <LoanRateFields
            interestRate={interestRate}
            fees={fees}
            onInterestRateChange={setInterestRate}
            onFeesChange={setFees}
          />
          
          <RequirementsList
            requirements={requirements}
            newRequirement={newRequirement}
            onNewRequirementChange={setNewRequirement}
            onAddRequirement={handleAddRequirement}
            onRemoveRequirement={handleRemoveRequirement}
          />
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
