
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSubsidyForm } from './useSubsidyForm';
import { REGIONS } from './constants';
import { SfdSelector } from './SfdSelector';
import { AmountInput } from './AmountInput';
import { PrioritySelector } from './PrioritySelector';
import { RegionSelector } from './RegionSelector';
import { TextInputs } from './TextInputs';
import { DocumentsUploader } from './DocumentsUploader';
import { FormActions } from './FormActions';
import { SubsidyRequestCreateProps } from './types';
import { Button } from '@/components/ui/button';

export function SubsidyRequestCreate({ onSuccess }: SubsidyRequestCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    formData,
    isSubmitting,
    availableSfds,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  } = useSubsidyForm(onSuccess);
  
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    setIsOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-primary/90">
        Nouvelle demande
      </Button>
      
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de prêt MEREF</DialogTitle>
            <DialogDescription>
              Créez une demande de prêt MEREF pour un SFD partenaire
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <SfdSelector
                  sfdId={formData.sfd_id}
                  availableSfds={availableSfds}
                  onValueChange={(value) => handleSelectChange('sfd_id', value)}
                />
                
                <AmountInput
                  value={formData.amount}
                  onChange={handleInputChange}
                />
                
                <PrioritySelector
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                />
                
                <RegionSelector
                  value={formData.region}
                  onValueChange={(value) => handleSelectChange('region', value)}
                  regions={REGIONS}
                />
              </div>
              
              <TextInputs
                purpose={formData.purpose}
                justification={formData.justification}
                expectedImpact={formData.expected_impact}
                onChange={handleInputChange}
              />
            </div>
            
            <Separator />
            
            <DocumentsUploader />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Soumission...' : 'Soumettre la demande'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
