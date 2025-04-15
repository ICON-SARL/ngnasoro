
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: any;
  onSaved?: () => void;
}

const LoanPlanDialog: React.FC<LoanPlanDialogProps> = ({ 
  isOpen, 
  onClose, 
  planToEdit, 
  onSaved 
}) => {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState(10000);
  const [maxAmount, setMaxAmount] = useState(1000000);
  const [minDuration, setMinDuration] = useState(1);
  const [maxDuration, setMaxDuration] = useState(12);
  const [interestRate, setInterestRate] = useState(5);
  const [fees, setFees] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name || '');
      setDescription(planToEdit.description || '');
      setMinAmount(planToEdit.min_amount || 10000);
      setMaxAmount(planToEdit.max_amount || 1000000);
      setMinDuration(planToEdit.min_duration || 1);
      setMaxDuration(planToEdit.max_duration || 12);
      setInterestRate(planToEdit.interest_rate || 5);
      setFees(planToEdit.fees || 1);
      setIsActive(planToEdit.is_active || true);
      setRequirements(planToEdit.requirements ? planToEdit.requirements.join('\n') : '');
    } else {
      // Reset form for new plan
      setName('');
      setDescription('');
      setMinAmount(10000);
      setMaxAmount(1000000);
      setMinDuration(1);
      setMaxDuration(12);
      setInterestRate(5);
      setFees(1);
      setIsActive(true);
      setRequirements('');
    }
  }, [planToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Identifiant SFD manquant",
        variant: "destructive"
      });
      return;
    }
    
    if (!name) {
      toast({
        title: "Erreur",
        description: "Le nom du plan est requis",
        variant: "destructive"
      });
      return;
    }
    
    if (minAmount <= 0 || maxAmount <= 0 || minAmount > maxAmount) {
      toast({
        title: "Erreur",
        description: "Les montants spécifiés sont invalides",
        variant: "destructive"
      });
      return;
    }
    
    if (minDuration <= 0 || maxDuration <= 0 || minDuration > maxDuration) {
      toast({
        title: "Erreur",
        description: "Les durées spécifiées sont invalides",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const requirementsArray = requirements
        .split('\n')
        .map(req => req.trim())
        .filter(req => req.length > 0);
      
      const planData = {
        name,
        description,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_duration: minDuration,
        max_duration: maxDuration,
        interest_rate: interestRate,
        fees,
        is_active: isActive,
        requirements: requirementsArray,
        sfd_id: activeSfdId
      };
      
      let result;
      
      if (planToEdit) {
        // Update existing plan
        result = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', planToEdit.id);
      } else {
        // Create new plan
        result = await supabase
          .from('sfd_loan_plans')
          .insert(planData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: planToEdit ? "Plan modifié" : "Plan créé",
        description: planToEdit 
          ? `Le plan "${name}" a été modifié avec succès`
          : `Le plan "${name}" a été créé avec succès`,
      });
      
      if (onSaved) onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le plan de prêt",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {planToEdit ? 'Modifier le plan de prêt' : 'Nouveau plan de prêt'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du plan *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prêt Express"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du plan de prêt"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Montant min (FCFA)</Label>
                <Input 
                  id="minAmount" 
                  type="number" 
                  value={minAmount} 
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Montant max (FCFA)</Label>
                <Input 
                  id="maxAmount" 
                  type="number" 
                  value={maxAmount} 
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDuration">Durée min (mois)</Label>
                <Input 
                  id="minDuration" 
                  type="number" 
                  value={minDuration} 
                  onChange={(e) => setMinDuration(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">Durée max (mois)</Label>
                <Input 
                  id="maxDuration" 
                  type="number" 
                  value={maxDuration} 
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
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
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fees">Frais de dossier (%)</Label>
                <Input 
                  id="fees" 
                  type="number" 
                  value={fees} 
                  onChange={(e) => setFees(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Conditions requises (une par ligne)</Label>
              <Textarea 
                id="requirements" 
                value={requirements} 
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Ex: Carte d'identité valide&#10;Attestation de revenu&#10;Facture de domicile"
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="isActive">Plan actif</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : planToEdit ? 'Mettre à jour' : 'Créer le plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanPlanDialog;
