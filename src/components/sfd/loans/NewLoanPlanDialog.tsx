
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewLoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
}

export default function NewLoanPlanDialog({ isOpen, onClose, onPlanCreated }: NewLoanPlanDialogProps) {
  const { activeSfdId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interest_rate: 5.5,
    min_amount: 10000,
    max_amount: 5000000,
    min_duration: 1,
    max_duration: 24,
    fees: 1.0,
    is_published: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_published: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSfdId) {
      console.error('No active SFD ID');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('sfd_loan_plans')
        .insert({
          ...formData,
          sfd_id: activeSfdId,
          is_active: true
        });
      
      if (error) throw error;
      
      onPlanCreated();
    } catch (error) {
      console.error('Error creating loan plan:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Plan de Prêt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
              <Input
                id="interest_rate"
                name="interest_rate"
                type="number"
                step="0.1"
                value={formData.interest_rate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fees">Frais de dossier (%)</Label>
              <Input
                id="fees"
                name="fees"
                type="number"
                step="0.1"
                value={formData.fees}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_amount">Montant minimum</Label>
              <Input
                id="min_amount"
                name="min_amount"
                type="number"
                value={formData.min_amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_amount">Montant maximum</Label>
              <Input
                id="max_amount"
                name="max_amount"
                type="number"
                value={formData.max_amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_duration">Durée minimum (mois)</Label>
              <Input
                id="min_duration"
                name="min_duration"
                type="number"
                value={formData.min_duration}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_duration">Durée maximum (mois)</Label>
              <Input
                id="max_duration"
                name="max_duration"
                type="number"
                value={formData.max_duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_published">Publier ce plan de prêt</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
