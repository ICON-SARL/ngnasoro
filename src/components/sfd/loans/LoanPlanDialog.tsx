
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  planToEdit?: LoanPlan | null;
}

interface LoanPlan {
  id?: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
}

const LoanPlanDialog = ({ isOpen, onClose, onSaved, planToEdit }: LoanPlanDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  
  const [formData, setFormData] = useState<LoanPlan>({
    name: '',
    description: '',
    min_amount: 10000,
    max_amount: 500000,
    min_duration: 1,
    max_duration: 12,
    interest_rate: 10,
    fees: 2,
    requirements: [],
    is_active: true
  });
  
  useEffect(() => {
    if (planToEdit) {
      setFormData({
        id: planToEdit.id,
        name: planToEdit.name,
        description: planToEdit.description || '',
        min_amount: planToEdit.min_amount,
        max_amount: planToEdit.max_amount,
        min_duration: planToEdit.min_duration,
        max_duration: planToEdit.max_duration,
        interest_rate: planToEdit.interest_rate,
        fees: planToEdit.fees,
        requirements: planToEdit.requirements || [],
        is_active: planToEdit.is_active
      });
    } else {
      // Reset form when opening for a new plan
      setFormData({
        name: '',
        description: '',
        min_amount: 10000,
        max_amount: 500000,
        min_duration: 1,
        max_duration: 12,
        interest_rate: 10,
        fees: 2,
        requirements: [],
        is_active: true
      });
    }
  }, [planToEdit, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked });
  };
  
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };
  
  const removeRequirement = (index: number) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements.splice(index, 1);
    setFormData({ ...formData, requirements: updatedRequirements });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Erreur',
        description: 'Veuillez fournir un nom pour ce plan',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.min_amount > formData.max_amount) {
      toast({
        title: 'Erreur',
        description: 'Le montant minimum ne peut pas être supérieur au montant maximum',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.min_duration > formData.max_duration) {
      toast({
        title: 'Erreur',
        description: 'La durée minimum ne peut pas être supérieure à la durée maximum',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (formData.id) {
        // Update existing plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update({
            name: formData.name,
            description: formData.description,
            min_amount: formData.min_amount,
            max_amount: formData.max_amount,
            min_duration: formData.min_duration,
            max_duration: formData.max_duration,
            interest_rate: formData.interest_rate,
            fees: formData.fees,
            requirements: formData.requirements,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);
          
        if (error) throw error;
        
        toast({
          title: 'Plan mis à jour',
          description: 'Le plan de prêt a été modifié avec succès',
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert({
            sfd_id: user?.sfd_id,
            name: formData.name,
            description: formData.description,
            min_amount: formData.min_amount,
            max_amount: formData.max_amount,
            min_duration: formData.min_duration,
            max_duration: formData.max_duration,
            interest_rate: formData.interest_rate,
            fees: formData.fees,
            requirements: formData.requirements,
            is_active: formData.is_active
          });
          
        if (error) throw error;
        
        toast({
          title: 'Plan créé',
          description: 'Le nouveau plan de prêt a été créé avec succès',
        });
      }
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving loan plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le plan de prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {planToEdit ? 'Modifier le plan de prêt' : 'Nouveau plan de prêt'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du plan</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Prêt Express"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="is_active">Statut</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    {formData.is_active ? 'Actif' : 'Inactif'}
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description du plan de prêt"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
                <Input
                  id="min_amount"
                  name="min_amount"
                  type="number"
                  min="1000"
                  step="1000"
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
                  min="10000"
                  step="10000"
                  value={formData.max_amount}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_duration">Durée minimum (mois)</Label>
                <Input
                  id="min_duration"
                  name="min_duration"
                  type="number"
                  min="1"
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
                  min="1"
                  value={formData.max_duration}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                <Input
                  id="interest_rate"
                  name="interest_rate"
                  type="number"
                  step="0.1"
                  min="0"
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
                  min="0"
                  value={formData.fees}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Documents requis</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ajouter un document requis"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.requirements.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm">{req}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : planToEdit ? 'Mettre à jour' : 'Créer le plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanPlanDialog;
