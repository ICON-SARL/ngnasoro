
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';

interface EditLoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated: () => void;
  plan: any;
}

export default function EditLoanPlanDialog({ isOpen, onClose, onPlanUpdated, plan }: EditLoanPlanDialogProps) {
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
    is_published: false,
    is_active: true
  });
  
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        interest_rate: plan.interest_rate || 5.5,
        min_amount: plan.min_amount || 10000,
        max_amount: plan.max_amount || 5000000,
        min_duration: plan.min_duration || 1,
        max_duration: plan.max_duration || 24,
        fees: plan.fees || 1.0,
        is_published: plan.is_published || false,
        is_active: plan.is_active || true
      });
    }
  }, [plan]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update(formData)
        .eq('id', plan.id);
      
      if (error) throw error;
      
      onPlanUpdated();
    } catch (error) {
      console.error('Error updating loan plan:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le Plan de Prêt</DialogTitle>
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
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleSwitchChange('is_published', checked)}
              />
              <Label htmlFor="is_published">Publier ce plan de prêt</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Plan actif</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
