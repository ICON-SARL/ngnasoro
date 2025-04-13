
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
import { Loader2, X } from 'lucide-react';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  planToEdit: any | null;
}

const LoanPlanDialog = ({
  isOpen,
  onClose,
  onSaved,
  planToEdit
}: LoanPlanDialogProps) => {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState<string>('10000');
  const [maxAmount, setMaxAmount] = useState<string>('500000');
  const [minDuration, setMinDuration] = useState<string>('1');
  const [maxDuration, setMaxDuration] = useState<string>('36');
  const [interestRate, setInterestRate] = useState<string>('5.0');
  const [fees, setFees] = useState<string>('1.0');
  
  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name || '');
      setDescription(planToEdit.description || '');
      setMinAmount(planToEdit.min_amount?.toString() || '10000');
      setMaxAmount(planToEdit.max_amount?.toString() || '500000');
      setMinDuration(planToEdit.min_duration?.toString() || '1');
      setMaxDuration(planToEdit.max_duration?.toString() || '36');
      setInterestRate(planToEdit.interest_rate?.toString() || '5.0');
      setFees(planToEdit.fees?.toString() || '1.0');
    } else {
      resetForm();
    }
  }, [planToEdit, isOpen]);
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setMinAmount('10000');
    setMaxAmount('500000');
    setMinDuration('1');
    setMaxDuration('36');
    setInterestRate('5.0');
    setFees('1.0');
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
      
      onSaved();
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
            <Label htmlFor="name">Nom du plan</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Prêt Agricole, Microprêt Commercial..."
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
              <Label htmlFor="minAmount">Montant minimum (FCFA)</Label>
              <Input
                id="minAmount"
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Montant maximum (FCFA)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minDuration">Durée minimum (mois)</Label>
              <Input
                id="minDuration"
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDuration">Durée maximum (mois)</Label>
              <Input
                id="maxDuration"
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Taux d'intérêt (%)</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fees">Frais administratifs (%)</Label>
              <Input
                id="fees"
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
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
            ) : (
              planToEdit ? "Mettre à jour" : "Créer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanPlanDialog;
