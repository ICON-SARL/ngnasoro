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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, X, Check } from 'lucide-react';

const LOAN_PLAN_OPTIONS = [
  "Intrants Agricoles",
  "Culture Maraîchère",
  "Équipements et Machines Agricoles",
  "Élevage Avicole",
  "Embouche Bovine/Ovine",
  "Microcrédit pour Commerce de Proximité",
  "Négoce de Bétail",
  "Transformation Agroalimentaire"
] as const;

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
    
    const maxAllowedRate = 15;
    if (parseFloat(interestRate) > maxAllowedRate) {
      toast({
        title: "Taux d'intérêt trop élevé",
        description: `Le taux d'intérêt ne peut pas dépasser ${maxAllowedRate}% selon les régulations du MEREF.`,
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
