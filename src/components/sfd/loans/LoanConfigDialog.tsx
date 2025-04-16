
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from "@/components/ui/label";

interface LoanConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const LoanConfigDialog = ({ isOpen, onClose, onSave }: LoanConfigDialogProps) => {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      minAmount: 50000,
      maxAmount: 5000000,
      minDuration: 3,
      maxDuration: 36,
      baseRate: 5.5,
      gracePeriod: 0,
    }
  });

  const handleSubmit = (data: any) => {
    console.log('Loan configuration updated:', data);
    toast({
      title: "Configuration enregistrée",
      description: "Les paramètres de prêt ont été mis à jour avec succès",
    });
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuration des prêts</DialogTitle>
          <DialogDescription>
            Définissez les paramètres de base pour les prêts de votre SFD
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Montant minimum (FCFA)</Label>
              <Input 
                id="minAmount"
                type="number" 
                {...form.register('minAmount')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Montant maximum (FCFA)</Label>
              <Input 
                id="maxAmount"
                type="number" 
                {...form.register('maxAmount')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minDuration">Durée minimum (mois)</Label>
              <Input 
                id="minDuration"
                type="number" 
                {...form.register('minDuration')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxDuration">Durée maximum (mois)</Label>
              <Input 
                id="maxDuration"
                type="number" 
                {...form.register('maxDuration')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseRate">Taux d'intérêt de base (%)</Label>
              <Input 
                id="baseRate"
                type="number" 
                step="0.1" 
                {...form.register('baseRate')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gracePeriod">Période de grâce (jours)</Label>
              <Input 
                id="gracePeriod"
                type="number" 
                {...form.register('gracePeriod')} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanConfigDialog;
