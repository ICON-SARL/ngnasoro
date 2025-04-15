
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoanPlan } from '@/types/sfdClients';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  planToEdit: LoanPlan | null;
}

const LoanPlanDialog: React.FC<LoanPlanDialogProps> = ({ 
  isOpen, 
  onClose,
  onSaved,
  planToEdit
}) => {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_amount: 10000,
    max_amount: 5000000,
    min_duration: 1,
    max_duration: 36,
    interest_rate: 5,
    fees: 1,
    is_active: true,
    requirements: [''] as string[],
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name,
        description: planToEdit.description || '',
        min_amount: planToEdit.min_amount,
        max_amount: planToEdit.max_amount,
        min_duration: planToEdit.min_duration,
        max_duration: planToEdit.max_duration,
        interest_rate: planToEdit.interest_rate,
        fees: planToEdit.fees,
        is_active: planToEdit.is_active,
        requirements: planToEdit.requirements?.length ? planToEdit.requirements : [''],
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        description: '',
        min_amount: 10000,
        max_amount: 5000000,
        min_duration: 1,
        max_duration: 36,
        interest_rate: 5,
        fees: 1,
        is_active: true,
        requirements: [''],
      });
    }
  }, [planToEdit, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: updatedRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({ 
      ...prev, 
      requirements: [...prev.requirements, ''] 
    }));
  };

  const removeRequirement = (index: number) => {
    const updatedRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, requirements: updatedRequirements }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du plan est obligatoire",
        variant: "destructive"
      });
      return;
    }

    if (formData.min_amount > formData.max_amount) {
      toast({
        title: "Erreur de validation",
        description: "Le montant minimum ne peut pas être supérieur au montant maximum",
        variant: "destructive"
      });
      return;
    }

    if (formData.min_duration > formData.max_duration) {
      toast({
        title: "Erreur de validation",
        description: "La durée minimum ne peut pas être supérieure à la durée maximum",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Filter out empty requirements
      const requirements = formData.requirements.filter(req => req.trim() !== '');
      
      const planData = {
        ...formData,
        requirements,
        sfd_id: activeSfdId
      };
      
      if (planToEdit) {
        // Update existing plan
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', planToEdit.id)
          .select()
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Plan modifié",
          description: "Le plan de prêt a été mis à jour avec succès",
        });
      } else {
        // Create new plan
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData)
          .select()
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Plan créé",
          description: "Le nouveau plan de prêt a été créé avec succès",
        });
      }
      
      onSaved();
    } catch (error) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le plan de prêt",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Nom du plan</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Microcrédit Agricole"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description détaillée du plan de prêt"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
              <Input
                id="min_amount"
                name="min_amount"
                type="number"
                value={formData.min_amount}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_amount">Montant maximum (FCFA)</Label>
              <Input
                id="max_amount"
                name="max_amount"
                type="number"
                value={formData.max_amount}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min_duration">Durée minimum (mois)</Label>
              <Input
                id="min_duration"
                name="min_duration"
                type="number"
                value={formData.min_duration}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_duration">Durée maximum (mois)</Label>
              <Input
                id="max_duration"
                name="max_duration"
                type="number"
                value={formData.max_duration}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
              <Input
                id="interest_rate"
                name="interest_rate"
                type="number"
                step="0.1"
                value={formData.interest_rate}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fees">Frais (%)</Label>
              <Input
                id="fees"
                name="fees"
                type="number"
                step="0.1"
                value={formData.fees}
                onChange={handleNumberChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is_active" 
              checked={formData.is_active} 
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_active">Plan actif</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Conditions requises</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addRequirement}
              >
                Ajouter une condition
              </Button>
            </div>
            
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={requirement}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Ex: Pièce d'identité valide"
                />
                {formData.requirements.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeRequirement(index)}
                  >
                    &times;
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : planToEdit ? 'Modifier' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanPlanDialog;
